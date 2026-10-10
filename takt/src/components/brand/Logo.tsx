import React from 'react';
import TaktLogo from './TaktLogo';

export interface LogoProps {
  collapsed?: boolean;
  className?: string;
  subtitle?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  href?: string;
}

export const Logo: React.FC<LogoProps> = (props) => <TaktLogo {...props} />;
export { TaktLogo };
export default TaktLogo;
