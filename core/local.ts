import { Audio, Track, Export, SaveState } from "./types";
import { audioBufferToWav } from "./wav"

export const save_state = (audios: Audio[], tracks: Track[]) => {
  const filename = "multi-track"

  const active_audio = audios.filter((audio) => { return audio.active })
  audios.forEach(a => a.buffer_line = "")

  const config: SaveState = {
    audios: active_audio,
    tracks: tracks
  }

  const config_string = JSON.stringify(config)
  const config_base64 = btoa(config_string)

  const exportData: Export = {
    frame: 0,
    data: config_base64,
    name: filename,
    subDirectories: ['../audio'],
    mimeType: 'application/json',
  };

  send_to_disk(exportData)
}

const buffer_to_str = (wavData: ArrayBuffer) => {
  let str = ""
  const bytes = new Uint8Array(wavData);
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str
}

export const save_audio_buffer = async (buffer: AudioBuffer, name: string) => {

  const channelBuffers = [];
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    channelBuffers.push(buffer.getChannelData(channel));
  }

  const wav_data = audioBufferToWav(buffer.sampleRate, channelBuffers);
  const string_buffer = buffer_to_str(wav_data)
  const base64 = btoa(string_buffer)

  const exportData: Export = {
    frame: 0,
    data: base64,
    name: name,
    subDirectories: ['../audio'],
    mimeType: 'audio/wav',
  };

  send_to_disk(exportData)

}

const send_to_disk = (data: Export) => {

  if (import.meta.hot) {
    import.meta.hot.send('motion-canvas:export', data);
  }
}

export const load_saved_state = async (path: string): Promise<SaveState> => {

  try {
    const raw_data = await fetch(path)
    if (!raw_data) return

    const json = await raw_data.json()
    return json as SaveState
  } catch (e) {
    console.log("ERROR: multi-track.json")
  }

  return
}