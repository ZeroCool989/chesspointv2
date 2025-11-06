"use client";
import NavLink from "@/components/NavLink";
import { Icon } from "@iconify/react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";

const MenuOptions = [
  { text: "Home", icon: "mdi:home", href: "/" },
  { text: "Play", icon: "streamline:chess-pawn", href: "/play" },
  { text: "Analysis", icon: "streamline:magnifying-glass-solid", href: "/" },
  {
    text: "Database",
    icon: "streamline:database",
    href: "/database",
  },
];

const ExternalLinks = [
  { text: "Website", icon: "mdi:web", href: "https://example.com", external: true },
  { text: "Donate", icon: "mdi:heart", href: "https://example.com/donate", external: true },
  { text: "Blog", icon: "mdi:blog", href: "https://example.com/blog", external: true },
  { text: "About", icon: "mdi:information", href: "https://example.com/about", external: true },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NavMenu({ open, onClose }: Props) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Toolbar />
      <Box sx={{ width: 250, overflow: "hidden" }}>
        <List>
          {MenuOptions.map(({ text, icon, href }) => (
            <ListItem key={text} disablePadding sx={{ margin: 0.7 }}>
              <NavLink href={href}>
                <ListItemButton onClick={onClose}>
                  <ListItemIcon style={{ paddingLeft: "0.5em" }}>
                    <Icon icon={icon} height="1.5em" />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </NavLink>
            </ListItem>
          ))}
          
          {/* Divider for external links */}
          <ListItem sx={{ marginTop: 2, marginBottom: 1 }}>
            <ListItemText 
              primary="External Links" 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontSize: '0.8rem', 
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                } 
              }} 
            />
          </ListItem>
          
          {ExternalLinks.map(({ text, icon, href, external }) => (
            <ListItem key={text} disablePadding sx={{ margin: 0.7 }}>
              <ListItemButton 
                onClick={() => {
                  if (external) {
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }
                  onClose();
                }}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon style={{ paddingLeft: "0.5em" }}>
                  <Icon icon={icon} height="1.5em" />
                </ListItemIcon>
                <ListItemText primary={text} />
                {external && (
                  <Icon icon="mdi:open-in-new" height="1em" style={{ marginLeft: 'auto' }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
