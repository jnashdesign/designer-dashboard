// src/components/wizards/WizardRunner.js
import React from 'react';
import { useParams } from 'react-router-dom';
import BrandingWizard from './branding/BrandingWizard';

export default function WizardRunner() {
  const { type } = useParams();

  if (type === 'branding') {
    return <BrandingWizard />;
  }

  return (
    <div className="container">
      <h2>{type.charAt(0).toUpperCase() + type.slice(1)} Discovery Wizard</h2>
      <p>Wizard type not implemented yet.</p>
    </div>
  );
}
