import {
  getLogo, getMoviePlayer, getSettingsContainer, getSettingsSpeedMenuItem, getVideo, isWatchPage
} from './ytPageTools';
import { mount, unmount } from 'svelte';
import EnhancedSpeedPanel from './EnhancedSpeedPanel.svelte';
import { AppState } from './app';
import {
  SPEED_PANEL_CLASS, SPEED_KEY_STEP_SIZE, SPEED_MIN, SPEED_MAX, INJECT_RETRY_COUNT, INJECT_RETRY_PERIOD_MS,
} from './consts';
import MicroToastOverlay from './MicroToastOverlay.svelte';

const appState = new AppState(1, applyVideoSpeed);

function reset(): void {
  // Logo
  const logo: HTMLAnchorElement | null = getLogo();
  if (logo === null || logo.dataset.ytSpeedEnhanceInjection === undefined) {
    return;
  }

  // Remove old settings observer if present
  appState.injectData.settingsObserver?.disconnect();

  // Unmount Svelte components
  if (appState.injectData.speedPanelComponent !== undefined) {
    unmount(appState.injectData.speedPanelComponent).catch((err) => {
      console.warn('failed to unmount speed panel:', err);
    });
    appState.injectData.speedPanelComponent = undefined;
  }
  if (appState.injectData.microToastOverlay !== undefined) {
    unmount(appState.injectData.microToastOverlay).catch((err) => {
      console.warn('failed to unmount toast overlay:', err);
    });
    appState.injectData.microToastOverlay = undefined;
  }

  // TODO try to remove old DOM elements that may be left over if extension was disabled/reloaded

  // Remove keydown listener
  document.getRootNode().removeEventListener('keydown', onKeydown as EventListener, {capture: true});
}

function inject(): boolean {
  // Logo
  const logo: HTMLAnchorElement | null = getLogo();
  if (logo === null) {
    console.error('logo not found');
    return false;
  }
  logo.dataset.ytSpeedEnhanceInjection = 'yes';

  // Get current video speed
  const vid = getVideo();
  if (vid === null) {
    console.error('video not found');
    return false;
  }
  appState.setSpeed(vid.playbackRate);

  // Add micro-toast overlay
  const moviePlayer = getMoviePlayer();
  if (moviePlayer === null) {
    console.error('movie player wrapper not found');
    return false;
  }
  const context = new Map([['appState', appState]] as Iterable<readonly [string, any]>);
  appState.injectData.microToastOverlay = mount(MicroToastOverlay, {target: moviePlayer, context});

  // Set up settings menu observer
  const settingsContainer = getSettingsContainer();
  if (settingsContainer === null) {
    console.error('settings container not found');
    return false;
  }
  const settingsObserver = new MutationObserver(onSettingsChange);
  settingsObserver.observe(settingsContainer, {childList: true});
  appState.injectData.settingsObserver = settingsObserver;

  // Add keydown listener
  document.getRootNode().addEventListener('keydown', onKeydown as EventListener, {capture: true});

  return true;
}

function canInject(): boolean {
  return getLogo() !== null && getVideo() !== null && getMoviePlayer() !== null && getSettingsContainer() !== null;
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === '<' || event.key === '>') {
    event.stopPropagation();
    const change = event.key === '<' ? -SPEED_KEY_STEP_SIZE : SPEED_KEY_STEP_SIZE;
    const unclamped = Math.round((appState.getSpeed() + change) / SPEED_KEY_STEP_SIZE) * SPEED_KEY_STEP_SIZE;
    const clamped = Math.min(Math.max(unclamped, SPEED_MIN), SPEED_MAX);
    appState.setSpeed(clamped, true);
  }
}

function applyVideoSpeed(spd: number): boolean {
  // Apply speed setting to the <video> element, this is required
  const vid = getVideo();
  if (vid === null) {
    return false;
  }
  vid.playbackRate = spd;

  // Update value in YouTube's settings menu, this is optional
  const smi = getSettingsSpeedMenuItem();
  if (smi !== null) {
    const content = smi.querySelector(':scope > div.ytp-menuitem-content');
    if (content) {
      content.textContent = spd.toString();
    }
  }
  return true;
}

function onSettingsChange(mutationList: MutationRecord[], _observer: MutationObserver): void {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList') {
      for (const child of mutation.addedNodes) {
        if (!(child instanceof HTMLDivElement && child.classList.contains('ytp-panel'))) {
          continue;
        }

        // Replace YouTube's speed panel with ours
        if (child.classList.contains('ytp-panel') && child.children.length === 2 &&
            child.querySelector(':scope > div.ytp-panel-header') instanceof HTMLDivElement) {
          const oldContent = child.querySelector(':scope > div.ytp-variable-speed-panel-content');
          if (oldContent instanceof HTMLDivElement) {
            const context = new Map([
              ['heightPx', oldContent.style.height],
              ['appState', appState],
            ] as Iterable<readonly [string, any]>);
            oldContent.remove();
            appState.injectData.speedPanelComponent = mount(EnhancedSpeedPanel, {target: child, context});
          }
        }

        // Display correct speed in the settings menu
        const smi = getSettingsSpeedMenuItem(child.querySelector(':scope > div.ytp-panel-menu'));
        if (smi instanceof HTMLDivElement) {
          const content = smi.querySelector(':scope > div.ytp-menuitem-content');
          if (content) {
            content.textContent = appState.getSpeed().toString();
          }
        }
      }
      for (const child of mutation.removedNodes) {
        if (child instanceof HTMLDivElement && child.classList.contains('ytp-panel')) {
          const enhancedSpeedPanelElem = child.querySelector(
              `:scope > div.ytp-variable-speed-panel-content.${SPEED_PANEL_CLASS}`
          );
          if (appState.injectData.speedPanelComponent && enhancedSpeedPanelElem instanceof HTMLDivElement) {
            unmount(appState.injectData.speedPanelComponent).catch(err => {
              console.warn('failed to unmount closed speed panel', err);
            });
            appState.injectData.speedPanelComponent = undefined;
          }
        }
      }
    }
  }
}

function main(): void {
  if (!isWatchPage()) {
    return;
  }

  // Reset tings from previous injection as much as we can
  reset();

  // Try to inject
  if (canInject()) {
    inject();
  } else {
    let triesLeft = INJECT_RETRY_COUNT;
    const intervalId = setInterval(() => {
      if (canInject()) {
        clearInterval(intervalId);
        inject();
      }
      if (--triesLeft < 1) {
        clearInterval(intervalId);
        console.error('Failed to inject YouTube Speed Enhancer, try refreshing the page or updating');
      }
    }, INJECT_RETRY_PERIOD_MS);
  }
}

main();
