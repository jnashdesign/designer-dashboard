import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import brandLogoLight from './brandEZ_logo_icon.svg';
import brandLogoDark from './brandEZ_logo_icon_white.svg';

const Logo_icon = () => {
  const { isDarkMode } = useTheme();

  return (
    <img 
      src={isDarkMode ? brandLogoDark : brandLogoLight}
      alt="BrandEZ Logo" 
      style={{ 
        height: '200px',
        width: 'auto',
      }} 
    />
  );
};

export default Logo_icon; 