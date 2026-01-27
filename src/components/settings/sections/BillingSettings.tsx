
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Package, Receipt, AlertCircle, CheckCircle2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const BillingSettings = () => {
  // Mock data - would come from Stripe/billing integration
  const currentPlan = {
    name: 'Professional',
    price: 49,
    interval: 'month',
    features: ['Unlimited customers', '5 team members', 'Priority support', 'API access'],
    usage: {
      customers: { used: 127, limit: 'Unlimited' },
      team: { used: 3, limit: 5 },
      storage: { used: 2.4, limit: 10, unit: 'GB' },
    }
  };

  const paymentMethod = {
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
  };

  const invoices = [
    { id: 'INV-001', date: '2024-01-01', amount: 49.00, status: 'paid' },
    { id: 'INV-002', date: '2023-12-01', amount: 49.00, status: 'paid' },
    { id: 'INV-003', date: '2023-11-01', amount: 49.00, status: 'paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-quikle-primary/20 bg-gradient-to-br from-quikle-primary/5 to-quikle-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-quikle-primary" />
              <CardTitle>Current Plan</CardTitle>
            </div>
            <Badge className="bg-quikle-primary text-white">
              {currentPlan.name}
            </Badge>
          </div>
          <CardDescription>
            Your subscription renews on January 15, 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-quikle-charcoal">${currentPlan.price}</span>
            <span className="text-quikle-slate/70">/{currentPlan.interval}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Usage */}
          <div className="space-y-4">
            <h4 className="font-medium text-quikle-charcoal">Current Usage</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Team Members</span>
                  <span>{currentPlan.usage.team.used} / {currentPlan.usage.team.limit}</span>
                </div>
                <Progress value={(currentPlan.usage.team.used / currentPlan.usage.team.limit) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage</span>
                  <span>{currentPlan.usage.storage.used} / {currentPlan.usage.storage.limit} {currentPlan.usage.storage.unit}</span>
                </div>
                <Progress value={(currentPlan.usage.storage.used / currentPlan.usage.storage.limit) * 100} className="h-2" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button>Upgrade Plan</Button>
            <Button variant="outline">Compare Plans</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-quikle-primary" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-quikle-crystal/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <CreditCard className="h-5 w-5 text-quikle-primary" />
              </div>
              <div>
                <p className="font-medium">{paymentMethod.type} ending in {paymentMethod.last4}</p>
                <p className="text-sm text-quikle-slate/70">Expires {paymentMethod.expiry}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Add New</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-quikle-primary" />
            Billing History
          </CardTitle>
          <CardDescription>
            View and download past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="flex items-center justify-between p-3 hover:bg-quikle-crystal/30 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-quikle-slate/60" />
                  <div>
                    <p className="font-medium text-sm">{invoice.id}</p>
                    <p className="text-xs text-quikle-slate/70">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Cancel Subscription
          </CardTitle>
          <CardDescription>
            Cancel your subscription and downgrade to the free plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Cancel Subscription</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings;
