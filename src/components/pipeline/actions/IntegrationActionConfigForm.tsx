
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Action {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  delay?: number;
}

interface IntegrationActionConfigFormProps {
  action: Action;
  updateActionConfig: (actionId: string, configKey: string, value: any) => void;
}

const IntegrationActionConfigForm = ({ action, updateActionConfig }: IntegrationActionConfigFormProps) => {
  const { type, config } = action;

  switch (type) {
    case 'crm_integration':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CRM Platform</Label>
              <Select 
                value={config.crm_platform} 
                onValueChange={(value) => updateActionConfig(action.id, 'crm_platform', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesforce">Salesforce</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="pipedrive">Pipedrive</SelectItem>
                  <SelectItem value="zoho">Zoho CRM</SelectItem>
                  <SelectItem value="custom">Custom CRM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action</Label>
              <Select 
                value={config.action} 
                onValueChange={(value) => updateActionConfig(action.id, 'action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_contact">Create Contact</SelectItem>
                  <SelectItem value="update_contact">Update Contact</SelectItem>
                  <SelectItem value="create_deal">Create Deal</SelectItem>
                  <SelectItem value="update_deal">Update Deal</SelectItem>
                  <SelectItem value="add_note">Add Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Field Mapping (JSON)</Label>
            <Textarea
              value={JSON.stringify(config.mapping, null, 2)}
              onChange={(e) => {
                try {
                  const mapping = JSON.parse(e.target.value);
                  updateActionConfig(action.id, 'mapping', mapping);
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"name": "customer_name", "email": "customer_email"}'
              rows={3}
            />
          </div>
        </div>
      );

    case 'email_platform_integration':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email Platform</Label>
              <Select 
                value={config.platform} 
                onValueChange={(value) => updateActionConfig(action.id, 'platform', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mailchimp">Mailchimp</SelectItem>
                  <SelectItem value="constant_contact">Constant Contact</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="campaign_monitor">Campaign Monitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action</Label>
              <Select 
                value={config.action} 
                onValueChange={(value) => updateActionConfig(action.id, 'action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_to_list">Add to List</SelectItem>
                  <SelectItem value="remove_from_list">Remove from List</SelectItem>
                  <SelectItem value="update_contact">Update Contact</SelectItem>
                  <SelectItem value="send_campaign">Send Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>List ID</Label>
            <Input
              value={config.list_id}
              onChange={(e) => updateActionConfig(action.id, 'list_id', e.target.value)}
              placeholder="Email list identifier..."
            />
          </div>
          <div>
            <Label>Additional Data (JSON)</Label>
            <Textarea
              value={JSON.stringify(config.data, null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  updateActionConfig(action.id, 'data', data);
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"tags": ["customer", "active"], "merge_fields": {}}'
              rows={3}
            />
          </div>
        </div>
      );

    case 'call_webhook':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>URL</Label>
              <Input
                value={config.url}
                onChange={(e) => updateActionConfig(action.id, 'url', e.target.value)}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select 
                value={config.method} 
                onValueChange={(value) => updateActionConfig(action.id, 'method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Request Body (JSON)</Label>
            <Textarea
              value={config.body}
              onChange={(e) => updateActionConfig(action.id, 'body', e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default IntegrationActionConfigForm;
