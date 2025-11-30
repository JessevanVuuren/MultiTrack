export const check_version = (current_version: string, lib_version: string) => {
  if (!current_version || current_version !== lib_version) {
    console.error(
      `!!VERSION MISMATCH!!\n` +
      `Your configuration file was created for version "${current_version ?? "unknown"}",\n` +
      `but the installed MultiTrack version is "${lib_version}".\n\n` +
      `Don't use this version with your local multi-track.json file.\n` +
      `Using this version could break your project.\n`
    );

    throw new Error("Incompatible configuration version — aborting.");
  }
}