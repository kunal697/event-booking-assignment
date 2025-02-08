import { MusicIcon, SportsIcon, TheaterIcon, FestivalsIcon, OtherIcon } from '../components/icons/CategoryIcons';

export const CATEGORIES = {
  MUSIC: 'music',
  SPORTS: 'sports',
  THEATER: 'theater',
  FESTIVALS: 'festivals',
  OTHER: 'other'
};

export const DEFAULT_IMAGES = {
  [CATEGORIES.MUSIC]: '/images/defaults/music.jpg',
  [CATEGORIES.SPORTS]: '/images/defaults/sports.jpg',
  [CATEGORIES.THEATER]: '/images/defaults/theater.jpg',
  [CATEGORIES.FESTIVALS]: '/images/defaults/festivals.jpg',
  [CATEGORIES.OTHER]: '/images/defaults/default.jpg',
};

export const UI_CONSTANTS = {
  COLORS: {
    primary: '#4F46E5', // Indigo-600
    primaryDark: '#4338CA', // Indigo-700
    secondary: '#6B7280', // Gray-500
    success: '#059669', // Green-600
    danger: '#DC2626', // Red-600
    warning: '#D97706', // Yellow-600
  },
  SHADOWS: {
    sm: 'shadow-sm',
    DEFAULT: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
  ROUNDED: {
    sm: 'rounded',
    DEFAULT: 'rounded-lg',
    full: 'rounded-full',
  },
  TRANSITIONS: {
    DEFAULT: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  }
}; 