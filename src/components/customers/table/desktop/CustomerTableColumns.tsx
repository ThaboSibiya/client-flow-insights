
import React from 'react';

interface CustomerTableColumnsProps {
  tableColumns: Array<{ name: string; label: string }>;
}

const CustomerTableColumns = React.memo(({ tableColumns }: CustomerTableColumnsProps) => (
  <thead className="bg-slate-50 border-b border-slate-200">
    <tr>
      {tableColumns.map((column) => (
        <th
          key={column.name}
          className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {column.label}
        </th>
      ))}
      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Contact
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Status
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Tickets
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Created
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
));

CustomerTableColumns.displayName = 'CustomerTableColumns';

export default CustomerTableColumns;
