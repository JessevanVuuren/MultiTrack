import { Tab, Pane, usePlayerState, PluginTabProps, makeEditorPlugin, Tune, useApplication } from '@motion-canvas/ui'
import { Audio, AudioHierarchyProps, MultiTrackProps, RecordProps, Track } from './core/types'
import { add_track, build_buffer, copy_audio, load_audio, pause_play } from './core/wave'
import { element_contains_pointer, value_to_percent, throttle } from "./core/utils"
import { load_saved_state, save_audio_buffer, save_state } from './core/local'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { check_version } from "./utils/utils"
import { createPortal } from 'preact/compat'
import { createElement } from 'preact'


import { AudioHierarchyComp } from './comp/AudioHierarchy'
import { TrackListComp } from './comp/TrackList'
import { RecordComp } from './comp/RecordButton'

const audio_ctx = new AudioContext()

import pkg from '../package.json' assert { type: 'json' };

const MultiTrackTab = ({ tab }: PluginTabProps) => {

  const [tracks, set_tracks] = useState<Track[]>([])
  const [audios, set_audios] = useState<Audio[]>([])
  const [scroll, set_scroll] = useState<number>()
  const [loading, set_loading] = useState(true)
  const [rerender, set_rerender] = useState(0)

  const placeholder = useRef<HTMLDivElement>()
  const timeline = useRef<HTMLDivElement>()
  const controls = useRef<HTMLDivElement>()
  const hierarchy = useRef<HTMLElement>()

  const audio_source = useRef<AudioBufferSourceNode>()
  const audio_buffer = useRef<AudioBuffer>()

  const player_state = usePlayerState()
  const app = useApplication()

  const mouse_offset = useRef<number>(0)
  const selected = useRef<string>("")


  useEffect(() => {
    if (loading) return
    const current_time = app.player.playback.frame / app.player.playback.fps
    pause_play(!player_state.paused, audio_source, audio_ctx, audio_buffer, current_time)
  }, [player_state]) // pause play

  useEffect(() => {

    (async () => {

      const files = await (await fetch("/audios")).json() as string[]

      let state = files.find(f => f.includes("multi-track.json"))

      const loaded_audio: Audio[] = []
      const loaded_track: Track[] = []

      for await (const path of files) {
        if (path.includes("multi-track.json")) continue

        const audio = await load_audio("./audio/" + path, audio_ctx, "")
        loaded_audio.push(audio)
      }

      if (state) {
        const config = await load_saved_state("./audio/" + state)
        check_version(config.version, pkg.version);

        if (config) {
          loaded_track.push(...config.tracks)

          loaded_audio.forEach(audio => {
            const audio_state = config.audios.find(a => audio.name == a.name)

            if (audio_state) {
              audio_state.buffer = audio.buffer
              copy_audio(audio_state, audio)
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
    get_pane_element()
    const div_list = Array.from(document.getElementsByTagName("div"))
    const timeline_element = div_list.find(e => e.className.includes("_trackContainer"))
    const controls_element = div_list.find(e => e.className.includes("_playback"))

    if (!timeline_element) return

    const holder = document.createElement("div");
    const scene_track_element = Array.from(timeline_element.children).filter(e => {
      return e.className.includes("_sceneTrack") || e.className.includes("_labelTrack")
    })


    scene_track_element.forEach(child => holder.appendChild(child));
    timeline_element.appendChild(holder);

    placeholder.current = holder

    timeline.current = timeline_element
    controls.current = controls_element

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
      const duration_time = app.player.playback.duration / app.player.playback.fps
      build_buffer(audio_ctx, audio_buffer, audios, tracks, duration_time)
      save_state(audios, tracks, pkg.version)
    }, 500);

    throttled_call(on_scroll)

    const recording = audios.some(a => a.recoding)
    if (!recording) {
      app.player.togglePlayback(false)
    }

    return () => clearTimeout(timeOutId)
  }, [audios, tracks]) // rebuild audio buffer

  useEffect(() => {
    document.addEventListener("multi-track:prepare", () => build_output_audio());

    const build_output_audio = async () => {
      await save_audio_buffer(audio_buffer.current, "multi-track-audio")
      document.dispatchEvent(new CustomEvent("multi-track:finalize"));
    }

  }, []) // build audio file for export ffmpeg render

  const pointer_up = () => {
    selected.current = ""
    mouse_offset.current = 0
  }
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
    placeholder.current.children[1].setAttribute("style", "display:flex;flex-direction:column")

    return createPortal(element, placeholder.current.children[1])
  }

  const place_hierarchy = () => {
    if (!hierarchy.current) return

    const props = { audios, set_audios } as AudioHierarchyProps
    const element = createElement(AudioHierarchyComp, props)

    return createPortal(element, hierarchy.current.children[1])
  }

  const place_record_button = () => {
    if (!controls.current) return

    const props = { set_audios, audio_ctx } as RecordProps
    const element = createElement(RecordComp, props)

    return createPortal(element, controls.current.children[1])
  }

  const pointer_down = (e: PointerEvent) => {
    const elements = document.getElementsByClassName("testing")
    Array.from(elements).forEach(el => {
      const rect = el.getBoundingClientRect()

      if (element_contains_pointer(rect, e)) {
        const html_el = el as HTMLElement
        if (html_el.dataset.audio === "audio") {
          selected.current = html_el.dataset.id
          mouse_offset.current = e.clientX - rect.left
        }
      }
    })
  }

  const drag_and_drop = (e: PointerEvent) => {
    if (e.buttons === 4 || e.buttons === 1) {
      throttled_call(on_scroll)
    }

    if (e.buttons !== 1) return

    const timeline_rect = timeline.current.getBoundingClientRect()

    switch_track(e)
    move_audio(e, timeline_rect)

  }

  const switch_track = (e: PointerEvent) => {
    const all_dom_elements = timeline.current.querySelectorAll("div")
    const tracks = new Array(...all_dom_elements).filter(e => e.dataset.track)
    const track = tracks.find(track => element_contains_pointer(track.getBoundingClientRect(), e))

    if (track) {
      const track_id = track.dataset.id

      set_audios(prev => prev.map(a => {
        a.positions.map(p => {
          if (p.id == selected.current) {
            p.track_id = track_id
          }
        })
        return a
      }))
    }
  }

  const move_audio = (e: PointerEvent, timeline_rect: DOMRect) => {
    const diff = e.clientX - timeline_rect.left - mouse_offset.current
    const percent = value_to_percent(diff, timeline_rect.width)
    const duration_time = app.player.playback.duration / app.player.playback.fps
    const seconds = (duration_time / 100) * percent

    set_audios(prev => prev.map(a => {
      a.positions.map(p => {
        if (p.id == selected.current) {
          p.offset = seconds
        }
      })
      return a
    }))
  }

  const get_pane_element = async () => {

    setTimeout(() => {
      const element = document.getElementById("multi-track-pane")

      if (!element) get_pane_element()
      set_rerender(rerender + 1)
      hierarchy.current = element
    }, 250)
  }

  return <Tab onPointerDown={get_pane_element} title="MultiTrack" id="custom-tab" tab={tab}>
    {place_multi_track()}
    {place_record_button()}
    <div key={rerender}>{place_hierarchy()}</div>
    <Tune />
  </Tab>
}

const IndexAudioHierarchy = () => <Pane title="MultiTrack" id="multi-track-pane"><p></p></Pane>

const MultiTrack = makeEditorPlugin({
  tabs: [{
    name: "MultiTrack",
    tabComponent: MultiTrackTab,
    paneComponent: IndexAudioHierarchy,
  }],
  name: 'timeline-overlay',
});

export default MultiTrack;
