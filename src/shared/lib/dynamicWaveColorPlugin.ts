// eslint-disable-next-line import/no-named-as-default
import BasePlugin, {
  BasePluginEvents,
} from 'wavesurfer.js/dist/base-plugin.js';
// eslint-disable-next-line import/no-named-as-default
import createElement from 'wavesurfer.js/dist/dom.js';
import { WaveSurferOptions } from 'wavesurfer.js/dist/types.js';

export type DynamicWaveColorPluginOptions = {
  /** Wave color */
  waveColor?: Exclude<WaveSurferOptions['waveColor'], string[]>;
};

export type DynamicWaveColorPluginEvents = BasePluginEvents;

export class DynamicWaveColorPlugin extends BasePlugin<
  DynamicWaveColorPluginEvents,
  DynamicWaveColorPluginOptions
> {
  private container: HTMLElement | null = null;

  private waveWrapper: HTMLElement;

  private canvasesWrapper: HTMLElement;

  private trimStart: number = 0;
  private trimEnd: number = 0;

  static create(options?: DynamicWaveColorPluginOptions) {
    return new DynamicWaveColorPlugin(options || {});
  }

  constructor(options: DynamicWaveColorPluginOptions) {
    super(options);

    this.waveWrapper = this.initGhostWrapper();
    this.canvasesWrapper = this.initCanvasesWrapper();
  }

  onInit(): void {
    if (!this.wavesurfer) {
      throw new Error('Wavesurfer is not initialized');
    }

    this.container = this.wavesurfer.getWrapper();

    this.container?.appendChild(this.waveWrapper);

    this.initWaveSurferEvents();
  }

  setClip(startPercent: number, endPercent: number): void {
    this.waveWrapper.style.clipPath = `polygon(${startPercent}% 0, ${startPercent}% 100%, ${100 - endPercent}% 100%, ${100 - endPercent}% 0)`;
  }

  setStartInPercent(startPercent: number) {
    this.trimStart = startPercent;
    this.setClip(this.trimStart, this.trimEnd);
  }

  setEndInPercent(endPercent: number) {
    this.trimEnd = endPercent;
    this.setClip(this.trimStart, this.trimEnd);
  }

  setColor(waveColor: typeof this.options.waveColor) {
    this.options.waveColor = waveColor;
    this.updateCanvasesColor();
    // this.onRedraw();
  }

  private initGhostWrapper(): HTMLElement {
    return createElement('div', {
      part: 'dynamic-wave-color',
      style: {
        width: '100%',
        height: '100%',
        top: '0',
        left: '0',
        position: 'absolute',
      },
    });
  }

  private initCanvasesWrapper(): HTMLElement {
    return createElement(
      'div',
      {
        style: {
          position: 'absolute',
          top: '0',
          width: '100%',
          height: '100%',
          zIndex: '10',
        },
      },
      this.waveWrapper,
    );
  }

  private updateCanvasesColor(): void {
    const canvases = Array.from(
      this.canvasesWrapper.getElementsByTagName('canvas'),
    );

    for (const canvas of canvases) {
      if (canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      this.updateCanvasColor(ctx);
    }
  }

  private updateCanvasColor(ctx: CanvasRenderingContext2D): void {
    // Set the composition method to draw only where the waveform is drawn
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = this.options.waveColor ?? 'gray';
    // This rectangle acts as a mask thanks to the composition method
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private onRedraw(): void {
    const canvasesWrapper = this.wavesurfer
      ?.getWrapper()
      .getElementsByClassName('canvases')[0];

    if (!canvasesWrapper) {
      return;
    }

    const canvases = Array.from(canvasesWrapper.getElementsByTagName('canvas'));

    const updateCanvases = (canvasesWrapper: HTMLElement) => {
      this.canvasesWrapper.innerHTML = '';

      for (const canvas of canvases) {
        const canvasClone = canvas.cloneNode() as HTMLCanvasElement;
        const ctx = canvasClone.getContext('2d') as CanvasRenderingContext2D;

        if (canvas.width === 0 || canvas.height === 0) {
          continue;
        }

        ctx.drawImage(canvas, 0, 0);
        this.updateCanvasColor(ctx);
        canvasesWrapper.appendChild(canvasClone);
      }
    };

    updateCanvases(this.canvasesWrapper);
    this.setClip(this.trimStart, this.trimEnd);
  }

  private initWaveSurferEvents() {
    if (!this.wavesurfer) {
      return;
    }

    this.subscriptions.push(
      this.wavesurfer.on('decode', () => {
        this.onRedraw();
      }),

      this.wavesurfer.on('redrawcomplete', () => {
        this.onRedraw();
      }),
    );
  }

  public destroy(): void {
    this.unAll();
    this.waveWrapper.remove();
    this.canvasesWrapper?.remove();
    this.wavesurfer?.un('redraw', this.onRedraw);
    this.wavesurfer = undefined;
    super.destroy();
  }
}
