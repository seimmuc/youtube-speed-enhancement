export interface InjectionData {
  settingsObserver?: MutationObserver;
  videoObserver?: MutationObserver;
  speedPanelComponent?: Record<string, any>;
  microToastOverlay?: Record<string, any>;
}

export class AppState {
  private speed: number;
  readonly speedApplier: (spd: number) => boolean;
  private speedUpdateListenerMenu: ((spd: number) => void) | null = null;
  private speedUpdateListenerToast: ((spd: number) => void) | null = null;
  injectData: InjectionData = {};

  constructor(initialSpeed: number, speedApplier: (spd: number) => boolean) {
    this.speed = initialSpeed;
    this.speedApplier = speedApplier;
  }

  getSpeed(): number {
    return this.speed;
  }
  setSpeed(speed: number, showToast: boolean = false): boolean {
    if (this.speedApplier(speed)) {
      this.speed = speed;
      this.speedUpdateListenerMenu?.(speed);
      if (showToast) {
        this.speedUpdateListenerToast?.(speed);
      }
      return true;
    }
    return false;
  }
  setMenuSpeedUpdateListener(listener: ((spd: number) => void) | null) {
    this.speedUpdateListenerMenu = listener;
  }
  setToastSpeedUpdateListener(listener: ((spd: number) => void) | null) {
    this.speedUpdateListenerToast = listener;
  }
}
