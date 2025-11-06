import { IconButton, Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { colorModeAtom } from '@/state/colorMode';

/**
 * Color mode toggle button
 * Switches between light and dark themes with persistent storage
 */
export function ColorModeSwitch() {
  const [colorMode, setColorMode] = useAtom(colorModeAtom);

  const handleToggle = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  return (
    <Tooltip title={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={handleToggle} color="inherit" aria-label="toggle color mode">
        {colorMode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
}

export default ColorModeSwitch;
