<script lang="ts">
  import type { AppState } from './app';
  import { getContext, onMount } from 'svelte';
  import { MICRO_TOAST_TIMEOUT_MS, NUM_FORMATTER } from './consts';

  const appState: AppState = getContext('appState');

  let shown: boolean = $state(false);
  let speed: number = $state(appState.getSpeed());
  let textWrapperElem: HTMLDivElement | null = $state(null);

  let timerId: number | undefined = undefined;

  onMount(() => {
    appState.setToastSpeedUpdateListener(onSpeedUpdate);
  });

  function onSpeedUpdate(newSpeed: number) {
    speed = newSpeed;
    shown = true;
    if (timerId !== undefined) {
      clearTimeout(timerId);
      // trigger DOM reflow to reset fade-out animation
      // solution shamelessly pilfered from https://stackoverflow.com/a/45036752/22374935
      if (textWrapperElem) {
        textWrapperElem.style.animation = 'none';
        textWrapperElem.offsetHeight;
        textWrapperElem.style.animation = '';
      }
    }
    timerId = setTimeout(() => {
      shown = false;
      timerId = undefined;
    }, MICRO_TOAST_TIMEOUT_MS);
  }
</script>

<div class={shown ? undefined : "ytp-bezel-text-hide"} style:display={shown ? undefined : "none"} data-layer="4">
  <div bind:this={textWrapperElem} class="ytp-bezel-text-wrapper">
    <div class="ytp-bezel-text">{NUM_FORMATTER.format(speed)}x</div>
  </div>
</div>

<!--
YouTube HTML:

<div class="ytp-bezel-text-hide" style="display: none;" data-layer="4">
  <div class="ytp-bezel-text-wrapper">
    <div class="ytp-bezel-text">1.5x</div>
  </div>
  <div class="ytp-bezel" role="status" aria-label="Speed is 1.5">
    <div class="ytp-bezel-icon">
      <svg fill="currentColor" height="100%" viewBox="0 0 36 36" width="100%">
        <path d="M 10.00 13.37 v 9.24 c .00 1.12 1.15 1.76 1.98 1.11 L 18.33 18.66 v 3.95 c .00 1.12 1.15 1.77 1.98 1.11 L 27.50 18.00 l -7.18 -5.73 C 19.49 11.60 18.33 12.25 18.33 13.37 v 3.95 l -6.34 -5.06 C 11.15 11.60 10.00 12.25 10.00 13.37 Z"></path>
      </svg>
    </div>
  </div>
</div>
-->
