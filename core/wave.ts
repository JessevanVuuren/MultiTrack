import { array_min_max, map } from "./utils"
import { MutableRef } from "preact/hooks"
import { Audio, Track } from "./types"

export const uid = () => {
  return "id" + Math.random().toString(16).slice(2)
}

export const copy_audio = (s: Audio, d: Audio) => {
  d.id = s.id
  d.name = s.name
  d.source = s.source

  d.active = s.active
  d.offset = s.offset
  d.duration = s.duration
  d.track_id = s.track_id

  d.buffer = s.buffer
  d.buffer_line = s.buffer_line

  d.recoding = s.recoding
}

export const unlink_audio = (s: Audio): Audio => {
  return {
    id: s.id,
    name: s.name,
    source: s.source,
    active: s.active,
    offset: s.offset,
    duration: s.duration,
    track_id: s.track_id,
    buffer: s.buffer,
    buffer_line: s.buffer_line,
    recoding: s.recoding,
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

export const build_audio = (name: string, buffer: AudioBuffer, path: string, track_id: string, recoding: boolean, active: boolean): Audio => {
  return {
    id: uid(),
    name: name,
    source: path,

    offset: 0,
    active: active,
    track_id: track_id,
    duration: buffer.duration,

    recoding: recoding,

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
  buffer.current = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate)

  audios.forEach(audio => {
    if (!audio.active || audio.recoding) return

    const track = get_track(audio.track_id, tracks)
    if (track.muted) return

    const left_source = audio.buffer.getChannelData(0)
    const right_source = audio.buffer.getChannelData(1)

    const left_destination = buffer.current.getChannelData(0)
    const right_destination = buffer.current.getChannelData(1)

    const offset = Math.round(audio.offset * ctx.sampleRate)
    const available_space = buffer.current.length - offset
    const len = Math.min(available_space, audio.buffer.length)

    for (let i = 0; i < len; i++) {
      left_destination[i + offset] += left_source[i] * (track.volume / 100)
      right_destination[i + offset] += right_source[i] * (track.volume / 100)
    }
  })
}

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


