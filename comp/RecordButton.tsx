/* @jsxImportSource preact */

import { blob_to_AudioBuffer, build_audio } from "../core/wave"
import { useApplication } from "@motion-canvas/ui"
import { useRef, useState } from "preact/hooks"
import { RecordProps } from "../core/types"


export const RecordComp: React.FC<RecordProps> = ({ set_audios, audio_ctx }) => {
  const [recoding, set_recording] = useState(false)

  const record = useRef<MediaRecorder>(null)
  const stream = useRef<MediaStream>(null)

  const data = useRef<BlobPart[]>([])

  const app = useApplication()

  const activate_recorder = async (): Promise<boolean> => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      try {
        const _stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const _record = new MediaRecorder(_stream)

        stream.current = _stream
        record.current = _record

        return true

      } catch (err) { error_occurred(err) }
    } else not_supported()
  }

  const toggle_record = async () => {
    set_recording(!recoding)
    app.player.togglePlayback()

    if (!recoding && await activate_recorder()) {
      record.current.start()

      record.current.onstop = () => {
        build()
      }

      record.current.ondataavailable = (e) => {
        data.current.push(e.data)
      }

    } else {
      record.current.stop()
      stream.current.getTracks().forEach(e => e.stop())
    }
  }

  const not_supported = () => {
    console.log("getUserMedia not supported on your browser!");
  }

  const error_occurred = (err: string) => {
    console.error(`The following getUserMedia error occurred: ${err}`);
  }


  const build = async () => {
    const type = record.current.mimeType
    const buffer = await blob_to_AudioBuffer(audio_ctx.current, data.current, type)
    const audio = build_audio("recoding", buffer, "", "default", true)
    set_audios(prev => [...prev, audio])
  }

  return <div onPointerDown={toggle_record} style={{ userSelect: "none" }}>
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" stroke="currentColor" fill="none" stroke-width={14} />
      <circle cx="50" cy="50" r="15" fill="rgb(230, 1, 88)" />
    </svg>
  </div>
}