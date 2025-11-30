import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { value_to_percent, map } from "../core/utils"
import { styles } from "../style/AudioTrackStyle"
import { Close, usePlayerTime } from '@motion-canvas/ui'
import { build_sound_line } from '../core/wave'
import { AudioTrackProps } from '../core/types'
import { Bin, Cut } from '../icon/icons'
import { Button } from '../dynamics/Button'

export const AudioTrackComp: React.FC<AudioTrackProps> = ({ audio, set_audios, scroll, position }) => {
  const [cut_mode, set_cut_mode] = useState(false)

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

  const remove = () => {
    set_audios(prev => prev.map(audio => ({
      ...audio, positions: audio.positions.filter(
        pos => pos.id !== position.id)
    })))
  }

  return <>
    <div style={styles.canvas_container}>
      <canvas ref={canvas} style={styles.canvas_overlay}></canvas>
    </div>

    <div class={"testing"} ref={element} data-audio="audio" data-id={position.id} style={{
      ...styles.audio_track,
      marginLeft: value_to_percent(position.offset, player.durationTime) + "%",
      width: value_to_percent(audio.duration, player.durationTime) + "%"
    }}>

      <div data-audio="audio" data-id={position.id} style={styles.audio_track_label}>
        <p data-audio="audio" data-id={position.id} style={styles.audio_file_text}>{audio.name}</p>
      </div>

      <div style={styles.audio_track_options}>
        <Button children={<Bin />} onClick={remove} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(230, 1, 88, .4)" }} />
        <Button children={<Cut />} onClick={() => set_cut_mode(true)} style={styles.audio_options_text} hover_style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
      </div>
    </div>
  </>
}
