
import React, { useState } from 'react';
import AuditLogManager from '@/components/audit-log/AuditLogManager';

const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AuditLogManager 
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    />
  );
};

export default AuditLog;
