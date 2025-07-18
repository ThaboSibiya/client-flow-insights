
import React from 'react';
import { CompanyLogoUploader } from './CompanyLogoUploader';
import { CompanyProfileForm } from './CompanyProfileForm';

const QuoteSettings = () => {
    return (
        <div className="space-y-6">
            <CompanyProfileForm />
            <CompanyLogoUploader />
        </div>
    );
};

export default QuoteSettings;
