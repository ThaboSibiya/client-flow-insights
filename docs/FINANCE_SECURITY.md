# Finance System Security Documentation

## Overview
This document outlines the security measures implemented in the finance management system to protect sensitive financial data and ensure compliance with data protection regulations.

## Role-Based Access Control (RBAC)

### Finance Roles
The system implements three distinct finance roles:

1. **Finance Admin (`finance_admin`)**
   - Full access to all finance features
   - Can create, edit, and delete all financial records
   - Can manage user roles and permissions
   - Can view and export audit logs
   - Can generate and send statements

2. **Finance Manager (`finance_manager`)**
   - Full read/write access to financial data
   - Can create, edit financial records
   - Cannot delete records (admin only)
   - Can view audit logs
   - Can generate statements

3. **Sales View Only (`sales_view_only`)**
   - Read-only access to financial data
   - Can view notes and transaction history
   - Cannot create, edit, or delete records
   - Cannot access audit logs
   - Cannot generate statements

4. **None (`none`)**
   - No access to finance features
   - Default role for non-finance employees

### Assigning Roles
Finance roles are assigned through the `employee_privileges` table:

```sql
UPDATE employee_privileges
SET finance_role = 'finance_admin'
WHERE employee_id = 'employee-uuid';
```

## Data Encryption

### Encryption at Rest
All data stored in Supabase PostgreSQL database is encrypted at rest using AES-256 encryption. This includes:
- Customer financial information
- Transaction records
- Payment details
- Invoice data
- Debtor notes
- Account flags

### Encryption in Transit
All data transmitted between the client and server is encrypted using TLS 1.3:
- HTTPS connections for all API calls
- WebSocket connections for real-time updates
- Supabase client automatically handles TLS encryption

### Sensitive Data Protection
The following sensitive fields require special handling:
- Payment methods
- Bank account numbers (if implemented)
- Credit card information (should never be stored)
- Financial amounts
- Personal identification numbers

**Best Practices:**
- Never log sensitive financial data to console
- Use environment variables for API keys
- Implement field-level encryption for highly sensitive data if needed
- Redact sensitive information in error messages

## Audit Logging

### What Gets Logged
Every finance-related action is logged in the `finance_audit_logs` table:

- **View Actions**: When users access financial records
- **Create Actions**: New invoices, payments, notes, transactions
- **Update Actions**: Modifications to existing records (with before/after values)
- **Delete Actions**: Record deletions (with old values)
- **Payment Actions**: Payment processing events
- **Export Actions**: Data exports and report generation
- **Statement Generation**: PDF statement creation

### Audit Log Structure
Each audit log entry contains:
```typescript
{
  id: UUID,
  user_id: UUID,              // Who performed the action
  employee_id: UUID,          // Employee record reference
  action_type: string,        // view, create, update, delete, etc.
  resource_type: string,      // invoice, payment, note, etc.
  resource_id: UUID,          // The record affected
  customer_id: UUID,          // Customer associated with action
  old_values: JSONB,          // Previous state (for updates/deletes)
  new_values: JSONB,          // New state (for creates/updates)
  ip_address: string,         // Client IP
  user_agent: string,         // Browser/client info
  session_id: string,         // Session identifier
  metadata: JSONB,            // Additional context
  created_at: timestamp       // When the action occurred
}
```

### Using Audit Logs

**Backend (Automatic):**
The system automatically logs actions through database triggers and the `log_finance_action` function.

**Frontend (Manual):**
Use the `financeAuditService` for manual logging:

```typescript
import { financeAuditService } from '@/services/financeAuditService';

// Log a payment
await financeAuditService.logPayment({
  amount: 1000,
  customer_id: 'customer-uuid'
}, 'customer-uuid');

// Log a statement generation
await financeAuditService.logStatementGenerated(
  'customer-uuid',
  { format: 'pdf', delivery: 'email' }
);

// Log data export
await financeAuditService.logExport(
  'transaction',
  'customer-uuid',
  { exportType: 'csv', recordCount: 150 }
);
```

### Viewing Audit Logs
Only users with `finance_admin` or `finance_manager` roles can view audit logs:

```typescript
// Get all logs for a customer
const logs = await financeAuditService.getAuditLogs({
  customerId: 'customer-uuid',
  limit: 100
});

// Filter by action type
const paymentLogs = await financeAuditService.getAuditLogs({
  actionType: 'payment',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31')
});
```

## Row-Level Security (RLS)

### Policy Implementation
All finance tables have RLS policies enforcing role-based access:

**Customer Finance Summary:**
- View: Requires `view_only` permission
- Insert/Update: Requires `full_access` permission
- Delete: Requires `admin_only` permission

**Invoices, Payments, Transactions:**
- Same permission structure as above
- Users can only access records they own (`user_id` match)

**Finance Notes:**
- Finance roles: Read/write access
- Sales: Read-only access

**Account Flags:**
- Finance admins: Full access
- Finance managers: Create/update only
- Sales: View only

### Permission Checking
The `has_finance_permission` function validates access:

```sql
-- Check if user has view access
SELECT has_finance_permission(auth.uid(), 'view_only');

-- Check if user has full access
SELECT has_finance_permission(auth.uid(), 'full_access');

-- Check if user has admin access
SELECT has_finance_permission(auth.uid(), 'admin_only');
```

## Security Best Practices

### For Developers

1. **Never bypass RLS policies** - Always use authenticated Supabase client
2. **Validate input** - Sanitize all user input before processing
3. **Use prepared statements** - Prevent SQL injection (Supabase client handles this)
4. **Log all sensitive operations** - Use audit logging for compliance
5. **Handle errors gracefully** - Don't expose sensitive data in error messages
6. **Implement rate limiting** - Prevent abuse of finance endpoints
7. **Use HTTPS only** - Never use unencrypted connections
8. **Regular security audits** - Review permissions and access logs

### For System Administrators

1. **Assign roles carefully** - Follow principle of least privilege
2. **Review audit logs regularly** - Monitor for suspicious activity
3. **Rotate credentials** - Update API keys and passwords periodically
4. **Monitor failed access attempts** - Set up alerts for unauthorized access
5. **Backup data regularly** - Maintain encrypted backups
6. **Document role changes** - Keep records of permission modifications
7. **Implement 2FA** - Require two-factor authentication for finance roles
8. **Regular permission reviews** - Audit role assignments quarterly

## Compliance Considerations

### Data Protection Regulations
- **GDPR**: Right to access, right to erasure implemented
- **PCI DSS**: Never store full credit card numbers
- **SOX**: Audit trails maintained for all financial transactions
- **ISO 27001**: Access controls and logging meet requirements

### Data Retention
- Audit logs: Retained for 7 years (configurable)
- Financial records: Retained per legal requirements
- Deleted records: Soft delete with audit trail maintained

### Privacy
- Personal financial information encrypted
- Access logged and monitored
- Data minimization principle followed
- User consent tracked

## Incident Response

### Security Breach Protocol
1. Identify affected systems and data
2. Contain the breach (revoke compromised credentials)
3. Review audit logs to determine scope
4. Notify affected parties per regulations
5. Implement additional security measures
6. Document incident and response

### Contact Information
For security concerns or incidents:
- Security Team: security@yourcompany.com
- Compliance Officer: compliance@yourcompany.com
- Emergency Hotline: [Your Emergency Contact]

## Regular Audits

### Monthly Reviews
- Review access logs for anomalies
- Check for inactive accounts with finance access
- Verify role assignments are current

### Quarterly Reviews
- Full permission audit
- Security policy review
- Compliance documentation update
- Employee security training

### Annual Reviews
- Comprehensive security assessment
- Third-party security audit
- Disaster recovery testing
- Policy and procedure updates
