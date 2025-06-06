import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import brandLogoLight from './brandEZ_logo.svg';
import brandLogoDark from './brandEZ_logo_white.svg';

const Logo = () => {
  const { isDarkMode } = useTheme();

  return (
    <img 
      src={isDarkMode ? brandLogoDark : brandLogoLight}
      alt="BrandEZ Logo" 
      style={{ 
        height: '70px',
        width: 'auto',
        marginTop: '-15px'
      }} 
    />
  );
};

export default Logo; 