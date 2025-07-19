import { Audio, Track, Export, SaveState } from "./types";

export const save_state = (audios: Audio[], tracks: Track[]) => {
  const filename = "multi-track"

  const active_audio = audios.filter((audio) => { return audio.active })
  audios.forEach(a => a.buffer_line = "")

  const object: SaveState = {
    audios: active_audio,
    tracks: tracks
  }

  const exportData: Export = {
    frame: 0,
    data: object,
    name: filename,
    subDirectories: ['../audio'],
    mimeType: 'application/json',
  };

  send_to_disk(exportData)
}

export const save_audio = async (audio: Audio) => {
  const exportData: Export = {
    frame: 0,
    data: audio.buffer,
    name: audio.name + "wow",
    subDirectories: ['../audio'],
    mimeType: 'audio/wav',
  };

  send_to_disk(exportData)
}

const send_to_disk = (data: Export) => {
  const data_string = JSON.stringify(data.data)
  const data_base64 = btoa(data_string)
  data.data = data_base64

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