import { Dispatch, StateUpdater } from "preact/hooks";

export interface Audio {
    id: string
    name: string
    source: string
    duration: number
    recoding: boolean

    positions: TrackPositions[]

    buffer?: AudioBuffer
    buffer_line: string
}

export interface TrackPositions {
    duration: number
    track_id: string
    unsaved: boolean
    offset: number
    id: string
}

export interface Export {
    data: any
    name: string
    frame: number
    mimeType: string
    subDirectories: string[]
}

export interface SaveState {
    version: string
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
    audio_ctx: AudioContext
}

export type AudioFileProps = {
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
    audio: Audio
}

export type AudioHierarchyProps = {
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
}

export type AudioTrackProps = {
    set_audios: Dispatch<StateUpdater<Audio[]>>
    position: TrackPositions
    scroll: number
    audio: Audio
}

export type RecordTrackProps = {
    audio: Audio
}

export type TrackLineProps = {
    set_tracks: Dispatch<StateUpdater<Track[]>>
    set_audios: Dispatch<StateUpdater<Audio[]>>
    audios: Audio[]
    track: Track
    scroll: number
}