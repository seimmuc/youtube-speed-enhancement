export function isWatchPage(): boolean {
  return window.location.pathname === '/watch';
}

export function getLogo(): HTMLAnchorElement | null {
  return document.querySelector('a#logo');
}

export function getPlayerContainer(): HTMLDivElement | null {
  return document.querySelector('div#player-container');
}

export function getMoviePlayer(): HTMLDivElement | null {
  return (getPlayerContainer()?.querySelector('div#movie_player')) ?? null;
}

export function getVideo(): HTMLVideoElement | null {
  return (getMoviePlayer()?.querySelector('div.html5-video-container > video.html5-main-video')) ?? null;
}

export function getSettingsPopup(): HTMLDivElement | null {
  return (getMoviePlayer()?.querySelector(':scope > div.ytp-popup.ytp-settings-menu')) ?? null;
}

export function getSettingsContainer(): HTMLDivElement | null {
  return (getSettingsPopup()?.querySelector(':scope > div.ytp-popup-content')) ?? null;
}

export function getSettingsMenu(): HTMLDivElement | null {
  return (getSettingsContainer()?.querySelector(':scope > div.ytp-panel > div.ytp-panel-menu')) ?? null;
}

export function getSettingsSpeedMenuItem(settingsMenu?: Element | null): HTMLDivElement | null {
  if (settingsMenu === undefined) {
    settingsMenu = getSettingsMenu();
  }
  if (!(settingsMenu instanceof HTMLDivElement)) {
    return null;
  }
  for (const menuItem of settingsMenu.querySelectorAll(':scope > div.ytp-menuitem')) {
    // English only for now, sorry
    if (menuItem instanceof HTMLDivElement &&
        menuItem.querySelector(':scope > div.ytp-menuitem-label')?.textContent === 'Playback speed') {
      return menuItem;
    }
  }
  return null;
}
