<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import EnhancedSpeedChip from './EnhancedSpeedChip.svelte';
  import type { AppState } from './app';
  import { SPEED_MAX, SPEED_MIN, SPEED_PANEL_CLASS, SPEED_SLD_STEP_SIZE } from './consts';


  const heightPx: number = getContext('heightPx');
  const appState: AppState = getContext('appState');

  let speed: number = $state(appState.getSpeed());
  let dSpeed: number = $state(appState.getSpeed());

  let dRatio: number = $derived((dSpeed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN));

  onMount(() => {
    appState.setMenuSpeedUpdateListener(spd => {
      speed = spd;
      dSpeed = spd;
    });
    return () => {
      appState.setMenuSpeedUpdateListener(null);
    };
  });

  function setSpeed(spd: number): boolean {
    const newSpeed = Math.min(Math.max(spd, SPEED_MIN), SPEED_MAX);
    if (newSpeed === speed) {
      return false;
    }
    return appState.setSpeed(newSpeed);
  }
  function buttonDecrement(): void {
    setSpeed(speed - SPEED_SLD_STEP_SIZE);
  }
  function buttonIncrement(): void {
    setSpeed(speed + SPEED_SLD_STEP_SIZE);
  }
</script>

<div class="ytp-variable-speed-panel-content {SPEED_PANEL_CLASS}" style:height={heightPx}>
  <!-- Current speed indicator -->
  <div class="ytp-speed-display-container">
    <div class="ytp-variable-speed-panel-display" aria-live="polite">
      <span>{dSpeed.toFixed(2)}x</span>
    </div>
  </div>

  <!-- Slider -->
  <div class="ytp-variable-speed-panel-slider-container">
    <button onclick={buttonDecrement} class="ytp-button ytp-variable-speed-panel-button ytp-variable-speed-panel-increment-button" aria-label="Decrease playback speed {SPEED_SLD_STEP_SIZE}">
      <span>-</span>
    </button>
    <div class="ytp-input-slider-section">
      <input
              onchange={ev => {
                if (!setSpeed(parseFloat(ev.currentTarget.value))) {
                  ev.currentTarget.value = speed.toString();
                }
              }}
              bind:value={dSpeed}
              class="ytp-input-slider ytp-speedslider ytp-varispeed-input-slider"
              tabindex="0"
              type="range"
              min="{SPEED_MIN}" max="{SPEED_MAX}" step="{SPEED_SLD_STEP_SIZE}"
              aria-valuenow="{speed}" aria-valuemin="{SPEED_MIN}" aria-valuemax="{SPEED_MAX}"
              aria-valuetext="{speed.toFixed(2)}"
              style="--yt-slider-shape-gradient-percent: {Math.round(dRatio * 100)}%;"
      >
    </div>
    <button onclick={buttonIncrement} class="ytp-button ytp-variable-speed-panel-button ytp-variable-speed-panel-increment-button" aria-label="Increase playback speed {SPEED_SLD_STEP_SIZE}">
      <span>+</span>
    </button>
  </div>

  <!-- "Chip" buttons -->
  <div class="ytp-variable-speed-panel-chips">
    <EnhancedSpeedChip speed={0.5} {setSpeed} />
    <EnhancedSpeedChip speed={1} {setSpeed} />
    <EnhancedSpeedChip speed={1.5} {setSpeed} />
    <EnhancedSpeedChip speed={2} {setSpeed} />
    <EnhancedSpeedChip speed={3} {setSpeed} />
    <EnhancedSpeedChip speed={4} {setSpeed} />
    <EnhancedSpeedChip speed={6} {setSpeed} />
    <EnhancedSpeedChip speed={8} {setSpeed} />
  </div>
</div>

<style>
  .ytp-variable-speed-panel-chips {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      overflow: scroll;
  }
</style>

<!--
YouTube's HTML:

<div class="ytp-variable-speed-panel-content" tabindex="0" style="height: 193px;">
  <div class="ytp-speed-display-container">
    <div class="ytp-variable-speed-panel-display" aria-live="polite">
      <div class="ytp-variable-speed-panel-premium-badge" tabindex="-1">
        <div class="ytp-variable-speed-panel-badge"></div>
      </div>
      <span>1.00x</span>
    </div>
  </div>
  <div class="ytp-variable-speed-panel-slider-container">
    <button class="ytp-button ytp-variable-speed-panel-button ytp-variable-speed-panel-increment-button" aria-label="Decrease playback speed 0.05">
      <span>-</span>
    </button>
    <div class="ytp-input-slider-section">
      <div class="ytp-speedslider-indicator-container">
        <div class="ytp-speedslider-badge" aria-label=""></div>
        <p class="ytp-speedslider-text">1.00x</p>
      </div>
      <input class="ytp-input-slider ytp-speedslider ytp-varispeed-input-slider" role="slider" tabindex="0" type="range" min="0.25" max="2" step="0.05" value="1" aria-valuenow="1" aria-valuemin="0.25" aria-valuemax="2" aria-valuetext="1.00" style="--yt-slider-shape-gradient-percent: 100%;">
    </div>
    <button class="ytp-button ytp-variable-speed-panel-button ytp-variable-speed-panel-increment-button" aria-label="Increase playback speed 0.05">
      <span>+</span>
    </button>
  </div>

  <div class="ytp-variable-speed-panel-chips">
    <div class="ytp-variable-speed-panel-preset-button-wrapper" data-priority="5" aria-hidden="false">
      <button class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button">
        <span>1.0</span>
      </button>
      <div class="ytp-variable-speed-panel-preset-button-label-text">Normal</div>
    </div>
    <div class="ytp-variable-speed-panel-preset-button-wrapper" data-priority="2" aria-hidden="false">
      <button class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button">
        <span>1.25</span>
      </button>
    </div>
    <div class="ytp-variable-speed-panel-preset-button-wrapper" data-priority="3" aria-hidden="false">
      <button class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button">
        <span>1.5</span>
      </button>
    </div>
    <div class="ytp-variable-speed-panel-preset-button-wrapper" data-priority="0" style="display: none;" aria-hidden="true">
      <button class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button">
        <span>1.75</span>
      </button>
    </div>
    <div class="ytp-variable-speed-panel-preset-button-wrapper" data-priority="4" aria-hidden="false">
      <button class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button">
        <span>2.0</span>
      </button>
    </div>
    <div class="ytp-variable-speed-panel-preset-button-wrapper" data-priority="1" aria-hidden="false">
      <button class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button">
        <div class="ytp-variable-speed-panel-premium-upsell-icon"></div>
        <span>3.0</span>
      </button>
    </div>
  </div>
</div>
-->
