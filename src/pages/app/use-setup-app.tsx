import { setElementVars } from '@vanilla-extract/dynamic';
import { createEffect } from 'solid-js';
import { useLocation } from 'solid-app-router';
import { toast } from '~/components/toast/toast';
import { usePeer } from '~/peer/create-peer';
import { colorsTheme } from '~/styles/vars.css';
import { useAudioPlayer } from '../../audio/create-audio-player';
import { installGlobalRipple } from '../../helpers/ripple/install-global-ripple';
import { usePlayerStore } from '../../stores/stores';
import { registerServiceWorker } from '../../sw/register-sw';
import { useDarkThemeEnabled } from '../../utils';
import { getAppThemeFromImage } from '~/helpers/app-theme';
import * as styles from './app.css';

export const useSetupApp = (): void => {
  useAudioPlayer();
  usePeer();

  const [playerState] = usePlayerStore();
  const location = useLocation();
  const isDarkTheme = useDarkThemeEnabled();

  const titlebarElement = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement;

  // Reactively update theme when song or dark mode changes
  createEffect(() => {
    const isDark = isDarkTheme();
    const songImage = playerState.activeTrack?.imageUrl;

    // No image, reset theme colors
    if (!songImage) {
      const emptyTheme: Record<string, string> = {};
      Object.keys(colorsTheme).forEach((key) => (emptyTheme[key] = ''));
      setElementVars(document.documentElement, colorsTheme, emptyTheme);
      return;
    }

    // Load colors from image and apply theme
    getAppThemeFromImage(songImage, isDark).then((scheme) => {
      if (!scheme || Object.keys(scheme).length === 0) return;

      setElementVars(document.documentElement, colorsTheme, scheme);

      if (titlebarElement) {
        const { pathname } = location;
        titlebarElement.content =
          pathname === '/player'
            ? scheme.secondaryContainer
            : scheme.surface;
      }
    });
  });

  // Register service worker for updates
  registerServiceWorker({
    onNeedRefresh(updateSW) {
      toast({
        message: 'An app update is available',
        duration: false,
        controls: [
          {
            title: 'Reload',
            action: () => updateSW(),
          },
        ],
      });
    },
  });

  // Enable ripple effect for buttons
  installGlobalRipple(styles.interactable);
};
