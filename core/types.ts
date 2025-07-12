import { Dispatch, MutableRef, StateUpdater } from "preact/hooks";

export interface Audio {
    id: string
    name: string
    source: string

    offset: number
    active: boolean
    duration: number
    track_id: string
    recoding: boolean

    buffer: AudioBuffer
    buffer_line: string
}

export interface Export {
    data: any
    name: string
    frame: number
    mimeType: string
    subDirectories: string[]
}

export interface SaveState {
    audios: Audio[]
    tracks: Track[]
}

export interface Track {
    id: string
    muted: boolean
    volume: number
    main: boolean
}

export interface StyleSheet {
    [key: string]: React.CSSProperties;
}

export type MultiTrackProps = {
    set_tracks: Dispatch<StateUpdater<Track[]>>
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
    tracks: Track[]
    scroll: number
}

export type RecordProps = {
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audio_ctx: MutableRef<AudioContext>
}

export type AudioFileProps = {
    update_audio: (a: Audio) => void
    audio: Audio
}

export type AudioHierarchyProps = {
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
}

export type AudioTrackProps = {
    scroll: number
    audio: Audio
}

export type TrackLineProps = {
    set_tracks: Dispatch<StateUpdater<Track[]>>
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
    track: Track
    scroll: number
}