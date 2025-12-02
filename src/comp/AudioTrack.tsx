import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { value_to_percent, map, element_contains_pointer, uid } from "../core/utils"
import { styles } from "../style/AudioTrackStyle"
import { usePlayerTime } from '@motion-canvas/ui'
import { build_sound_line } from '../core/wave'
import { AudioTrackProps } from '../core/types'
import { Bin, Cut } from '../icon/icons'
import { Button } from '../dynamics/Button'

export const AudioTrackComp: React.FC<AudioTrackProps> = ({ audio, set_audios, scroll, position }) => {
  const curr_pos_id = useRef<string>();
  const cut_mode = useRef(false)


  const line = useMemo(() => {
    if (!audio?.buffer) return []
    const data = audio.buffer.getChannelData(0)
    return build_sound_line(Array.from(data), data.length * 0.005)
  }, [audio])

  const canvas = useRef<HTMLCanvasElement>()
  const element = useRef<HTMLDivElement>()

  const player = usePlayerTime()

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

  const enter_cut_mode = (e: PointerEvent) => {
    const cut_button = document.getElementById("cut-button")
    const rect = cut_button.getBoundingClientRect()
    if (!cut_mode.current) {
      if (element_contains_pointer(rect, e)) {
        curr_pos_id.current = cut_button.dataset.id
        cut_mode.current = true
      }

    } else if (curr_pos_id.current == position.id) {
      cut_mode.current = false

      const track_width = element.current.getBoundingClientRect().width
      const left_duration = e.offsetX / track_width * audio.duration
      const right_duration = (1 - e.offsetX / track_width) * audio.duration


      set_audios(prev => prev.map(a => {
        if (a.id == audio.id) {
          a.positions.push({ id: uid(), offset: position.offset, track_id: position.track_id, duration: left_duration, unsaved: true })
          a.positions.push({ id: uid(), offset: position.offset + left_duration, track_id: position.track_id, duration: right_duration, unsaved: true })
        }

        return a
      }))

      remove()
    }
  }

  useEffect(() => {
    document.addEventListener("pointerdown", enter_cut_mode)
    return () => {
      document.removeEventListener("pointerdown", enter_cut_mode)
    }
  }, [])

  const remove = () => {
    set_audios(prev => prev.map(audio => ({
      ...audio, positions: audio.positions.filter(
        pos => pos.id !== position.id)
    })))
  }

  const track_action_style = () => {
    if (position.unsaved) return styles.unsaved_audio
    if (curr_pos_id.current === position.id) {
      if (cut_mode.current) return styles.cutting_mode
    }

    return {}
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

      <div data-audio="audio" data-id={position.id} style={styles.audio_track_label}>
        <p data-audio="audio" data-id={position.id} style={styles.audio_file_text}>{audio.name}</p>
      </div>

      <div data-audio="audio" data-id={position.id} style={{ ...styles.audio_track_options, zIndex: 11 }}>
        <Button children={<Bin />} onPointerDown={remove} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(230, 1, 88, .4)" }} />
        <div id="cut-button" data-id={position.id}><Button children={<Cut />} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} /></div>
      </div>
    </div>
  </>
}
