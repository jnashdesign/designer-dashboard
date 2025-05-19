import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import brandLogo3D from './brandEZ_logo_icon_3D.png';

const Logo_icon_3D = () => {
  const { isDarkMode } = useTheme();

  return (
    <img 
      src={brandLogo3D}
      alt="BrandEZ Logo 3D" 
      style={{ 
        height: '600px',
        width: 'auto',
      }} 
    />
  );
};

export default Logo_icon_3D; 