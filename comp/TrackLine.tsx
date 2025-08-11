/* @jsxImportSource preact */
import { Button, Close, VolumeOff, VolumeOn } from '@motion-canvas/ui'
import { clamp, element_contains_pointer, map } from '../core/utils'
import { useEffect, useRef, useState } from 'preact/hooks'
import { TrackLineProps } from '../core/types'
import { AudioTrackComp } from './AudioTrack'
import { styles } from '../style/styles'
import { RecordTrackComp } from './RecordTrack'

export const TrackLineComp: React.FC<TrackLineProps> = ({ audios, track, scroll, set_tracks, set_audios }) => {
  const [knob_offset, set_knob_offset] = useState(map(track.volume, 0, 100, 14, 131))

  const [volume_control, set_volume_control] = useState(false)
  const [sure_delete, set_sure_delete] = useState(false)

  const slider_rect = useRef<HTMLDivElement>()
  const slider_knob = useRef<HTMLDivElement>()
  const volume_icon = useRef<HTMLDivElement>()

  useEffect(() => {
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerdown", move)

    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerdown", move)
    }
  }, [volume_control])

  const remove = () => {
    if (!audios.length) {
      remove_track()
    } else {
      set_sure_delete(true)
    }
  }

  const remove_track = () => {
    set_audios(prev => prev.map(audio => {
      if (audio.track_id == track.id) {
        audio.track_id = ""
        audio.active = false
        audio.offset = 0
      }

      return audio
    }))


    set_tracks(prev => prev.filter(t => {
      return t.id !== track.id
    }))
  }


  const set_volume = (n: number) => {
    set_tracks(prev => prev.map(t => {

      if (t.id == track.id) {
        const v = Math.round(n)

        t.volume = v
        t.muted = !v
      }

      return t
    }))
  }


  const move = (e: PointerEvent) => {
    
    if (volume_control) {

      const icon_r = volume_icon.current.getBoundingClientRect()

      if (!element_contains_pointer(icon_r, e)) {
        set_volume_control(false)
      }
    }

    if (e.buttons !== 1 || !slider_knob.current) return

    const slider_r = slider_rect.current.getBoundingClientRect()

    if (element_contains_pointer(slider_r, e)) {
      const diff = e.clientX - slider_r.left

      const offset = clamp(diff, 14, 134.75) - 3.75
      const volume = map(offset, 10.25, 131, 0, 100)

      set_knob_offset(offset)
      set_volume(volume)
    }
  }

  const mute_track = () => {
    set_tracks(prev => prev.map(t => {
      if (t.id == track.id) {
        if (t.volume > 0) {
          t.muted = !t.muted
        }
      }
      return t
    }))
  }

  return <div>

    <div style={styles.track_control}>
      <div style={styles.track_audio}>

        {audios.length && sure_delete && !track.main ?
          <div style={styles.sure_remove_track}>
            <p style={{ margin: 0, fontSize: 17 }}>Delete track with {audios.length} sound{audios.length > 1 && "s"}</p>

            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <Button onPointerDown={remove_track}>Delete</Button>
              <div style={{ width: 10 }}></div>
              <Button onPointerDown={() => set_sure_delete(false)} >Cancel</Button>
            </div>
          </div>
          :
          <>
            <div style={styles.track_delete} >
              <div onPointerDown={mute_track} onPointerOver={() => set_volume_control(true)}>
                {track.muted ? <VolumeOff /> : <VolumeOn />}
                <div ref={volume_icon} style={styles.background_volume} />
              </div>



              {volume_control &&
                <div ref={slider_rect} style={styles.slider_rect}>
                  <div ref={slider_knob} style={{ left: knob_offset, ...styles.slider_knob, backgroundColor: "var(--theme)" }} />
                  {track.muted && track.volume > 0 && <div style={{ left: knob_offset, ...styles.slider_knob, }} />}

                  <div style={styles.slider_rail} />
                </div>
              }
            </div>

            {!track.main && <div style={styles.track_delete} onPointerDown={remove}><Close /></div>}



          </>
        }
      </div>
    </div>
    <div data-track="track" data-id={track.id} style={styles.track_line}>
      {audios.map(audio => {
        if (!audio.active) return

        if (audio.recoding) {
          return <RecordTrackComp audio={audio} />
        } else {
          return <AudioTrackComp audio={audio} scroll={scroll} />

        }
      })}
    </div>
  </div>

}
