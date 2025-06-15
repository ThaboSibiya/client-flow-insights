
import React from 'react';
import { CompanyLogoUploader } from './CompanyLogoUploader';
import { CompanyProfileForm } from './CompanyProfileForm';
import { AiAgentSettings } from '../settings/AiAgentSettings';

const QuoteSettings = () => {
    return (
        <div className="space-y-6">
            <CompanyProfileForm />
            <CompanyLogoUploader />
            <AiAgentSettings />
        </div>
    );
};

export default QuoteSettings;
