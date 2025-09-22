import { globalStyle } from '@vanilla-extract/css';
import { vars } from './vars.css';

// Root selector
const root = 'html';

// Set up base global styles
globalStyle(root, {
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '14px',
  letterSpacing: '0.25px',
  // Use CSS variables for color and background, set dynamically via setElementVars
  color: vars.colors.onBackground,
  background: vars.colors.background,
  // Default color scheme, can be overridden by dynamic theme
  colorScheme: 'dark',
  '@media': {
    '(prefers-color-scheme: light)': {
      colorScheme: 'light',
    },
    '(max-height: 440px), (max-width: 320px)': {
      vars: {
        [vars.sizes.headerHeight]: '48px',
      },
    },
    '(max-width: 700px), (max-height: 440px)': {
      vars: {
        [vars.sizes.playerCardHeight]: '64px',
      },
    },
  },
});

// Reset margins & sizing
globalStyle('html, body', {
  margin: 0,
  touchAction: 'manipulation',
  overscrollBehavior: 'contain',
  WebkitTapHighlightColor: 'transparent',
  WebkitUserSelect: 'none',
  userSelect: 'none',
  width: '100%',
  height: '100%',
});

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('h1', {
  margin: 0,
});

globalStyle('a', {
  color: vars.colors.primary,
});

globalStyle('strong', {
  fontWeight: 500,
});

// Show unsupported browser message if needed
globalStyle('html[app-not-supported] #unsupported-browser', {
  display: 'block',
});
