/* @jsxImportSource preact */
import { TrackLineComp } from './TrackLine'
import { Button } from '@motion-canvas/ui'
import { MultiTrackProps } from '../types'
import { add_track } from '../wave'
import { styles } from '../styles'


export const TrackListComp: React.FC<MultiTrackProps> = ({ audios, tracks, set_tracks, set_audios, scroll }) => {


  return (
    <div style={styles.audio_timeline_style} >
      <div style={styles.separator_style} />

      {tracks.map(track => {
        return <>
          <TrackLineComp audios={audios.filter(audio => audio.track_id == track.id)} set_tracks={set_tracks} track={track} scroll={scroll} set_audios={set_audios} />
          <div style={styles.separator_style} />
        </>
      })}

      <div style={styles.add_audio_style} onPointerDown={() => set_tracks(prev => [...prev, add_track()])}><Button>add track</Button></div>
    </div>

  );
}