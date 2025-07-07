import { array_min_max, map } from "./utils"
import { MutableRef } from "preact/hooks"
import { Audio, Track } from "./types"

const uid = () => {
  return "id" + Math.random().toString(16).slice(2)
}

export const copy_audio = (s: Audio, d: Audio) => {
  d.id = s.id
  d.name = s.name
  d.offset = s.offset
  d.source = s.source
  d.active = s.active
  d.duration = s.duration
  d.track_id = s.track_id
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
  const file_name_rx = /[ \w-]+?(?=\.)/
  return build_audio(file_name_rx.exec(path)[0], buffer, path, track_id)
}

export const build_audio = (name:string, buffer: AudioBuffer, path: string, track_id: string): Audio => {
  return {
    offset: 0,
    id: uid(),
    source: path,
    active: false,
    buffer: buffer,
    track_id: track_id,
    duration: buffer.duration,
    name: name,
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

export const get_source_buffer = async (ctx: AudioContext, path: string) => {
  return await fetch(path)
    .then(res => res.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer));
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
    const x = (i * step)
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
  source.current.stop()
  source.current.disconnect()
  source.current = null
}

export const build_buffer = async (ctx: AudioContext, buffer: MutableRef<AudioBuffer>, audios: Audio[], tracks: Track[], duration: number) => {
  buffer.current = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate)

  audios.forEach(audio => {
    if (!audio.active) return

    const left_source = audio.buffer.getChannelData(0)
    const right_source = audio.buffer.getChannelData(1)

    const left_destination = buffer.current.getChannelData(0)
    const right_destination = buffer.current.getChannelData(1)

    const offset = Math.round(audio.offset * ctx.sampleRate)
    const available_space = buffer.current.length - offset
    const len = Math.min(available_space, audio.buffer.length)

    for (let i = 0; i < len; i++) {
      left_destination[i + offset] += left_source[i]
      right_destination[i + offset] += right_source[i]
    }
  })
}

export const blob_to_AudioBuffer = async (blob_part: BlobPart[], mime_type: string) => {
  const blob = new Blob(blob_part, { type: mime_type })

  const audio_context = new AudioContext();
  const file_reader = new FileReader();

  return new Promise<AudioBuffer | null>((res, rej) => {
    file_reader.onloadend = () => {
      const array_buffer = file_reader.result as ArrayBuffer
      audio_context.decodeAudioData(array_buffer, (audio_buffer) => {
        res(audio_buffer)
      })
    }

    file_reader.onerror = (error) => {
      console.log(error)
      res(null)
    }

    file_reader.readAsArrayBuffer(blob)
  })


}