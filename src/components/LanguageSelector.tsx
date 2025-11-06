import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

interface Props {
  darkMode: boolean;
}

export default function LanguageSelector({ darkMode }: Props) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<string>('selectedLanguage', 'en');

  // Ensure value is always valid and never null
  const validCodes = languages.map(l => l.code);
  const current = (typeof selectedLanguage === "string" && validCodes.includes(selectedLanguage))
    ? selectedLanguage
    : "en";

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    try {
      i18n.changeLanguage(newLanguage);
    } catch {
      /* ignore i18n errors */
    }
  };

  const currentLanguage = languages.find(lang => lang.code === current) || languages[0];

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(124, 90, 240, 0.1)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(124, 90, 240, 0.2)',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(124, 90, 240, 0.15)',
            },
            '&.Mui-focused': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(124, 90, 240, 0.2)',
            }
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 12px',
            color: darkMode ? 'white' : '#1B1B1F',
          }
        }}
      >
        <Select
          value={current}
          onChange={handleLanguageChange}
          displayEmpty
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: '16px' }}>{currentLanguage.flag}</span>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? 'white' : '#1B1B1F',
                  fontWeight: 500,
                  fontSize: '0.85rem'
                }}
              >
                {currentLanguage.name}
              </Typography>
            </Box>
          )}
          IconComponent={() => (
            <Icon 
              icon="mdi:chevron-down" 
              style={{ 
                color: darkMode ? 'white' : '#1B1B1F',
                marginRight: '8px'
              }} 
            />
          )}
        >
          {languages.map((language) => (
            <MenuItem 
              key={language.code} 
              value={language.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(124, 90, 240, 0.1)',
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{language.flag}</span>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {language.name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}


