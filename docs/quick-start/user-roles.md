
# User Roles & Permissions

Understanding user roles helps you know what you can access and what actions you can perform in Quikle CRM.

## 🎯 User Role Types

### Regular Employee
**Who**: Sales reps, support agents, general team members

**Can Access**:
- Dashboard (overview only)
- Customers (view, edit, add)
- Conversations (view, respond)
- Pipeline (view, move items)
- Quotes & Invoices (create, edit own)
- Analytics (basic reports)
- Onboarding

**Cannot Access**:
- Employee management
- Audit logs
- System settings
- Advanced automation
- Financial approvals over limits

### Manager
**Who**: Team leads, department heads

**Can Access**:
- Everything Regular Employees can access
- Advanced analytics
- Team performance reports
- Pipeline configuration
- Automation setup
- Financial approvals (up to limits)

**Cannot Access**:
- Employee role changes
- System-wide settings
- Audit logs
- Security configurations

### Administrator
**Who**: System admins, business owners

**Can Access**:
- Everything in the system
- Employee management
- Audit logs
- System settings
- Email configuration
- Security settings
- All financial operations

**Special Privileges**:
- Add/remove users
- Change user roles
- Access security logs
- Configure integrations
- System-wide automation

## 📝 Permission Details

### Customer Management
| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| View customers | ✅ | ✅ | ✅ |
| Add customers | ✅ | ✅ | ✅ |
| Edit customers | ✅ | ✅ | ✅ |
| Delete customers | ❌ | ✅ | ✅ |
| Bulk operations | ❌ | ✅ | ✅ |

### Conversations
| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| View conversations | ✅ | ✅ | ✅ |
| Respond to messages | ✅ | ✅ | ✅ |
| Internal notes | ✅ | ✅ | ✅ |
| Delete conversations | ❌ | ✅ | ✅ |
| Export conversations | ❌ | ✅ | ✅ |

### Pipeline Management
| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| View pipeline | ✅ | ✅ | ✅ |
| Move items | ✅ | ✅ | ✅ |
| Add stages | ❌ | ✅ | ✅ |
| Delete stages | ❌ | ❌ | ✅ |
| Configure automation | ❌ | ✅ | ✅ |

### Financial Operations
| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| Create quotes | ✅ | ✅ | ✅ |
| Send invoices | ✅ | ✅ | ✅ |
| Approve up to R10,000 | ❌ | ✅ | ✅ |
| Approve over R10,000 | ❌ | ❌ | ✅ |
| View financial reports | ❌ | ✅ | ✅ |

## ⚠️ Important Security Notes

### For All Users:
- Never share your login credentials
- Log out when finished using the system
- Report suspicious activity immediately
- Keep your profile information updated

### For Administrators:
- Regularly review user permissions
- Monitor audit logs for unusual activity
- Update user roles when team members change positions
- Implement the principle of least privilege

## 💡 Role Change Process

### Requesting Role Changes:
1. Contact your administrator
2. Explain the business need
3. Provide justification for additional permissions
4. Wait for approval

### For Administrators - Changing Roles:
1. Go to Employees page
2. Find the user
3. Click Edit
4. Select new role
5. Provide reason for change
6. Save changes

## 🔧 Best Practices

### Regular Employees:
- Focus on your assigned customers and tickets
- Use internal notes for team communication
- Follow approval workflows for financial documents
- Keep customer information accurate and up-to-date

### Managers:
- Review team performance regularly
- Approve financial documents promptly
- Monitor pipeline progress
- Provide feedback on automation rules

### Administrators:
- Conduct regular permission audits
- Monitor system usage patterns
- Keep security settings updated
- Train users on proper system usage

---

*For role change requests, contact your system administrator.*
