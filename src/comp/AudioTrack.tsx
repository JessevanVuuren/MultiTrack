import { value_to_percent, map, element_contains_pointer, uid } from "../core/utils"
import { build_sound_line, rerender_unsaved_positions } from '../core/wave'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import { styles } from "../style/AudioTrackStyle"
import { usePlayerTime } from '@motion-canvas/ui'
import { save_audio_buffer } from '../core/local'
import { AudioTrackProps } from '../core/types'
import { get_audio_name } from '../utils/utils'
import { Bin, Cut, Save } from '../icon/icons'
import { Button } from '../dynamics/Button'

export const AudioTrackComp: React.FC<AudioTrackProps> = ({ audio, set_audios, scroll, position, audio_ctx, audios, index }) => {
  const cut_mode = useRef(false)
  const canvas = useRef<HTMLCanvasElement>()
  const element = useRef<HTMLDivElement>()

  const player = usePlayerTime()

  const line = useMemo(() => {
    if (position?.track_cut?.buffer) {
      const data = position.track_cut.buffer.getChannelData(0)
      return build_sound_line(Array.from(data), data.length * 0.005)
    }

    if (!audio?.buffer) return []
    const data = audio.buffer.getChannelData(0)
    return build_sound_line(Array.from(data), data.length * 0.005)
  }, [audio, position])

  const culled_line = () => {

    const context = canvas.current.getContext("2d")

    context.clearRect(0, 0, canvas.current.width, canvas.current.height)

    const can_rect = canvas.current.getBoundingClientRect()
    const ele_rect = element.current.getBoundingClientRect()

    const right_cutoff = Math.max(0, ele_rect.right - can_rect.right)
    const left_cutoff = Math.max(0, can_rect.left - ele_rect.left)

    const right_slice = map(right_cutoff, 0, ele_rect.width, 0, line.length)
    const left_slice = map(left_cutoff, 0, ele_rect.width, 0, line.length)

    const start = Math.max(can_rect.left, ele_rect.left)
    const in_canvas = line.slice(left_slice, line.length - right_slice)

    context.beginPath();
    in_canvas.forEach(point => {

      const x = point[0] * ele_rect.width + start - left_cutoff
      const y = point[1] * 80

      context.lineTo(x, y)
    })

    context.lineWidth = 1
    context.stroke()
  }

  useEffect(() => {
    culled_line()
  }, [scroll])

  useEffect(() => {
    canvas.current.width = canvas.current.offsetWidth
    canvas.current.height = canvas.current.offsetHeight
    culled_line()
  }, [canvas])

  useEffect(() => {
    document.addEventListener("pointerdown", enter_cut_mode)
    return () => {
      document.removeEventListener("pointerdown", enter_cut_mode)
    }
  }, [audio, set_audios, position])

  const enter_cut_mode = (e: PointerEvent) => {
    const track_box = element.current.getBoundingClientRect()
    const cut_button = document.getElementById(position.id)

    if (track_box && !element_contains_pointer(track_box, e) && cut_mode.current) {
      cut_mode.current = false
      return
    }

    if (!cut_mode.current && cut_button) {
      const rect = cut_button.getBoundingClientRect()
      if (element_contains_pointer(rect, e)) {
        cut_mode.current = true
      }

    } else if (track_box && cut_mode.current) {
      cut_mode.current = false

      const cut_position = e.x - track_box.left
      const left_duration = cut_position / track_box.width * position.duration
      const right_duration = (1 - cut_position / track_box.width) * position.duration

      set_audios(prev => prev.map(a => {
        if (a.id == audio.id) {

          a.positions.push({
            id: uid(), offset: position.offset, track_id: position.track_id, duration: left_duration, track_cut: {
              start: 0,
              end: left_duration
            }
          })
          a.positions.push({
            id: uid(), offset: position.offset + left_duration, track_id: position.track_id, duration: right_duration, track_cut: {
              start: left_duration,
              end: left_duration + right_duration
            }
          })
        }

        return a
      }))

      remove()
      rerender_unsaved_positions(audio_ctx, audios)
    }
  }

  const remove = () => {
    set_audios(prev => prev.map(audio => ({
      ...audio, positions: audio.positions.filter(
        pos => pos.id !== position.id)
    })))
  }

  const track_action_style = () => {
    if (!audio.source) return styles.danger_audio
    if (cut_mode.current) return styles.cutting_mode
    if (position.track_cut) return styles.unsaved_audio
  }

  const save_audio_cut = (buffer:AudioBuffer, name: string) => {
    set_audios(prev => [
      ...prev, {
        id: uid(),
        name: name,
        positions: [{
          id: uid(),
          track_id: position.track_id,
          duration: position.duration,
          offset: position.offset,
        }],
        buffer_line: "",
        is_recoding: false,
        duration: position.duration,
        source: `../audio/${name}.wav`,
        buffer: buffer,
      }
    ])
  }

  // const save_recording = (name: string) => {
  //   set_audios(prev => prev.map(a => {
  //     if (!a.source) {
  //       a.source = `../audio/${name}.wav`
  //       a.name = name
  //       a.positions = [{
  //         id: uid(),
  //         track_id: position.track_id,
  //         duration: position.duration,
  //         offset: position.offset,
  //       }]
  //       a.b
  //     }
  //     return a
  //   }))
  // }

  const save_track = () => {
    const name = get_audio_name(audios)
    if (!name) return

    if (position?.track_cut?.buffer) {
      save_audio_buffer(position.track_cut.buffer, name)
      save_audio_cut(position.track_cut.buffer, name)
    } else {
      save_audio_buffer(audio.buffer, name)
      save_audio_cut(audio.buffer, name)
      // save_recording(name)
      
    }
    remove()
  }

  return <>
    <div style={styles.canvas_container}>
      <canvas ref={canvas} style={styles.canvas_overlay}></canvas>
    </div>

    <div class="audio-track-element" ref={element} data-audio="audio" data-id={position.id} style={{
      ...styles.audio_track, ...track_action_style(),
      marginLeft: value_to_percent(position.offset, player.durationTime) + "%",
      width: value_to_percent(position.duration, player.durationTime) + "%",

    }}>


      {!cut_mode.current &&
        <>
          <div data-audio="audio" data-id={position.id} style={styles.audio_track_label}>
            <p data-audio="audio" data-id={position.id} style={styles.audio_file_text}>{position.track_cut ? audio.name + "*" : audio.name}</p>
          </div>
          <div data-audio="audio" data-id={position.id} style={{ ...styles.audio_track_options, zIndex: 11 }}>
            <Button children={<Bin />} onPointerDown={remove} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(230, 1, 88, .4)" }} />

            {audio.source && <div id={position.id} data-id={position.id}><Button children={<Cut />} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} /></div>}
            {(position?.track_cut?.buffer || !audio.source) && <Button onPointerDown={save_track} children={<Save />} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />}
          </div>
        </>
      }
    </div>
  </>
}
