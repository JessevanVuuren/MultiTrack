import { BoolMetaField, ObjectMetaField, ValueOf } from '@motion-canvas/core/lib/meta'
import type { Project, RendererSettings } from '@motion-canvas/core'
import { EventDispatcher } from '@motion-canvas/core/lib/events'
import type { MetaField } from '@motion-canvas/core/lib/meta'
import type { RendererResult } from '@motion-canvas/core'
import { Exporter } from '@motion-canvas/core/lib/app'

type ServerResponse = | { status: 'success'; method: string; data: unknown; }
  | { status: 'error'; method: string; message?: string; };

type FFmpegExporterOptions = ValueOf<
  ReturnType<typeof MultiExport.meta>
>;

export class MultiExport implements Exporter {
  public static readonly id = '@motion-canvas/ffmpeg';
  public static readonly displayName = 'MultiTrack';

  public static meta(project: Project): MetaField<any> {
    return new ObjectMetaField(this.displayName, {
      fastStart: new BoolMetaField('fast start', true),
      includeAudio: new BoolMetaField('include audio', true).disable(
        !project.audio,
      ),
    });
  }

  public static async create(project: Project, settings: RendererSettings) {
    return new MultiExport(project, settings);
  }

  private static readonly response = new EventDispatcher<ServerResponse>();

  static {
    if (import.meta.hot) {
      import.meta.hot.on(
        `motion-canvas/ffmpeg-ack`,
        (response: ServerResponse) => this.response.dispatch(response),
      );
    }
  }

  public constructor(
    private readonly project: Project,
    private readonly settings: RendererSettings,
  ) { }

  public async start(): Promise<void> {
    const options = this.settings.exporter.options as FFmpegExporterOptions;

    document.addEventListener("multi-track:finalize", (e) => start_invoke());
    document.dispatchEvent(new CustomEvent("multi-track:prepare"));

    const start_invoke = async () => {
      await this.invoke('start', {
        ...this.settings,
        ...options,
        audio: "/audio/multi-track-audio.wav",
        audioOffset:
          this.project.meta.shared.audioOffset.get() - this.settings.range[0],
      });
    }
  }

  public async handleFrame(canvas: HTMLCanvasElement): Promise<void> {
    await this.invoke('handleFrame', {
      data: canvas.toDataURL('image/png'),
    });
  }

  public async stop(result: RendererResult): Promise<void> {
    fetch("cleanup") // remove file "/audio/multi-track-audio.wav"
    await this.invoke('end', result);
  }

  private invoke<TResponse = unknown, TData = unknown>(method: string, data: TData,): Promise<TResponse> {
    if (import.meta.hot) {
      return new Promise((resolve, reject) => {
        const handle = (response: ServerResponse) => {
          if (response.method !== method) {
            return;
          }

          MultiExport.response.unsubscribe(handle);
          if (response.status === 'success') {
            resolve(response.data as TResponse);
          } else {
            reject({
              message: 'An error occurred while exporting the video.',
              remarks: `Method: ${method}<br>Server error: ${response.message}`,
              object: data,
            });
          }
        };
        MultiExport.response.subscribe(handle);
        import.meta.hot!.send('motion-canvas/ffmpeg', { method, data });
      });
    } else {
      throw new Error('FFmpegExporter can only be used locally.');
    }
  }
}