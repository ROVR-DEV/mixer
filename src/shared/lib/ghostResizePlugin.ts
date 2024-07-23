// eslint-disable-next-line import/no-named-as-default
import BasePlugin, {
  BasePluginEvents,
} from 'wavesurfer.js/dist/base-plugin.js';
// eslint-disable-next-line import/no-named-as-default
import createElement from 'wavesurfer.js/dist/dom.js';

export type GhostResizePluginOptions = {
  /** Overlay wave color */
  overlayColor?: string;
};

export type GhostResizePluginEvents = BasePluginEvents;

export class GhostResizePlugin extends BasePlugin<
  GhostResizePluginEvents,
  GhostResizePluginOptions
> {
  private container: HTMLElement | null = null;

  private ghostWrapper: HTMLElement;

  private ghostLeftOverlayWrapper: HTMLElement;
  private ghostRightOverlayWrapper: HTMLElement;

  private trimStart: number = 0;
  private trimEnd: number = 0;

  static create(options?: GhostResizePluginOptions) {
    return new GhostResizePlugin(options || {});
  }

  constructor(options: GhostResizePluginOptions) {
    super(options);

    this.ghostWrapper = this.initGhostWrapper();
    this.ghostLeftOverlayWrapper = this.initGhostOverlayWrapper('left');
    this.ghostRightOverlayWrapper = this.initGhostOverlayWrapper('right');
  }

  onInit(): void {
    if (!this.wavesurfer) {
      throw new Error('Wavesurfer is not initialized');
    }

    this.container = this.wavesurfer.getWrapper();

    this.container?.appendChild(this.ghostWrapper);

    this.initWaveSurferEvents();
  }

  private initGhostWrapper(): HTMLElement {
    return createElement('div', {
      part: 'ghost',
      style: {
        width: '100%',
        height: '100%',
        top: '0',
        left: '0',
        position: 'absolute',
      },
    });
  }

  private initGhostOverlayWrapper(side: 'left' | 'right'): HTMLElement {
    const baseStyle = {
      position: 'absolute',
      top: '0',
      width: '100%',
      height: '100%',
      zIndex: '10',
    };

    const position =
      side === 'left'
        ? {
            left: '0',
            right: '',
          }
        : {
            left: '',
            right: '0',
          };

    return createElement(
      'div',
      {
        style: {
          ...baseStyle,
          ...position,
        },
      },
      this.ghostWrapper,
    );
  }

  private onRedraw(): void {
    const canvasesWrapper = this.wavesurfer
      ?.getWrapper()
      .getElementsByClassName('canvases')[0];

    if (!canvasesWrapper) {
      return;
    }

    const canvases = Array.from(canvasesWrapper.getElementsByTagName('canvas'));

    const updateGhostOverlayCanvases = (ghostOverlayWrapper: HTMLElement) => {
      for (const canvas of canvases) {
        const ghostCanvas = canvas.cloneNode() as HTMLCanvasElement;
        const ghostCtx = ghostCanvas.getContext(
          '2d',
        ) as CanvasRenderingContext2D;

        if (canvas.width === 0 || canvas.height === 0) {
          return;
        }

        ghostCtx.drawImage(canvas, 0, 0);
        // Set the composition method to draw only where the waveform is drawn
        ghostCtx.globalCompositeOperation = 'source-in';
        ghostCtx.fillStyle = this.options.overlayColor ?? 'gray';
        // This rectangle acts as a mask thanks to the composition method
        ghostCtx.fillRect(0, 0, canvas.width, canvas.height);
        ghostOverlayWrapper.appendChild(ghostCanvas);
      }
    };

    this.ghostLeftOverlayWrapper.innerHTML = '';
    updateGhostOverlayCanvases(this.ghostLeftOverlayWrapper);
    this.setLeftGhostWidthInPercent(this.trimStart);

    this.ghostRightOverlayWrapper.innerHTML = '';
    updateGhostOverlayCanvases(this.ghostRightOverlayWrapper);
    this.setRightGhostWidthInPercent(this.trimEnd);
  }

  setLeftGhostWidthInPercent(widthPercent: number) {
    this.trimStart = widthPercent;
    this.ghostLeftOverlayWrapper.style.clipPath = `rect(auto ${widthPercent}% auto auto)`;
  }

  setRightGhostWidthInPercent(widthPercent: number) {
    this.trimEnd = widthPercent;
    this.ghostRightOverlayWrapper.style.clipPath = `rect(auto auto auto ${100 - widthPercent}%)`;
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
    this.ghostWrapper.remove();
    this.ghostLeftOverlayWrapper?.remove();
    this.ghostRightOverlayWrapper?.remove();
    this.wavesurfer?.un('redraw', this.onRedraw);
    this.wavesurfer = undefined;
    super.destroy();
  }
}
