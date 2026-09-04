<script lang="ts">
  import { NUM_FORMATTER } from './consts';

  interface Props {
    speed: number;
    setSpeed: (spd: number) => boolean;
  }
  let { speed, setSpeed }: Props = $props();
</script>

<div class="ytp-variable-speed-panel-preset-button-wrapper">
  <button
          onclick={() => {setSpeed(speed)}}
          class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button"
  >
    <span>{NUM_FORMATTER.format(speed)}</span>
  </button>
</div>