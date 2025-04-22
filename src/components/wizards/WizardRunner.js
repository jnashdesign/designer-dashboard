import { useParams, Navigate } from 'react-router-dom';
import BrandingWizard from './branding/BrandingWizard';

export default function WizardRunner() {
  const { type } = useParams();

  if (type === 'branding') {
    return <BrandingWizard />;
  }

  return <Navigate to="/dashboard" />;

}