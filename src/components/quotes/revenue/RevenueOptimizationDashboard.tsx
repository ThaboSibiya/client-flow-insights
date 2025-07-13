
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const RevenueOptimizationDashboard = () => {
  const revenueMetrics = [
    {
      title: "Total Revenue",
      value: "$45,280",
      change: "+12%",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Conversion Rate",
      value: "68%",
      change: "+5%",
      trend: "up",
      icon: Target
    },
    {
      title: "Avg. Quote Value",
      value: "$2,150",
      change: "-3%",
      trend: "down",
      icon: BarChart3
    },
    {
      title: "Response Time",
      value: "2.3 days",
      change: "-15%",
      trend: "up",
      icon: Clock
    }
  ];

  const optimizationSuggestions = [
    {
      title: "Increase Quote Follow-ups",
      description: "42% of your quotes haven't received a follow-up after 7 days",
      impact: "High",
      effort: "Low"
    },
    {
      title: "Optimize Pricing Strategy",
      description: "Your quotes are 15% below market average",
      impact: "High",
      effort: "Medium"
    },
    {
      title: "Faster Response Times",
      description: "Reduce quote creation time by using templates",
      impact: "Medium",
      effort: "Low"
    },
    {
      title: "Payment Terms Optimization",
      description: "Consider offering early payment discounts",
      impact: "Medium",
      effort: "Low"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-quikle-slate">{metric.title}</p>
                  <p className="text-2xl font-bold text-quikle-charcoal">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="bg-quikle-crystal p-3 rounded-full">
                  <metric.icon className="h-6 w-6 text-quikle-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gradient-to-br from-quikle-crystal to-quikle-platinum rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-16 w-16 text-quikle-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Revenue Analytics</h3>
              <p className="text-quikle-slate">Interactive charts and analytics will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="border border-quikle-silver/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-quikle-charcoal mb-2">{suggestion.title}</h4>
                    <p className="text-sm text-quikle-slate mb-3">{suggestion.description}</p>
                    <div className="flex gap-2">
                      <Badge variant={suggestion.impact === 'High' ? 'default' : 'secondary'}>
                        {suggestion.impact} Impact
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.effort} Effort
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="ml-4">
                    Implement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Revenue Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col">
              <Target className="h-6 w-6 mb-2" />
              Set Revenue Goals
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Analyze Pricing
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOptimizationDashboard;
