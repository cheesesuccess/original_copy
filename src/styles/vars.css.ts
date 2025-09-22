import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
} from '@vanilla-extract/css';

// The HTML root where variables will be applied
const root = 'html';

// Theme color contract: defines all variables but no values yet
export const colorsTheme = createThemeContract({
  primary: '',
  primaryRgb: '',
  onPrimary: '',
  primaryContainer: '',
  onPrimaryContainer: '',
  secondary: '',
  onSecondary: '',
  secondaryContainer: '',
  onSecondaryContainer: '',
  tertiary: '',
  onTertiary: '',
  tertiaryContainer: '',
  onTertiaryContainer: '',
  error: '',
  onError: '',
  errorContainer: '',
  onErrorContainer: '',
  outline: '',
  background: '',
  onBackground: '',
  surface: '',
  onSurface: '',
  surfaceVariant: '',
  onSurfaceVariant: '',
  inverseSurface: '',
  inverseOnSurface: '',
  inversePrimary: '',
});

// ---- Default Static Theme Values (for build time only) ----
const defaultThemeValues = {
  primary: '#ffdcc4',
  primaryRgb: '255,220,196',
  onPrimary: '#000000',
  primaryContainer: '#ffe9d8',
  onPrimaryContainer: '#000000',
  secondary: '#ffdcc4',
  onSecondary: '#000000',
  secondaryContainer: '#ffe9d8',
  onSecondaryContainer: '#000000',
  tertiary: '#ffdcc4',
  onTertiary: '#000000',
  tertiaryContainer: '#ffe9d8',
  onTertiaryContainer: '#000000',
  error: '#b3261e',
  onError: '#ffffff',
  errorContainer: '#f9dedc',
  onErrorContainer: '#410e0b',
  outline: '#79747e',
  background: '#1c1b1f',
  onBackground: '#e6e1e5',
  surface: '#1c1b1f',
  onSurface: '#e6e1e5',
  surfaceVariant: '#49454f',
  onSurfaceVariant: '#cac4d0',
  inverseSurface: '#e6e1e5',
  inverseOnSurface: '#1c1b1f',
  inversePrimary: '#ffdcc4',
};

// Apply default static theme for light/dark mode at build time
export const defaultDarkTheme = assignVars(colorsTheme, defaultThemeValues);
export const defaultLightTheme = assignVars(colorsTheme, defaultThemeValues);

// ---- Sizes (static at build time) ----
const playerSizeVars = createGlobalTheme(root, {
  playerCardHeight: '100px',
});

const sizesVars = createGlobalTheme(root, {
  maxContentWidth: '2144px',
  headerHeight: '56px',
  playerCardOffset: `calc(${playerSizeVars.playerCardHeight} + 16px)`,
});

// Expose all vars
export const vars = {
  colors: colorsTheme,
  sizes: {
    ...playerSizeVars,
    ...sizesVars,
  },
};
