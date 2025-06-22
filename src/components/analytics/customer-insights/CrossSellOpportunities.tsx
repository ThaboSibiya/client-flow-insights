
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { CrossSellOpportunity, CustomerInsightsSettings } from './types';

interface CrossSellOpportunitiesProps {
  settings: CustomerInsightsSettings['crossSell'];
  onUpdateSettings: (settings: CustomerInsightsSettings['crossSell']) => void;
}

const CrossSellOpportunities = ({ settings, onUpdateSettings }: CrossSellOpportunitiesProps) => {
  const [opportunities, setOpportunities] = useState<CrossSellOpportunity[]>([
    {
      id: '1',
      customerId: 'cust-1',
      customerName: 'Acme Corporation',
      opportunityType: 'product_upgrade',
      suggestedProduct: 'Premium Service Package',
      estimatedValue: 2500,
      probability: 0.85,
      reasoning: [
        'Heavy usage of current basic plan',
        'Recent inquiries about advanced features',
        'Growing team size indicates need for more resources'
      ],
      bestContactTime: '2024-01-25T14:00:00Z',
      priority: 'high',
      status: 'identified'
    },
    {
      id: '2',
      customerId: 'cust-2',
      customerName: 'Tech Solutions Ltd',
      opportunityType: 'additional_service',
      suggestedProduct: '24/7 Support Add-on',
      estimatedValue: 800,
      probability: 0.72,
      reasoning: [
        'Multiple after-hours support requests',
        'Mission-critical operations require constant uptime',
        'Previous positive feedback on support quality'
      ],
      bestContactTime: '2024-01-24T10:30:00Z',
      priority: 'medium',
      status: 'identified'
    },
    {
      id: '3',
      customerId: 'cust-3',
      customerName: 'Global Industries',
      opportunityType: 'bundle_offer',
      suggestedProduct: 'Complete Business Solution Bundle',
      estimatedValue: 5000,
      probability: 0.65,
      reasoning: [
        'Using multiple individual services that could be bundled',
        'Cost optimization discussions in recent meetings',
        'Expanding to multiple locations'
      ],
      bestContactTime: '2024-01-26T16:00:00Z',
      priority: 'high',
      status: 'pitched'
    },
    {
      id: '4',
      customerId: 'cust-4',
      customerName: 'Startup Inc',
      opportunityType: 'premium_plan',
      suggestedProduct: 'Enterprise Plan',
      estimatedValue: 1200,
      probability: 0.58,
      reasoning: [
        'Rapid growth phase with increasing needs',
        'Team expansion requires more user licenses',
        'Interest expressed in advanced analytics features'
      ],
      bestContactTime: '2024-01-27T11:00:00Z',
      priority: 'medium',
      status: 'identified'
    }
  ]);

  const updateSettings = (updates: Partial<CustomerInsightsSettings['crossSell']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const updateOpportunityStatus = (opportunityId: string, status: CrossSellOpportunity['status']) => {
    setOpportunities(prev =>
      prev.map(opp =>
        opp.id === opportunityId ? { ...opp, status } : opp
      )
    );
    toast.success(`Opportunity status updated to ${status}`);
  };

  const contactCustomer = (opportunityId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      toast.success(`Contacting ${opportunity.customerName} about ${opportunity.suggestedProduct}`);
      updateOpportunityStatus(opportunityId, 'pitched');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pitched': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimatedValue * opp.probability), 0);
  const highPriorityOpps = opportunities.filter(opp => opp.priority === 'high').length;
  const readyToContact = opportunities.filter(opp => opp.status === 'identified').length;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Cross-sell Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="crosssell-enabled">Enable Cross-sell Identification</Label>
            <Switch
              id="crosssell-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Probability</Label>
              <Select 
                value={settings.minProbability.toString()} 
                onValueChange={(value) => updateSettings({ minProbability: parseFloat(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.4">40%</SelectItem>
                  <SelectItem value="0.6">60%</SelectItem>
                  <SelectItem value="0.8">80%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Update Frequency</Label>
              <Select value={settings.updateFrequency} onValueChange={(value: any) => updateSettings({ updateFrequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{opportunities.length}</div>
            <div className="text-sm text-muted-foreground">Total Opportunities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{highPriorityOpps}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{readyToContact}</div>
            <div className="text-sm text-muted-foreground">Ready to Contact</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">${Math.round(totalValue).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Expected Value</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Cross-sell Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{opportunity.customerName}</h4>
                    <Badge className={getPriorityColor(opportunity.priority)}>
                      {opportunity.priority} Priority
                    </Badge>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {opportunity.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${opportunity.estimatedValue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {Math.round(opportunity.probability * 100)}%
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h5 className="font-medium text-lg text-blue-600 mb-1">{opportunity.suggestedProduct}</h5>
                  <p className="text-sm text-muted-foreground capitalize">{opportunity.opportunityType.replace('_', ' ')}</p>
                </div>

                <div className="mb-4">
                  <h6 className="font-medium text-sm mb-2">Why this makes sense:</h6>
                  <ul className="space-y-1">
                    {opportunity.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 text-xs mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Best time to contact: {new Date(opportunity.bestContactTime).toLocaleString()}
                  </div>
                  
                  <div className="flex gap-2">
                    {opportunity.status === 'identified' && (
                      <Button 
                        size="sm" 
                        onClick={() => contactCustomer(opportunity.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Contact Customer
                      </Button>
                    )}
                    {opportunity.status === 'pitched' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateOpportunityStatus(opportunity.id, 'converted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Converted
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateOpportunityStatus(opportunity.id, 'declined')}
                        >
                          Mark Declined
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossSellOpportunities;
