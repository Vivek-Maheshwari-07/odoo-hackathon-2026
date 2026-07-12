import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/common/Card';
import { Sparkles } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <PageHeader 
          title={title} 
          description={`Access metrics, logging data, and system configurations for ${title.toLowerCase()}.`} 
        />
        
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-white">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="p-4 bg-primary-light text-primary rounded-full shadow-inner animate-pulse">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              Module 2 Showcase
            </h2>
            <p className="text-sm text-text-secondary max-w-md leading-relaxed">
              The {title} interface is scheduled for subsequent modules. Currently, you can interact with the fully operational <strong>Organization Setup</strong> module by selecting it from the left sidebar navigation drawer.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ComingSoon;
