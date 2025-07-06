/* @jsxImportSource preact */
import { Tab, Pane, usePlayerState, usePlayerTime, PluginTabProps, makeEditorPlugin, Tune } from '@motion-canvas/ui'
import { promise_to_path, element_contains_pointer, value_to_percent, throttle } from "./core/utils"
import { add_track, build_buffer, copy_audio, load_audio, pause_play } from './core/wave'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { Audio, MultiTrackProps, Track } from './core/types'
import { load_saved_state, save_state } from './core/local'
import { createPortal } from 'preact/compat'
import { createElement } from 'preact'

import { AudioFileComp } from './comps/AudioFile'
import { TrackListComp } from './comps/TrackList'

const audio_ctx = new AudioContext()


const IndexAudioHierarchy = () => {
  const [scroll, set_scroll] = useState<number>()
  const [tracks, set_tracks] = useState<Track[]>([])
  const [audios, set_audios] = useState<Audio[]>([])
  const [loading, set_loading] = useState(true)
  const placeholder = useRef<HTMLDivElement>()
  const timeline = useRef<HTMLDivElement>()

  const audio_source = useRef<AudioBufferSourceNode>()
  const audio_buffer = useRef<AudioBuffer>()

  const player_state = usePlayerState()
  const player_time = usePlayerTime()

  const mouse_offset = useRef<number>(0)
  const selected = useRef<string>("")

  useEffect(() => {
    if (loading) return
    pause_play(!player_state.paused, audio_source, audio_ctx, audio_buffer, player_time.time)
  }, [player_state]) // pause play

  useEffect(() => {

    (async () => {
      const files = import.meta.glob('../audio/*')
      const paths = await promise_to_path(files)
      let state = paths.find(f => f.includes("multi-track.json"))

      const loaded_audio: Audio[] = []
      const loaded_track: Track[] = []

      for await (const path of paths) {
        if (path.includes("multi-track.json")) continue

        const audio = await load_audio(path, audio_ctx, "")
        loaded_audio.push(audio)
      }

      if (state) {
        const config = await load_saved_state(state)

        if (config) {
          loaded_track.push(...config.tracks)

          loaded_audio.forEach(audio => {
            const audio_state = config.audios.find(a => audio.name == a.name)

            if (audio_state) {
              copy_audio(audio_state, audio)
            } else {
              audio.track_id = loaded_track[0].id
            }
          })
        }
      }

      if (!loaded_track.length) {
        loaded_track.push(add_track(true))
      }

      console.log("all audio loaded")

      set_audios(loaded_audio)
      set_tracks(loaded_track)
      set_loading(false)
    })()

  }, []) // load audio and config

  useEffect(() => {

    const div_list = Array.from(document.getElementsByTagName("div"))
    const timeline_element = div_list.find(e => e.className.includes("_trackContainer"))

    if (!timeline_element) return

    const holder = document.createElement("div");
    const scene_track_element = Array.from(timeline_element.children).filter(e => {
      return e.className.includes("_sceneTrack") || e.className.includes("_labelTrack")
    })

    scene_track_element.forEach(child => holder.appendChild(child));
    timeline_element.appendChild(holder);

    placeholder.current = holder
    timeline.current = timeline_element
  }, []) // add timeline by injecting into _trackContainer

  useEffect(() => {
    document.addEventListener("pointerdown", pointer_down)
    document.addEventListener("pointermove", drag_and_drop)
    document.addEventListener("pointerup", pointer_up)
    document.addEventListener("wheel", on_scroll)
    return () => {
      document.removeEventListener("pointerdown", pointer_down)
      document.removeEventListener("pointermove", drag_and_drop)
      document.removeEventListener("pointerup", pointer_up)
      document.removeEventListener("wheel", on_scroll)
    }
  }, []) // add eventlistener for drag and drop

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (loading) return
      console.log("save to disk and rebuild")
      build_buffer(audio_ctx, audio_buffer, audios, tracks, player_time.durationTime)
      save_state(audios, tracks)
    }, 500);

    throttled_call(on_scroll)

    return () => clearTimeout(timeOutId)
  }, [audios, tracks])

  const pointer_up = () => selected.current = ""
  const on_scroll = () => set_scroll(scroll + 1)

  const throttled_call = useCallback(
    throttle((callback_func: () => void) => {
      callback_func();
    }, 16),
    []
  );

  const place_multi_track = () => {
    if (!placeholder.current) return

    const props = { audios, tracks, set_tracks, set_audios, scroll } as MultiTrackProps
    const element = createElement(TrackListComp, props)

    return createPortal(element, placeholder.current.children[1])
  }

  const pointer_down = (e: PointerEvent) => {
    mouse_offset.current = -e.offsetX

    const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;

    if (element.dataset.audio === "audio") {
      selected.current = element.dataset.id
    }
  }

  const drag_and_drop = (e: PointerEvent) => {
    if (e.buttons === 4 || e.buttons === 1) {
      throttled_call(on_scroll)
    }

    if (e.buttons !== 1) return

    const timeline_rect = timeline.current.getBoundingClientRect()
    const over_timeline = element_contains_pointer(timeline_rect, e)

    if (!over_timeline) return

    switch_track(e)
    move_audio(e, timeline_rect)

  }

  const switch_track = (e: PointerEvent) => {
    const all_dom_elements = timeline.current.querySelectorAll("div")
    const tracks = new Array(...all_dom_elements).filter(e => e.dataset.track)
    const track = tracks.find(track => element_contains_pointer(track.getBoundingClientRect(), e))

    if (track) {
      const track_id = track.dataset.id

      set_audios(prev => prev.map(e => {
        if (e.id == selected.current) {
          e.track_id = track_id
        }
        return e
      }))
    }
  }

  const move_audio = (e: PointerEvent, timeline_rect: DOMRect) => {
    const diff = e.clientX - timeline_rect.left + mouse_offset.current
    const percent = value_to_percent(diff, timeline_rect.width)
    const seconds = (player_time.durationTime / 100) * percent

    set_audios(prev => prev.map(e => {
      if (e.id == selected.current) {
        e.offset = seconds
      }
      return e
    }))
  }

  const update_audio = (a: Audio) => {
    set_audios(prevAudios =>
      prevAudios.map(audio =>
        audio.id === a.id ? a : audio
      )
    );
  }

  return <Pane title="MultiTrack" id="custom-pane">
    {place_multi_track()}
    {audios.length > 0 && audios.map(audio =>
      <AudioFileComp key={audio.id} audio={audio} update_audio={update_audio} />)
    }
  </Pane>
}


const MultiTrackTab = ({ tab }: PluginTabProps) => <Tab title="MultiTrack" id="custom-tab" tab={tab}><Tune /></Tab>

export default makeEditorPlugin({
  tabs: [{
    name: "MultiTrack",
    tabComponent: MultiTrackTab,
    paneComponent: IndexAudioHierarchy,
  }],
  name: 'timeline-overlay',
});

