# Server-Side PII Encryption Migration Plan

## Executive Summary

**Critical Security Issue**: Current PII encryption uses client-side Web Crypto API with a weak key derivation method (using `VITE_SUPABASE_URL`), making encrypted PII vulnerable to extraction and decryption by anyone with access to the codebase.

**Solution**: Migrate to server-side encryption using Supabase Edge Functions with proper cryptographic key management.

---

## Current State Analysis

### Affected Files
1. **Core Implementation**
   - `src/utils/piiEncryption.ts` - Main encryption utilities
   - `src/hooks/usePIIEncryption.ts` - React hooks for encryption
   - `src/hooks/usePIIAccessLogger.ts` - PII access logging

2. **Services Using PII Encryption**
   - `src/services/formSubmissionService.ts` - Form submissions with customer PII

3. **Components**
   - `src/components/security/MaskedPIIDisplay.tsx` - Masked PII display

### Current Encryption Flow
```
Client → encryptPII() → Web Crypto API → Supabase DB (encrypted)
                ↓
        Weak Key Derivation
        (VITE_SUPABASE_URL + suffix)
```

### Security Vulnerabilities
1. **Weak Key Material**: Uses publicly accessible `VITE_SUPABASE_URL`
2. **Client-Side Key Exposure**: Encryption key derivation logic is in client bundle
3. **No Key Rotation**: Static key derivation with no rotation mechanism
4. **Predictable IV/Salt**: While random, the weakness is in the base key

### Data Requiring Encryption
Based on `formSubmissionService.ts`:
- `customer_name`
- `customer_email`
- `customer_phone`

**Note**: Search for other tables/services that may store PII.

---

## Proposed Server-Side Architecture

### New Encryption Flow
```
Client → Edge Function → Server-Side Crypto → Supabase DB (encrypted)
           ↓                    ↓
        JWT Auth         Strong Key from Secrets
                              ↓
                    AES-256-GCM Encryption
```

### Components

#### 1. **Edge Function: `pii-crypto`**
**Purpose**: Centralized PII encryption/decryption service

**Endpoints**:
- `POST /encrypt` - Encrypt PII data
- `POST /decrypt` - Decrypt PII data
- `POST /encrypt-batch` - Batch encryption
- `POST /decrypt-batch` - Batch decryption

**Request/Response Schema**:
```typescript
// Encrypt Request
{
  "operation": "encrypt",
  "data": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+27123456789"
  },
  "fields": ["customer_name", "customer_email", "customer_phone"]
}

// Encrypt Response
{
  "success": true,
  "data": {
    "customer_name": "encrypted_base64_string_1",
    "customer_email": "encrypted_base64_string_2",
    "customer_phone": "encrypted_base64_string_3"
  }
}

// Decrypt Request
{
  "operation": "decrypt",
  "data": {
    "customer_name": "encrypted_base64_string_1",
    "customer_email": "encrypted_base64_string_2"
  },
  "fields": ["customer_name", "customer_email"]
}
```

**Security Requirements**:
- ✅ JWT authentication required
- ✅ Rate limiting (prevent brute force)
- ✅ Audit logging for all encrypt/decrypt operations
- ✅ Input validation and sanitization
- ✅ Restricted CORS headers (no wildcard)

#### 2. **Secret Management**
**New Secret Required**: `PII_ENCRYPTION_KEY`
- **Type**: 256-bit cryptographically secure random key
- **Generation**: `openssl rand -base64 32`
- **Storage**: Supabase Edge Function Secrets
- **Access**: Only accessible to `pii-crypto` edge function
- **Rotation**: Plan for quarterly rotation with backward compatibility

#### 3. **Client-Side Service Updates**

**New Service**: `src/services/piiCryptoService.ts`
```typescript
/**
 * Client-side wrapper for server-side PII encryption
 */
export async function encryptPIIServer(data: Record<string, string>): Promise<Record<string, string>>
export async function decryptPIIServer(data: Record<string, string>): Promise<Record<string, string>>
export async function encryptPIIFieldsServer<T>(data: T, fields: (keyof T)[]): Promise<T>
export async function decryptPIIFieldsServer<T>(data: T, fields: (keyof T)[]): Promise<T>
```

**Updated Hooks**: `src/hooks/usePIIEncryption.ts`
- Redirect to server-side encryption APIs
- Maintain same interface for backward compatibility
- Add error handling for network failures

---

## Migration Strategy

### Phase 1: Preparation (Week 1)
**Goal**: Set up infrastructure without breaking existing functionality

1. **Create Edge Function**
   - [ ] Create `supabase/functions/pii-crypto/index.ts`
   - [ ] Implement encrypt/decrypt endpoints
   - [ ] Add proper CORS restrictions
   - [ ] Add rate limiting (5 requests/minute per user)
   - [ ] Add comprehensive audit logging

2. **Secret Management**
   - [ ] Generate strong encryption key
   - [ ] Add `PII_ENCRYPTION_KEY` to Supabase secrets
   - [ ] Document key rotation procedure

3. **Client Service Layer**
   - [ ] Create `src/services/piiCryptoService.ts`
   - [ ] Implement server-side encryption wrappers
   - [ ] Add error handling and retry logic
   - [ ] Create fallback mechanism

4. **Testing Infrastructure**
   - [ ] Create test suite for edge function
   - [ ] Test encryption/decryption round-trip
   - [ ] Test batch operations
   - [ ] Test error scenarios

### Phase 2: Parallel Operation (Week 2)
**Goal**: Run both systems simultaneously for validation

1. **Dual Encryption Mode**
   - [ ] Update `formSubmissionService.ts` to use server-side encryption for NEW data
   - [ ] Keep client-side decryption for OLD data
   - [ ] Add migration flag in database to track encryption version

2. **Add Migration Column**
   ```sql
   ALTER TABLE form_submissions 
   ADD COLUMN encryption_version VARCHAR(10) DEFAULT 'client-v1';
   ```

3. **Monitoring**
   - [ ] Monitor edge function performance
   - [ ] Track encryption/decryption success rates
   - [ ] Monitor error logs

### Phase 3: Data Re-encryption (Week 3)
**Goal**: Re-encrypt all existing PII data with server-side encryption

1. **Create Migration Script**
   - [ ] Create edge function `migrate-pii-encryption`
   - [ ] Implement batch re-encryption logic
   - [ ] Add progress tracking
   - [ ] Add rollback capability

2. **Migration Process**
   ```typescript
   // Pseudo-code for migration
   1. Fetch encrypted records (encryption_version = 'client-v1')
   2. Decrypt using old client-side method
   3. Encrypt using new server-side method
   4. Update record with new encrypted data
   5. Set encryption_version = 'server-v1'
   6. Log migration success/failure
   ```

3. **Execution Plan**
   - [ ] Run migration on staging/test environment first
   - [ ] Validate data integrity after migration
   - [ ] Create database backup before production migration
   - [ ] Run production migration during low-traffic period
   - [ ] Monitor for 24 hours post-migration

### Phase 4: Cleanup (Week 4)
**Goal**: Remove old client-side encryption code

1. **Code Removal**
   - [ ] Remove `src/utils/piiEncryption.ts` (client-side)
   - [ ] Update `src/hooks/usePIIEncryption.ts` to only use server
   - [ ] Remove fallback decryption logic
   - [ ] Update all services to use new encryption

2. **Database Cleanup**
   - [ ] Remove `encryption_version` column (optional)
   - [ ] Archive old encryption-related audit logs

3. **Documentation**
   - [ ] Update security documentation
   - [ ] Document new encryption flow
   - [ ] Create runbook for key rotation

---

## Implementation Checklist

### Infrastructure
- [ ] Create `pii-crypto` edge function
- [ ] Generate and store `PII_ENCRYPTION_KEY` secret
- [ ] Configure CORS restrictions (no wildcard)
- [ ] Implement rate limiting
- [ ] Set up audit logging

### Code Changes
- [ ] Create `src/services/piiCryptoService.ts`
- [ ] Update `src/hooks/usePIIEncryption.ts`
- [ ] Update `src/services/formSubmissionService.ts`
- [ ] Add migration column to `form_submissions` table
- [ ] Create data migration edge function

### Testing
- [ ] Unit tests for edge function
- [ ] Integration tests for encryption service
- [ ] End-to-end tests for form submission
- [ ] Performance testing (latency impact)
- [ ] Security testing (penetration test)

### Migration
- [ ] Backup database
- [ ] Run migration script on test data
- [ ] Validate data integrity
- [ ] Execute production migration
- [ ] Monitor for 24 hours
- [ ] Remove old code

### Documentation
- [ ] Update security documentation
- [ ] Document encryption flow
- [ ] Create key rotation procedure
- [ ] Update developer onboarding docs

---

## Risk Assessment

### High Risk
1. **Data Loss During Migration**
   - **Mitigation**: Full database backup, staged rollout, comprehensive testing
   
2. **Decryption Failures**
   - **Mitigation**: Keep old decryption method during transition, thorough testing

3. **Performance Impact**
   - **Mitigation**: Batch operations, caching strategy, load testing

### Medium Risk
4. **Edge Function Downtime**
   - **Mitigation**: Retry logic, fallback mechanism, monitoring

5. **Key Compromise**
   - **Mitigation**: Key rotation procedure, audit logging, access controls

### Low Risk
6. **Increased Latency**
   - **Mitigation**: Optimize edge function, use batch operations, cache where appropriate

---

## Success Criteria

1. ✅ All PII data encrypted with server-side method
2. ✅ Zero data loss during migration
3. ✅ No client-side access to encryption keys
4. ✅ Comprehensive audit trail for all PII access
5. ✅ < 200ms additional latency for encryption operations
6. ✅ 99.9% encryption/decryption success rate
7. ✅ All old client-side encryption code removed

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Preparation | 1 week | Edge function, secrets, client service |
| Phase 2: Parallel Operation | 1 week | Dual encryption, monitoring |
| Phase 3: Data Re-encryption | 1 week | Migration script, data migrated |
| Phase 4: Cleanup | 1 week | Old code removed, docs updated |
| **Total** | **4 weeks** | Secure server-side PII encryption |

---

## Key Rotation Procedure (Future)

1. Generate new encryption key (`PII_ENCRYPTION_KEY_V2`)
2. Update edge function to support both keys
3. Re-encrypt all data with new key (similar to Phase 3)
4. Update edge function to use only new key
5. Archive old key securely
6. Update documentation

**Recommended Rotation Schedule**: Quarterly or after security incident

---

## Next Steps

1. **Review and Approve Plan**: Security team review
2. **Allocate Resources**: Assign developers and timeline
3. **Begin Phase 1**: Create edge function and infrastructure
4. **Set Up Monitoring**: Dashboard for tracking progress
5. **Communication**: Notify stakeholders of migration schedule

---

## References

- [NIST Encryption Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Web Crypto API vs Server-Side Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Owner**: Security Team  
**Status**: Planning Phase
