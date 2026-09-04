<script lang="ts">
  import { NUM_FORMATTER } from './consts';

  interface Props {
    speed: number;
    setSpeed: (spd: number) => boolean;
    text?: string | undefined;
  }
  let { speed, setSpeed, text = undefined }: Props = $props();
</script>

<div class="ytp-variable-speed-panel-preset-button-wrapper">
  <button
          onclick={() => {setSpeed(speed)}}
          class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button"
  >
    <span>{NUM_FORMATTER.format(speed)}</span>
  </button>
  {#if text}
    <div class="ytp-variable-speed-panel-preset-button-label-text">{text}</div>
  {/if}
</div>