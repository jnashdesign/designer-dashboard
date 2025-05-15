import React from 'react';
import aiIcon from '../../assets/icons/ai-icon.png';
import epsIcon from '../../assets/icons/eps-icon.png';
import svgIcon from '../../assets/icons/svg-icon.png';
import pdfIcon from '../../assets/icons/pdf-icon.png';

const FilePreview = ({ file, width = 50 }) => {
  console.log('File type:', file.type); // Temporary debug log
  
  const getFileIcon = (fileType) => {
    const iconMap = {
      'application/pdf': pdfIcon,
      'application/illustrator': aiIcon,
      'image/svg+xml': svgIcon,
      'application/eps': epsIcon,
      'application/x-eps': epsIcon,
      'application/postscript': epsIcon,  // Common EPS MIME type
      'application/octet-stream': epsIcon, // Another common EPS MIME type
      'image/x-eps': epsIcon,             // Another variation
      'image/eps': epsIcon,               // Another variation
      'image/png': null,
      'image/jpeg': null,
      'image/jpg': null,
      'default': pdfIcon
    };

    // If it's an EPS file based on extension but type isn't matching
    if (file.name?.toLowerCase().endsWith('.eps')) {
      return epsIcon;
    }

    return iconMap[fileType] || iconMap.default;
  };

  const isPreviewable = file.type.startsWith('image/') && 
    (file.type !== 'image/svg+xml');

  return (
    <div className="file-preview">
      {isPreviewable ? (
        <img 
          src={file.url} 
          alt={file.name}
          style={{
            width: `${width}px`,
            height: `${width}px`,
            objectFit: 'cover',
            borderRadius: '4px'
          }}
        />
      ) : (
        <div className="file-icon" style={{
          width: `${width}px`,
          height: `${width}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <img 
            src={getFileIcon(file.type)}
            alt={file.type}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '8px'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FilePreview; 