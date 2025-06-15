
import React from 'react';
import { CompanyLogoUploader } from './CompanyLogoUploader';
import { CompanyProfileForm } from './CompanyProfileForm';
import { AiAgentSettings } from '../settings/AiAgentSettings';
import KnowledgeBaseManager from '../settings/KnowledgeBaseManager';

const QuoteSettings = () => {
    return (
        <div className="space-y-6">
            <CompanyProfileForm />
            <CompanyLogoUploader />
            <AiAgentSettings />
            <KnowledgeBaseManager />
        </div>
    );
};

export default QuoteSettings;
