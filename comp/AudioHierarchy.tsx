/* @jsxImportSource preact */

import { Audio, AudioHierarchyProps } from '../core/types'
import { AudioFileComp } from './AudioFile'

export const AudioHierarchyComp: React.FC<AudioHierarchyProps> = ({ audios, set_audios }) => {
  const update_audio = (a: Audio) => {
    set_audios(prevAudios =>
      prevAudios.map(audio =>
        audio.id === a.id ? a : audio
      )
    );
  }

  return <div>
    {audios.length > 0 && audios.map(audio => {
      if (audio.recoding) return
      return <AudioFileComp key={audio.id} audio={audio} set_audios={set_audios} audios={audios} />
    })}
  </div>
}
