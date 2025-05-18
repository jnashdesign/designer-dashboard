import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ currentSection, totalSections }) => {
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-text">
        Section {currentSection + 1} of {totalSections}
      </div>
    </div>
  );
};

export default ProgressBar; 