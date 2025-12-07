import { Audio } from "../core/types";

export const check_version = (current_version: string, lib_version: string) => {
  if (!current_version || current_version !== lib_version) {
    console.error(
      `!!VERSION MISMATCH!!\n` +
      `Your configuration file was created for version "${current_version ?? "unknown"}",\n` +
      `but the installed MultiTrack version is "${lib_version}".\n\n` +
      `Don't use this version with your local multi-track.json file.\n` +
      `Using this version could break your project.\n` +
      `Migration script are on the TODO list\n`
    );

    throw new Error("MultiTrack version mismatch");
  }
}


export const get_audio_name = (audios: Audio[]): string => {
  const name = prompt("Name of audio file:")

  if (!name) {
    alert("Filename cannot be empty")
    return
  }

  if (audios.some(e => e.name == name)) {
    alert("Filename already exists")
    return
  }

  return name;
}