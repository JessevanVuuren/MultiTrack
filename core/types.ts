import { Dispatch, StateUpdater } from "preact/hooks";

export interface Audio {
    id: string
    name: string
    offset: number
    source: string
    active: boolean
    duration: number
    track_id: string
    buffer: AudioBuffer
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

    scroll: number
    audios: Audio[]
    tracks: Track[]
}

export type AudioFileProps = {
    update_audio:(a:Audio) => void
    audio: Audio
}

export type AudioTrackProps = {
    scroll: number
    audio: Audio
}

export type TrackLineProps = {
    set_tracks: Dispatch<StateUpdater<Track[]>>
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
    scroll: number
    track: Track
}