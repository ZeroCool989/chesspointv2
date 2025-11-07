'use client';

import { IconButton, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import { styled } from '@mui/material/styles';

const StyledNavigationButton = styled(IconButton)(({ theme }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 20, 50, 0.95) 0%, rgba(50, 30, 80, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 248, 255, 0.98) 100%)',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(124, 90, 240, 0.4)'}`,
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
    : '0 8px 25px rgba(124, 90, 240, 0.2), 0 0 0 1px rgba(124, 90, 240, 0.1)',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(180, 142, 250, 0.1) 0%, rgba(255, 107, 157, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(124, 90, 240, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%)',
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 300ms ease',
  },
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(124, 90, 240, 0.6)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 30px rgba(180, 142, 250, 0.4), 0 8px 35px rgba(0, 0, 0, 0.5)'
      : '0 0 0 2px rgba(124, 90, 240, 0.3), 0 0 30px rgba(124, 90, 240, 0.4), 0 8px 35px rgba(0, 0, 0, 0.3)',
    transform: 'scale(1.08) translateY(-2px)',
    '&::before': {
      opacity: 1,
    },
  },
  '&:active': {
    transform: 'scale(1.02) translateY(-1px)',
  },
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(124, 90, 240, 0.6)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 0 3px rgba(180, 142, 250, 0.3), 0 0 30px rgba(180, 142, 250, 0.4)'
      : '0 0 0 3px rgba(124, 90, 240, 0.3), 0 0 30px rgba(124, 90, 240, 0.4)',
  },
}));

interface MascotNavigationButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export default function MascotNavigationButton({ onClick, isOpen }: MascotNavigationButtonProps) {
  const theme = useTheme();
  
  return (
    <StyledNavigationButton
      onClick={onClick}
      aria-label="Navigation"
      title="Navigation"
      sx={{
        position: 'absolute',
        left: 'calc(50% + 180px)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
      }}
    >
      <Icon 
        icon="mdi:compass" 
        width={24} 
        height={24}
        style={{
          filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 3px rgba(180, 142, 250, 0.5))' : 'none',
        }}
      />
    </StyledNavigationButton>
  );
}

