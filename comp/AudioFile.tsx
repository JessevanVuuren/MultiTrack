/* @jsxImportSource preact */
import { Button, Separator } from '@motion-canvas/ui'
import { Audio, AudioFileProps } from '../core/types'
import { useEffect, useState } from 'preact/hooks'
import { format_duration } from "../core/utils"
import { audio_polyline } from '../core/wave'
import { styles } from '../style/styles'


export const AudioFileComp: React.FC<AudioFileProps> = ({ audio, update_audio }) => {
  const [polyline, set_polyline] = useState("")

  const [loading, set_loading] = useState(true)
  const [edit_rec, set_edit_rec] = useState(false)

  const update_state = () => {
    const a: Audio = { ...audio, active: !audio.active }
    update_audio(a)

  }

  useEffect(() => {
    (async () => {
      set_polyline(audio_polyline(audio.buffer, 1000))
      set_loading(false)
    })()
  }, [])

  return <div style={styles.audio_file}>
    <svg style={styles.svg_polyline_file} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={polyline} fill="none" stroke="rgba(255, 255, 255, 0.09)" strokeWidth={0.5} />
    </svg>
    <div style={styles.audio_file_padding}>
      <div style={styles.audio_file_container}>
        {audio.recoding && edit_rec
          ? <input placeholder={audio.name} style={styles.recording_input} />
          : <p style={styles.audio_file_text}>{audio.name}</p>}

        {!edit_rec && <Button onClick={() => set_edit_rec(true)}>Edit</Button>}

        <div style={{ marginTop: 3 }}>
          {audio.active ?
            <Button loading={loading} onClick={update_state}>Deactivate</Button> :
            <Button loading={loading} onClick={update_state}>Activate</Button>
          }
        </div>
      </div>
      <Separator size={1} />
      <div style={styles.audio_file_container}>
        <div style={{ width: 10 }}>
          {audio.active ?
            <p style={{ ...styles.audio_file_text, color: "#14F06F", fontSize: 14 }}>ACTIVE</p> :
            <p style={{ ...styles.audio_file_text, color: "#E60158", fontSize: 14 }}>INACTIVE</p>
          }
        </div>
        <p style={styles.audio_duration}>{format_duration(audio.buffer.duration)}</p>
      </div>
    </div>

  </div>
}