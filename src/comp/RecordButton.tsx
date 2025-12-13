import { blob_to_AudioBuffer, unlink_audio } from "../core/wave"
import { useApplication, usePlayerTime } from "@motion-canvas/ui"
import { useEffect, useRef, useState } from "preact/hooks"
import { Audio, RecordProps } from "../core/types"
import { uid } from "../core/utils"

export const RecordComp: React.FC<RecordProps> = ({ set_audios, audio_ctx }) => {
  const analyser = audio_ctx.createAnalyser()
  const [recoding, set_recording] = useState(false)

  const record = useRef<MediaRecorder>(null)
  const stream = useRef<MediaStream>(null)

  const audio_data = useRef<BlobPart[]>([])
  const audio_ref = useRef<Audio>()

  const player_time = usePlayerTime()
  const app = useApplication()

  useEffect(() => {
    if (audio_ref.current) {
      const duration = player_time.time - audio_ref.current.positions[0].offset
      audio_ref.current.duration = duration
      audio_ref.current.positions[0].duration = duration
    }

    if (recoding && player_time.completion == 1) {
      stop_recording()
    }
  }, [player_time])


  const activate_recorder = async (): Promise<boolean> => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      try {
        const _stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const _record = new MediaRecorder(_stream)

        const source = audio_ctx.createMediaStreamSource(_stream);
        source.connect(analyser);

        stream.current = _stream
        record.current = _record

        return true

      } catch (err) {
        console.error(`The following getUserMedia error occurred: ${err}`);
      }
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }

  const toggle_record = async () => {

    if (!recoding && await activate_recorder()) {
      app.player.togglePlayback(true)
      set_recording(true)

      initialize_audio_ref()
      record.current.start()

      record.current.onstop = () => {
        recording_to_audio()
      }

      record.current.ondataavailable = (e) => {
        audio_data.current.push(e.data)
      }

    } else {
      stop_recording()
    }
  }

  const stop_recording = () => {
    app.player.togglePlayback(false)
    set_recording(false)
    record.current.stop()
    stream.current.getTracks().forEach(e => e.stop())
  }

  const initialize_audio_ref = () => {
    if (!audio_ref.current) {
      const id = uid()
      audio_ref.current = {
        id: id,
        duration: 0,
        is_recoding: true,
        buffer_line: "",
        name: id,

        positions: [{
          id: uid(),
          track_id: "default",
          offset: player_time.time,
          duration: 0
        }],
      }
      set_audios(prev => [...prev, audio_ref.current])
    }
  }

  const remove_audio = (id: string) => {
    set_audios(prev => prev.filter(a => a.id !== id))
  }

  const add_audio = (audio: Audio) => {
    set_audios(prev => [...prev, audio])
  }

  const recording_to_audio = async () => {
    if (audio_ctx) {

      const type = record.current.mimeType
      const buffer = await blob_to_AudioBuffer(audio_ctx, audio_data.current, type)

      const audio = unlink_audio(audio_ref.current)

      audio.buffer = buffer
      audio.is_recoding = false

      remove_audio(audio_ref.current.id)
      add_audio(audio)

      audio_ref.current = null
      audio_data.current = []
    }
  }

  return <div onPointerDown={toggle_record} style={{ userSelect: "none" }}>
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" stroke="currentColor" fill="none" stroke-width={14} />
      <circle cx="50" cy="50" r="15" fill="rgb(230, 1, 88)" />
    </svg>
  </div>
}
