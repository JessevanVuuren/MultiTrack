import { MultiTrackProps } from '../core/types'
import { TrackLineComp } from './TrackLine'
import { Button } from '@motion-canvas/ui'
import { add_track } from '../core/wave'
import { styles } from '../style/styles'

export const TrackListComp: React.FC<MultiTrackProps> = ({ audios, tracks, set_tracks, set_audios, scroll, audio_ctx }) => {

  return (
    <div style={styles.audio_timeline_style} >
      <div style={styles.separator_style} />

      {tracks.map(track => {
        return <>
          <TrackLineComp audios={audios} set_tracks={set_tracks} track={track} scroll={scroll} set_audios={set_audios} audio_ctx={audio_ctx} />
          <div style={styles.separator_style} />
        </>
      })}

      <div style={styles.add_audio_style} onPointerDown={() => set_tracks(prev => [...prev, add_track()])}><Button>add track</Button></div>
    </div>
  );
}
