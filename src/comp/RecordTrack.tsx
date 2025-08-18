import { value_to_percent } from "../core/utils"
import { usePlayerTime } from '@motion-canvas/ui'
import { RecordTrackProps } from '../core/types'
import { styles } from '../style/styles'

export const RecordTrackComp: React.FC<RecordTrackProps> = ({ audio }) => {
  const player = usePlayerTime()

  return (<>
    <div style={{
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
