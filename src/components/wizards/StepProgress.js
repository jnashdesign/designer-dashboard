import '../../styles/StepProgress.css';

const steps = [
  'Business',
  'Audience',
  'Style',
  'Color',
  'Inspiration',
  'Finish'
];

export default function StepProgress({ currentStep }) {
  return (
    <div className="stepper">
      {steps.map((label, index) => {
        const isActive = index <= currentStep;
        return (
          <div className={`step ${isActive ? 'active' : ''}`} key={index}>
            <div className="circle">{index + 1}</div>
            <span>{label}</span>
            {index < steps.length - 1 && <div className="line" />}
          </div>
        );
      })}
    </div>
  );
}