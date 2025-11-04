# Finance Role Setup Guide

## Overview
This guide explains how to assign finance roles to employees and configure permissions for the finance management system.

## Finance Roles

### Available Roles
1. **Finance Admin** (`finance_admin`)
   - Full access to all finance features
   - Can manage roles and permissions
   - Can delete records
   - Can export data

2. **Finance Manager** (`finance_manager`)
   - Can create and edit financial records
   - Can view audit logs
   - Can generate statements
   - Cannot delete records or manage roles

3. **Sales View Only** (`sales_view_only`)
   - Read-only access to financial data
   - Can view notes and transactions
   - Cannot create, edit, or delete
   - Cannot access audit logs

4. **None** (`none`)
   - No access to finance features
   - Default role for all employees

## Assigning Roles

### Prerequisites
Before assigning finance roles, ensure:
1. The employee exists in the `employees` table
2. The employee has a record in the `employee_privileges` table
3. You have finance admin access

### Method 1: Using SQL (Recommended for initial setup)

#### Step 1: Find the employee ID
```sql
SELECT id, email, first_name, last_name 
FROM employees 
WHERE email = 'employee@company.com';
```

#### Step 2: Check if employee_privileges record exists
```sql
SELECT id, employee_id, finance_role 
FROM employee_privileges 
WHERE employee_id = 'employee-uuid-here';
```

#### Step 3: Create employee_privileges if it doesn't exist
```sql
INSERT INTO employee_privileges (
  employee_id,
  privilege_name,
  finance_role
) VALUES (
  'employee-uuid-here',
  'Finance Access',
  'finance_admin'  -- or 'finance_manager' or 'sales_view_only'
);
```

#### Step 4: Update existing finance role
```sql
UPDATE employee_privileges
SET finance_role = 'finance_admin'  -- or other role
WHERE employee_id = 'employee-uuid-here';
```

### Method 2: Using Supabase Dashboard

1. Navigate to your Supabase project
2. Go to **Table Editor**
3. Select the **employee_privileges** table
4. Find the employee record
5. Update the **finance_role** column
6. Save changes

### Method 3: Programmatically (Future implementation)

A role management UI can be built using the `useFinancePermissions` hook:

```typescript
import { supabase } from '@/integrations/supabase/client';

async function assignFinanceRole(
  employeeId: string, 
  role: 'finance_admin' | 'finance_manager' | 'sales_view_only' | 'none'
) {
  const { data, error } = await supabase
    .from('employee_privileges')
    .update({ finance_role: role })
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Failed to assign role:', error);
    return false;
  }

  return true;
}
```

## Verification

### Verify Role Assignment
```sql
SELECT 
  e.email,
  e.first_name,
  e.last_name,
  ep.finance_role,
  ep.updated_at
FROM employees e
JOIN employee_privileges ep ON e.id = ep.employee_id
WHERE ep.finance_role != 'none'
ORDER BY ep.updated_at DESC;
```

### Test Permissions
1. Log in as the employee
2. Navigate to a finance page
3. Verify the appropriate UI elements are visible/hidden based on role
4. Check the role badge displays correctly

## Common Scenarios

### Scenario 1: New Finance Team Member
```sql
-- Assign finance manager role to new team member
UPDATE employee_privileges
SET finance_role = 'finance_manager'
WHERE employee_id = (
  SELECT id FROM employees WHERE email = 'newfinance@company.com'
);
```

### Scenario 2: Promote to Finance Admin
```sql
-- Promote existing finance manager to admin
UPDATE employee_privileges
SET finance_role = 'finance_admin'
WHERE employee_id = (
  SELECT id FROM employees WHERE email = 'manager@company.com'
);
```

### Scenario 3: Give Sales Team View Access
```sql
-- Grant read-only access to sales team
UPDATE employee_privileges ep
SET finance_role = 'sales_view_only'
FROM employees e
WHERE ep.employee_id = e.id
AND e.department = 'Sales';
```

### Scenario 4: Remove Finance Access
```sql
-- Remove finance access when employee changes roles
UPDATE employee_privileges
SET finance_role = 'none'
WHERE employee_id = (
  SELECT id FROM employees WHERE email = 'former@company.com'
);
```

## Best Practices

### Security
1. **Principle of Least Privilege**: Only grant the minimum necessary permissions
2. **Regular Audits**: Review role assignments quarterly
3. **Document Changes**: Use the audit log to track role modifications
4. **Separation of Duties**: Don't assign too many admin roles

### Role Assignment Guidelines
- **Finance Admins**: Limit to 1-2 trusted individuals
- **Finance Managers**: Primary finance team members (3-5 people)
- **Sales View Only**: Sales team who need to check customer balances
- **None**: All other employees

### Onboarding New Team Members
1. Create employee record
2. Assign appropriate finance role based on job function
3. Provide role-specific training
4. Document the assignment in your internal system
5. Schedule review after probation period

### Offboarding
1. Immediately set finance_role to 'none'
2. Review audit logs for their recent activities
3. Transfer ownership of any pending items
4. Document the access removal

## Troubleshooting

### User Can't Access Finance Features

**Check 1: Verify role assignment**
```sql
SELECT e.email, ep.finance_role
FROM employees e
LEFT JOIN employee_privileges ep ON e.id = ep.employee_id
WHERE e.email = 'user@company.com';
```

**Check 2: Verify employee_privileges record exists**
```sql
SELECT * FROM employee_privileges 
WHERE employee_id = (SELECT id FROM employees WHERE email = 'user@company.com');
```

**Check 3: Check user's auth status**
```sql
SELECT e.id, e.email, e.auth_user_id
FROM employees e
WHERE e.email = 'user@company.com';
```

### Permission Errors in Console

1. Check browser console for specific errors
2. Verify RLS policies are enabled on finance tables
3. Ensure user is properly authenticated
4. Check that `has_finance_permission` function is working

### Role Not Updating

1. Clear browser cache and cookies
2. Log out and log back in
3. Check for PostgreSQL function errors in Supabase logs
4. Verify the finance_role enum includes all expected values

## Audit Trail

All role changes should be logged. Check the audit log:

```sql
SELECT 
  fal.*,
  e.email as performed_by
FROM finance_audit_logs fal
JOIN employees e ON fal.employee_id = e.id
WHERE fal.resource_type = 'employee_privileges'
ORDER BY fal.created_at DESC
LIMIT 20;
```

## Support

If you encounter issues:
1. Check this documentation
2. Review the Finance Security Documentation
3. Check Supabase logs for errors
4. Contact your system administrator

## Examples

### Bulk Role Assignment Script
```sql
-- Assign finance_manager to multiple employees
UPDATE employee_privileges ep
SET finance_role = 'finance_manager'
FROM employees e
WHERE ep.employee_id = e.id
AND e.email IN (
  'finance1@company.com',
  'finance2@company.com',
  'finance3@company.com'
);
```

### Generate Role Report
```sql
SELECT 
  ep.finance_role,
  COUNT(*) as employee_count,
  string_agg(e.email, ', ') as employees
FROM employee_privileges ep
JOIN employees e ON ep.employee_id = e.id
WHERE ep.finance_role != 'none'
GROUP BY ep.finance_role;
```

### Recent Role Changes
```sql
SELECT 
  e.email,
  ep.finance_role,
  ep.updated_at,
  EXTRACT(EPOCH FROM (NOW() - ep.updated_at))/3600 as hours_ago
FROM employee_privileges ep
JOIN employees e ON ep.employee_id = e.id
WHERE ep.updated_at > NOW() - INTERVAL '7 days'
AND ep.finance_role != 'none'
ORDER BY ep.updated_at DESC;
```
