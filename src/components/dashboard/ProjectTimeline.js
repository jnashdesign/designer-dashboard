import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './ProjectTimeline.css';

const steps = [
  'Discovery',
  'Strategy',
  'Concept Development',
  'Feedback',
  'Revisions',
  'Brand Identity',
  'Delivery'
];

const ProjectTimeline = ({ currentStep = 0 }) => {
  return (
    <div className="project-timeline">
      <div className="timeline-line" />
      {steps.map((step, index) => (
        <OverlayTrigger
          key={step}
          placement="top"
          overlay={
            <Tooltip id={`tooltip-${step}`}>
              {step}
            </Tooltip>
          }
        >
          <div 
            className={`timeline-dot ${index <= currentStep ? 'completed' : ''}`}
            style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
          />
        </OverlayTrigger>
      ))}
    </div>
  );
};

export default ProjectTimeline; 