import Vibrant from 'node-vibrant';
import {
  blueFromArgb,
  greenFromArgb,
  redFromArgb,
  hexFromArgb,
  argbFromHex,
  CorePalette,
} from '@material/material-color-utilities';

export { argbFromHex };

/**
 * Extracts dominant color from an image and builds the theme palette
 */
export const getAppThemeFromImage = async (imageUrl: string, isDark: boolean) => {
  try {
    // Use Vibrant to get the dominant color from the image
    const palette = await Vibrant.from(imageUrl).getPalette();
    const dominantColor = palette?.Vibrant?.hex || '#6200EE'; // fallback to purple if no color found

    // Convert hex to ARGB
    const argb = argbFromHex(dominantColor);

    // Generate Material color palette
    const corePalette = CorePalette.of(argb);

    type PaletteKey = 'a1' | 'a2' | 'a3' | 'error' | 'n1' | 'n2';
    const getTone = (key: PaletteKey, tones: [light: number, dark: number]) => {
      const tone = isDark ? tones[1] : tones[0];
      return corePalette[key].tone(tone);
    };

    const getHexTone = (key: PaletteKey, tones: [light: number, dark: number]) =>
      hexFromArgb(getTone(key, tones));

    const primaryArgb = getTone('a1', [40, 80]);

    return {
      primaryRgb: [
        redFromArgb(primaryArgb),
        greenFromArgb(primaryArgb),
        blueFromArgb(primaryArgb),
      ].toString(),
      primary: hexFromArgb(primaryArgb),
      onPrimary: getHexTone('a1', [100, 20]),
      primaryContainer: getHexTone('a1', [90, 30]),
      onPrimaryContainer: getHexTone('a1', [10, 90]),
      secondary: getHexTone('a2', [40, 80]),
      onSecondary: getHexTone('a2', [100, 20]),
      secondaryContainer: getHexTone('a2', [90, 30]),
      onSecondaryContainer: getHexTone('a2', [10, 90]),
      tertiary: getHexTone('a3', [40, 80]),
      onTertiary: getHexTone('a3', [100, 20]),
      tertiaryContainer: getHexTone('a3', [90, 30]),
      onTertiaryContainer: getHexTone('a3', [10, 90]),
      error: getHexTone('error', [40, 80]),
      onError: getHexTone('error', [100, 20]),
      errorContainer: getHexTone('error', [90, 30]),
      onErrorContainer: getHexTone('error', [10, 90]),
      background: getHexTone('n1', [99, 10]),
      onBackground: getHexTone('n1', [10, 90]),
      surface: getHexTone('n1', [99, 10]),
      onSurface: getHexTone('n1', [10, 90]),
      surfaceVariant: getHexTone('n2', [90, 30]),
      onSurfaceVariant: getHexTone('n2', [30, 80]),
      outline: getHexTone('n2', [50, 60]),
      inverseOnSurface: getHexTone('n1', [95, 10]),
      inverseSurface: getHexTone('n1', [20, 90]),
      inversePrimary: getHexTone('a1', [80, 40]),
    } as const;
  } catch (error) {
    console.error('Error extracting theme color:', error);
    return {};
  }
};
