/* @jsxImportSource preact */

import { useEffect, useRef, useState } from "preact/hooks"
import { useApplication } from "@motion-canvas/ui"
import { RecordProps } from "../core/types"
import { blob_to_AudioBuffer, build_audio } from "../core/wave"


export const RecordComp: React.FC<RecordProps> = ({ set_audios }) => {
  const [recoding, set_recording] = useState(false)
  const recorder = useRef<MediaRecorder>(null)
  const stream = useRef<MediaStream>(null)
  const [data, set_data] = useState<BlobPart[]>([])

  const app = useApplication()

  const activate_recorder = async (): Promise<boolean> => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported.");

      try {
        const result = await navigator.mediaDevices.getUserMedia({ audio: true })

        console.log("Recorder steam set")

        stream.current = result
        recorder.current = new MediaRecorder(result)

        return true
      } catch (err) { error_occurred(err) }
    } else not_supported()
  }

  const toggle_record = async () => {
    console.log(recoding)
    if (!recoding) {
      const rec = await activate_recorder()
      if (rec) start_rec()

    }
    else stop_recording()

  }

  const not_supported = () => {
    console.log("getUserMedia not supported on your browser!");
  }

  const error_occurred = (err: string) => {
    console.error(`The following getUserMedia error occurred: ${err}`);
  }

  const stop_recording = async () => {
    console.log("stop")
    set_recording(false)
    app.player.togglePlayback()

    recorder.current.stop()
    stream.current.getTracks().forEach(e => e.stop())

    const buffer = await blob_to_AudioBuffer(data, recorder.current.mimeType)
    const audio = build_audio("recoding", buffer, "", "default")
    set_audios(prev => [...prev, audio])



    set_data([])
  }

  const start_rec = () => {
    console.log("start")
    set_recording(true)
    app.player.togglePlayback()

    recorder.current.start()

    recorder.current.ondataavailable = (e) => {
      set_data(prev => [...prev, e.data])
    }
  }

  return <div onPointerDown={toggle_record} style={{ userSelect: "none" }}>
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" stroke="currentColor" fill="none" stroke-width={14} />
      <circle cx="50" cy="50" r="15" fill="rgb(230, 1, 88)" />
    </svg>
  </div>
}