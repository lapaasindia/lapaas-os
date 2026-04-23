/**
 * Material Web Theme Integration
 * Provides light/dark theme support using Material Design 3 color system
 */

import {
  argbFromHex,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeContent,
} from '@material/material-color-utilities';

export type Theme = { [key: string]: string };

/**
 * Material color tokens mapping
 */
const materialColors = {
  background: MaterialDynamicColors.background,
  'on-background': MaterialDynamicColors.onBackground,
  surface: MaterialDynamicColors.surface,
  'surface-dim': MaterialDynamicColors.surfaceDim,
  'surface-bright': MaterialDynamicColors.surfaceBright,
  'surface-container-lowest': MaterialDynamicColors.surfaceContainerLowest,
  'surface-container-low': MaterialDynamicColors.surfaceContainerLow,
  'surface-container': MaterialDynamicColors.surfaceContainer,
  'surface-container-high': MaterialDynamicColors.surfaceContainerHigh,
  'surface-container-highest': MaterialDynamicColors.surfaceContainerHighest,
  'on-surface': MaterialDynamicColors.onSurface,
  'surface-variant': MaterialDynamicColors.surfaceVariant,
  'on-surface-variant': MaterialDynamicColors.onSurfaceVariant,
  'inverse-surface': MaterialDynamicColors.inverseSurface,
  'inverse-on-surface': MaterialDynamicColors.inverseOnSurface,
  outline: MaterialDynamicColors.outline,
  'outline-variant': MaterialDynamicColors.outlineVariant,
  shadow: MaterialDynamicColors.shadow,
  scrim: MaterialDynamicColors.scrim,
  'surface-tint': MaterialDynamicColors.surfaceTint,
  primary: MaterialDynamicColors.primary,
  'on-primary': MaterialDynamicColors.onPrimary,
  'primary-container': MaterialDynamicColors.primaryContainer,
  'on-primary-container': MaterialDynamicColors.onPrimaryContainer,
  'inverse-primary': MaterialDynamicColors.inversePrimary,
  secondary: MaterialDynamicColors.secondary,
  'on-secondary': MaterialDynamicColors.onSecondary,
  'secondary-container': MaterialDynamicColors.secondaryContainer,
  'on-secondary-container': MaterialDynamicColors.onSecondaryContainer,
  tertiary: MaterialDynamicColors.tertiary,
  'on-tertiary': MaterialDynamicColors.onTertiary,
  'tertiary-container': MaterialDynamicColors.tertiaryContainer,
  'on-tertiary-container': MaterialDynamicColors.onTertiaryContainer,
  error: MaterialDynamicColors.error,
  'on-error': MaterialDynamicColors.onError,
  'error-container': MaterialDynamicColors.errorContainer,
  'on-error-container': MaterialDynamicColors.onErrorContainer,
};

/**
 * Generate Material theme from source color
 * @param color Hex color (e.g., '#0ea5e9')
 * @param isDark Whether to generate dark mode theme
 * @returns Theme object with color tokens
 */
export function themeFromSourceColor(color: string, isDark: boolean): Theme {
  const scheme = new SchemeContent(Hct.fromInt(argbFromHex(color)), isDark, 0);
  const theme: Theme = {};

  for (const [key, value] of Object.entries(materialColors)) {
    theme[key] = hexFromArgb(value.getArgb(scheme));
  }
  return theme;
}

/**
 * Apply Material theme to document
 * @param theme Theme object from themeFromSourceColor
 * @param ssName Optional stylesheet name for caching
 */
export function applyMaterialTheme(
  theme: Theme,
  ssName = 'material-theme',
): void {
  let styleString = ':root,:host{';
  for (const [key, value] of Object.entries(theme)) {
    styleString += `--md-sys-color-${key}:${value};`;
  }
  styleString += '}';

  // Apply to document
  const styleId = `${ssName}-stylesheet`;
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = styleString;

  // Cache in localStorage
  localStorage.setItem(ssName, styleString);
}

/**
 * Get current theme from localStorage
 */
export function getCurrentTheme(): string | null {
  return localStorage.getItem('material-theme');
}

/**
 * Get current color mode
 */
export function getCurrentMode(): 'light' | 'dark' | null {
  return localStorage.getItem('color-mode') as 'light' | 'dark' | null;
}

/**
 * Save color mode to localStorage
 */
export function saveColorMode(mode: 'light' | 'dark'): void {
  localStorage.setItem('color-mode', mode);
}

/**
 * Get current seed color
 */
export function getCurrentSeedColor(): string | null {
  return localStorage.getItem('seed-color');
}

/**
 * Save seed color to localStorage
 */
export function saveSeedColor(color: string): void {
  localStorage.setItem('seed-color', color);
}

/**
 * Change theme color and apply
 */
export function changeThemeColor(color: string, isDark: boolean): void {
  const theme = themeFromSourceColor(color, isDark);
  applyMaterialTheme(theme);
  saveSeedColor(color);
  saveColorMode(isDark ? 'dark' : 'light');
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(defaultColor: string = '#0ea5e9'): void {
  const savedColor = getCurrentSeedColor() || defaultColor;
  const savedMode = getCurrentMode() || 'light';
  const isDark = savedMode === 'dark';

  changeThemeColor(savedColor, isDark);
}
