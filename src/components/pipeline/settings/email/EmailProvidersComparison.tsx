
import React from 'react';

const EmailProvidersComparison = () => {
  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="font-semibold mb-4">Quick Comparison for South African Businesses</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Provider</th>
              <th className="text-left p-2">Free Tier</th>
              <th className="text-left p-2">Best For</th>
              <th className="text-left p-2">SA Connectivity</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-medium">Resend</td>
              <td className="p-2">3,000/month</td>
              <td className="p-2">Startups, modern apps</td>
              <td className="p-2">Good</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">SendGrid</td>
              <td className="p-2">100/day</td>
              <td className="p-2">Established businesses</td>
              <td className="p-2">Excellent</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Mailgun</td>
              <td className="p-2">5,000 (3 months)</td>
              <td className="p-2">Developers, high volume</td>
              <td className="p-2">Good (EU region)</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Postmark</td>
              <td className="p-2">100 test emails</td>
              <td className="p-2">Mission-critical emails</td>
              <td className="p-2">Excellent</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailProvidersComparison;
