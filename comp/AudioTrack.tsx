/* @jsxImportSource preact */
import { useEffect, useMemo, useRef } from 'preact/hooks'
import { value_to_percent, map } from "../core/utils"
import { usePlayerTime } from '@motion-canvas/ui'
import { build_sound_line } from '../core/wave'
import { AudioTrackProps } from '../core/types'
import { styles } from '../style/styles'

export const AudioTrackComp: React.FC<AudioTrackProps> = ({ audio, scroll }) => {
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

  return (<>
    <div style={styles.canvas_container}>
      <canvas data-audio="audio" data-id={audio.id} ref={canvas} style={styles.canvas_overlay}></canvas>
    </div>

    <div ref={element} data-audio="audio" data-id={audio.id} style={{
      ...styles.audio_track,
      marginLeft: value_to_percent(audio.offset, player.durationTime) + "%",
      width: value_to_percent(audio.duration, player.durationTime) + "%"
    }}>

      <div data-audio="audio" data-id={audio.id} style={styles.audio_track_label}>
        <p data-audio="audio" data-id={audio.id} style={styles.audio_file_text}>{audio.name}</p>
      </div>

    </div>
  </>
  )
}
