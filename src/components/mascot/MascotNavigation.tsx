'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Fade,
  useTheme,
} from '@mui/material';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Play',
    href: '/play',
    icon: 'mdi:play',
    description: 'Start a new chess game',
  },
  {
    label: 'Puzzles',
    href: '/puzzles',
    icon: 'mdi:puzzle',
    description: 'Solve chess puzzles',
  },
  {
    label: 'Lessons',
    href: '/lessons',
    icon: 'mdi:school',
    description: 'Learn chess openings and strategies',
  },
  {
    label: 'Analysis',
    href: '/analysis',
    icon: 'mdi:magnify',
    description: 'Analyze your games',
  },
  {
    label: 'Database',
    href: '/database',
    icon: 'mdi:database',
    description: 'Browse chess games database',
  },
];

interface MascotNavigationProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Navigation helper component that shows as a speech bubble
 * Provides quick links to key pages
 */
export default function MascotNavigation({
  open,
  onClose,
  position = 'right',
}: MascotNavigationProps) {
  const theme = useTheme();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(router.pathname);
  }, [router.pathname]);

  if (!open) return null;

  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return { right: 'calc(50% + 240px)', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { left: 'calc(50% + 240px)', top: '50%', transform: 'translateY(-50%)' };
      case 'top':
        return { bottom: 'calc(50% + 240px)', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { top: 'calc(50% + 240px)', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { left: 'calc(50% + 240px)', top: '50%', transform: 'translateY(-50%)' };
    }
  };

  return (
    <Fade in={open}>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          ...getPositionStyles(),
          width: '280px',
          maxWidth: '90vw',
          p: 2,
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 20, 50, 0.98) 0%, rgba(50, 30, 80, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(250, 248, 255, 1) 100%)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(124, 90, 240, 0.4)'}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 8px 32px rgba(124, 90, 240, 0.2), 0 0 0 1px rgba(124, 90, 240, 0.1)',
          zIndex: 1000,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            ...(position === 'right' && {
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              borderRight: `12px solid ${theme.palette.mode === 'dark' ? 'rgba(30, 20, 50, 0.98)' : 'rgba(255, 255, 255, 1)'}`,
            }),
            ...(position === 'left' && {
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              borderLeft: `12px solid ${theme.palette.mode === 'dark' ? 'rgba(30, 20, 50, 0.98)' : 'rgba(255, 255, 255, 1)'}`,
            }),
            ...(position === 'top' && {
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: `12px solid ${theme.palette.mode === 'dark' ? 'rgba(30, 20, 50, 0.98)' : 'rgba(255, 255, 255, 1)'}`,
            }),
            ...(position === 'bottom' && {
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: `12px solid ${theme.palette.mode === 'dark' ? 'rgba(30, 20, 50, 0.98)' : 'rgba(255, 255, 255, 1)'}`,
            }),
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
              fontSize: '1.1rem',
              textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
            }}
          >
            Welcome to Chesspoint! 👋
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
              '&:hover': { 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(124, 90, 240, 0.1)' 
              },
            }}
          >
            <Icon icon="mdi:close" />
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
            mb: 2,
            fontWeight: 500,
            textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
          }}
        >
          My name is Elo, I'm your helper in your chess journey! Let me help you navigate:
        </Typography>

        <Stack spacing={1}>
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  fullWidth
                  startIcon={
                    <Icon 
                      icon={item.icon} 
                      style={{ 
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
                        fontSize: '1.2rem'
                      }} 
                    />
                  }
                  variant={isActive ? 'contained' : 'outlined'}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderRadius: 2,
                    py: 1,
                    px: 2,
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(124, 90, 240, 0.4)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(124, 90, 240, 0.08)',
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(124, 90, 240, 0.6)',
                    },
                    ...(isActive && {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(124, 90, 240, 0.15)',
                      borderColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.5)'
                        : 'rgba(124, 90, 240, 0.5)',
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
                    }),
                  }}
                  onClick={onClose}
                >
                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1F',
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(27, 27, 31, 0.75)',
                          fontSize: '0.7rem',
                          fontWeight: 400,
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                </Button>
              </Link>
            );
          })}
        </Stack>
      </Paper>
    </Fade>
  );
}

