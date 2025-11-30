import { Button, Separator } from '@motion-canvas/ui'
import { useEffect, useState } from 'preact/hooks'
import { save_audio_buffer } from '../core/local'
import { format_duration, uid } from "../core/utils"
import { AudioFileProps } from '../core/types'
import { audio_polyline } from '../core/wave'
import { styles } from '../style/styles'



export const AudioFileComp: React.FC<AudioFileProps> = ({ audio, set_audios, audios }) => {
  const [polyline, set_polyline] = useState("")
  const [loading, set_loading] = useState(true)

  const place_audio = async () => {
    set_audios(prev => prev.map(a => {
      if (a.id == audio.id) {
        a.positions.push({
          track_id:"default",
          id:uid(),
          offset:0,
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

  const save_recording = async () => {
    const name = prompt("Name of audio file:")

    if (!name) {
      alert("Filename cannot be empty")
      return
    }

    if (audios.some(e => e.name == name)) {
      alert("Filename already exists")
      return
    }

    audio.name = name
    save_audio_buffer(audio.buffer, name)

    set_audios(prev => prev.map(a => {
      if (a.id == audio.id) {
        a.name = name
        a.source = `../audio/${name}.wav`
      }

      return a
    }))
  }

  const remove_recording = () => {
    set_audios(prev => prev.filter(a => a.id !== audio.id))
  }

  return <div style={styles.audio_file}>
    <svg style={styles.svg_polyline_file} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={polyline} fill="none" stroke="rgba(255, 255, 255, 0.09)" strokeWidth={0.5} />
    </svg>
    <div style={styles.audio_file_padding}>
      <div style={styles.audio_file_container}>

        <p style={styles.audio_file_text}>{audio.name}</p>
        <div style={{ marginTop: 3, display: "flex" }}>

          {audio.source == "" &&
            <div style={{ display: "flex" }}>
              <Button style={{ marginRight: 5 }} onClick={save_recording}>save</Button>
              <Button style={{ marginRight: 5 }} onClick={remove_recording}>remove</Button>
            </div>
          }

          <Button loading={loading} onClick={place_audio}>Place</Button>

        </div>
      </div>
      <Separator size={1} />
      <div style={styles.audio_file_container}>
        <p style={styles.audio_duration}>{format_duration(audio.buffer.duration)}</p>
      </div>
    </div>
  </div>
}
