import React from 'react';
import './Button.scss';

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  children?: JSX.Element | string;
};

const Button = ({ onClick, disabled, children }: ButtonProps) => {
  return (
    <a className={'btn ' + (disabled ? 'disabled' : 'anime')} onClick={onClick}>
      <svg width="100%" height="100%">
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" stopColor="#FF8282" />
            <stop offset="100%" stopColor="#E178ED" />
          </linearGradient>
        </defs>
        <rect
          fill="none"
          stroke="url(#grad1)"
          width="100%"
          height="100%"
        ></rect>
      </svg>
      <span>{children}</span>
    </a>
  );
};

export default Button;
