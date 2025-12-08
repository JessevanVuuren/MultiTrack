import { array_min_max, map, uid } from "./utils"
import { MutableRef } from "preact/hooks"
import { Audio, Track } from "./types"

export const copy_audio = (s: Audio, d: Audio) => {
  d.id = s.id
  d.name = s.name
  d.source = s.source

  d.duration = s.duration

  s.positions.map(position => d.positions.push(position))

  d.buffer = s.buffer
  d.buffer_line = s.buffer_line

  d.is_recoding = s.is_recoding
}

export const unlink_audio = (s: Audio): Audio => {
  return {
    id: s.id,
    name: s.name,
    source: s.source,
    duration: s.duration,
    positions: s.positions.filter(position => true),
    buffer: s.buffer,
    buffer_line: s.buffer_line,
    is_recoding: s.is_recoding,
  }
}

export const load_audios = async (paths: string[], ctx: AudioContext, track_id: string) => {
  const audios: Audio[] = []
  for await (const path of paths) {
    audios.push(await load_audio(path, ctx, track_id))
  }
  return audios
}

export const load_audio = async (path: string, ctx: AudioContext, track_id: string) => {
  const buffer = await get_source_buffer(ctx, path)
  if (!buffer) {
    console.log("error in getting file")
    return
  }
  const file_name_rx = /[ \w-]+?(?=\.)/
  return build_audio(file_name_rx.exec(path)[0], buffer, path, track_id, false, false)
}

export const build_audio = (name: string, buffer: AudioBuffer, path: string, track_id: string, is_recoding: boolean, active: boolean): Audio => {
  return {
    id: uid(),
    name: name,
    source: path,
    positions: [],
    duration: buffer.duration,

    is_recoding: is_recoding,

    buffer: buffer,
    buffer_line: ""
  }
}

export const add_track = (is_main = false): Track => {
  const id = is_main ? "default" : uid()
  return {
    id: id,
    muted: false,
    volume: 100,
    main: is_main
  }
}

export const get_source_buffer = async (ctx: AudioContext, path: string): Promise<AudioBuffer | null> => {
  return await fetch(path)
    .then(res => res.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer))
    .catch((e): null => {
      console.log(e)
      return null
    });
}

export const audio_polyline = (buffer: AudioBuffer, lod: number): string => {
  const data = buffer.getChannelData(0)
  const poly_step = 100 / data.length
  const min_max = array_min_max(Array.from(data))
  const data_step = data.length / lod

  var line = ""
  for (let i = 0; i < data.length; i += Math.round(data_step)) {
    const x = (i * poly_step).toFixed(3)
    const y = map(data[i], min_max.min, min_max.max, 10, 90).toFixed(3)
    line += `${x},${y} `
  }
  return line
}

export const pause_play = (state: boolean, source: MutableRef<AudioBufferSourceNode>, ctx: AudioContext, buffer: MutableRef<AudioBuffer>, offset: number) => {
  if (state) play(source, ctx, buffer, offset)
  else stop(source)
}

export const build_sound_line = (buffer: number[], n_points: number): number[][] => {
  const point_size = buffer.length / n_points
  const points_lists = []

  for (let i = 0; i < buffer.length; i += point_size) {
    points_lists.push(buffer.slice(i, i + point_size))
  }

  const chunks_avg = points_lists.map(section => {
    return section.reduce((p, a) => p + a, 0) / section.length
  })

  const min_max = array_min_max(chunks_avg)

  const points: number[][] = []
  const step = 1 / n_points

  for (let i = 0; i < chunks_avg.length; i++) {

    const x = i * step
    const y = map(chunks_avg[i], min_max.min, min_max.max, 0, 1)

    points.push([x, y])
  }

  return points
}

export const play = (source: MutableRef<AudioBufferSourceNode>, ctx: AudioContext, buffer: MutableRef<AudioBuffer>, offset: number) => {
  source.current = ctx.createBufferSource()
  source.current.buffer = buffer.current
  source.current.connect(ctx.destination)
  source.current.start(0, offset)
}

export const stop = (source: MutableRef<AudioBufferSourceNode>) => {
  if (source.current) {
    source.current.stop()
    source.current.disconnect()
    source.current = null
  }
}

export const build_buffer = async (ctx: AudioContext, buffer: MutableRef<AudioBuffer>, audios: Audio[], tracks: Track[], duration: number) => {
  const maxChannels = Math.max(2, ...audios.map(a => a.buffer?.numberOfChannels ?? 0));
  buffer.current = ctx.createBuffer(maxChannels, ctx.sampleRate * duration, ctx.sampleRate);

  audios.forEach(audio => {
    if (audio.is_recoding) return;

    audio.positions.map(position => {

      const track = get_track(position.track_id, tracks);
      if (track.muted) return;

      const audio_buffer = position.track_cut ? position.track_cut.buffer : audio.buffer;
      
      const offset = Math.round(position.offset * ctx.sampleRate);
      const available_space = buffer.current.length - offset;
      const len = Math.min(available_space, audio_buffer.length);
      
      for (let ch = 0; ch < maxChannels; ch++) {
        const source = audio_buffer.getChannelData(ch);
        const destination = buffer.current.getChannelData(ch);

        for (let i = 0; i < len; i++) {
          destination[i + offset] += source[i] * (track.volume / 100);
        }
      }
    })
  });
};

const get_track = (track_id: string, tracks: Track[]): Track => {
  return tracks.find(t => t.id == track_id)
}

export const blob_to_AudioBuffer = async (ctx: AudioContext, blob_part: BlobPart[], mime_type: string) => {
  const blob = new Blob(blob_part, { type: mime_type })
  const buff = await blob.arrayBuffer()
  const mono = await ctx.decodeAudioData(buff)

  const length = ctx.sampleRate * mono.duration
  const stereo = ctx.createBuffer(2, length, ctx.sampleRate)
  stereo.copyToChannel(mono.getChannelData(0), 0)
  stereo.copyToChannel(mono.getChannelData(0), 1)

  return stereo
}

const splice_audio_buffer = (ctx: AudioContext, source: AudioBuffer, start: number, end: number): AudioBuffer => {
  const samples = source.sampleRate;

  const start_sample = Math.floor(start * samples)
  const end_sample = Math.floor(end * samples)
  const sample_count = end_sample - start_sample

  const buffer = ctx.createBuffer(source.numberOfChannels, sample_count, samples);

  for (let c = 0; c < source.numberOfChannels; c++) {
    const destination_data = buffer.getChannelData(c)
    const source_data = source.getChannelData(c)

    for (let i = 0; i < sample_count; i++) {
      destination_data[i] = source_data[start_sample + i]
    }
  }

  return buffer;
}

export const rerender_unsaved_positions = (ctx: AudioContext, audios: Audio[]) => {
  audios.map(audio => {
    audio.positions.map(position => {
      if (position.track_cut) {
        const buffer = audio.buffer
        const start = position.track_cut.start
        const end = position.track_cut.end

        position.track_cut.buffer = splice_audio_buffer(ctx, buffer, start, end)
      }
    })
  })
}