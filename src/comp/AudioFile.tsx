import { format_duration, uid } from "../core/utils"
import { useEffect, useState } from 'preact/hooks'
import { styles } from '../style/AudioFileStyle'
import { AudioFileProps } from '../core/types'
import { audio_polyline } from '../core/wave'
import { Button } from '@motion-canvas/ui'


export const AudioFileComp: React.FC<AudioFileProps> = ({ audio, set_audios, audios }) => {
  const [polyline, set_polyline] = useState("")
  const [loading, set_loading] = useState(true)

  const place_audio = async () => {
    set_audios(prev => prev.map(a => {
      if (a.id == audio.id) {
        a.positions.push({
          track_id: "default",
          id: uid(),
          offset: 0,
          duration: audio.duration
        })
      }
      return a
    }))
  }

  useEffect(() => {
    (async () => {
      if (!audio.buffer_line) {
        const line = audio_polyline(audio.buffer, 1000)
        audio.buffer_line = line
        set_polyline(line)
      } else {
        set_polyline(audio.buffer_line)
      }
      set_loading(false)
    })()

  }, [])

  const remove_recording = async () => {
    const filename = audio.source.replace(/^.*[\\/]/, '')
    if (!confirm(`Deleting audio file: ${filename}`)) return

    const remove = await fetch(`/remove?name=${encodeURIComponent(filename)}`)
    if (remove.ok) {
      set_audios(prev => prev.filter(a => a.id !== audio.id))
    }
  }

  return <div style={styles.audio_file}>
    <svg style={styles.svg_polyline_file} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={polyline} fill="none" stroke="rgba(255, 255, 255, 0.09)" strokeWidth={0.5} />
    </svg>
    <div style={styles.audio_file_padding}>

      <div style={styles.audio_file_container}>

        <p style={styles.audio_file_text}>{audio.name}</p>
        <p style={styles.audio_duration}>{format_duration(audio.buffer.duration)}</p>

      </div>

      <div style={styles.audio_file_container}>
        <Button style={{ marginBottom: 10 }} loading={loading} onClick={place_audio}>Place</Button>
        <Button onClick={remove_recording}>remove</Button>
      </div>
    </div>
  </div>
}
