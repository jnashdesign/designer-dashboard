import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Step1 from './Step1_BusinessBasics';
import Step2 from './Step2_AudienceGoals';
import Step3 from './Step3_StyleFeel';
import Step4 from './Step4_ColorPreferences';
import Step5 from './Step5_Inspiration';
import Step6 from './Step6_WrapUp';
import StepSummary from '../StepSummary'
import StepProgress from '../StepProgress';

export default function BrandingWizard() {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = window.location.pathname;

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const stepIndexMap = {
    'step1': 0,
    'step2': 1,
    'step3': 2,
    'step4': 3,
    'step5': 4,
    'step6': 5,
    'summary': 6
  };

  const currentStepKey = location.split('/').pop();
  const stepIndex = stepIndexMap[currentStepKey] ?? 0;

  return (
    <>
      <StepProgress currentStep={stepIndex} />
      <Routes>
        <Route index element={<Navigate to="step1" />} />
        <Route path="step1" element={<Step1 next={() => navigate('step2')} update={updateFormData} data={formData} />} />
        <Route path="step2" element={<Step2 next={() => navigate('step3')} back={() => navigate('step1')} update={updateFormData} data={formData} />} />
        <Route path="step3" element={<Step3 next={() => navigate('step4')} back={() => navigate('step2')} update={updateFormData} data={formData} />} />
        <Route path="step4" element={<Step4 next={() => navigate('step5')} back={() => navigate('step3')} update={updateFormData} data={formData} />} />
        <Route path="step5" element={<Step5 next={() => navigate('step6')} back={() => navigate('step4')} update={updateFormData} data={formData} />} />
        <Route path="step6" element={<Step6 next={() => navigate('summary')} back={() => navigate('step5')} update={updateFormData} data={formData} />} />
        <Route path="summary" element={<StepSummary formData={formData} />} />
      </Routes>
    </>
  );
}