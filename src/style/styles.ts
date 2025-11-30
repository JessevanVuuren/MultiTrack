import { StyleSheet } from '../core/types';

export const styles: StyleSheet = {
  audio_timeline_style: {
    marginTop: 40,
  },
  add_audio_style: {
    display: "flex",
    width: "100%",
  },
  separator_style: {
    width: "100%",
    height: 2,
    background: "rgba(0, 0, 0, 0.1)",
  },
  audio_file: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 5,
    position: "relative",
    width: "100%",
    marginBottom: 10,
    overflow: "hidden",
  },
  svg_polyline_file: {
    height: "200%",
    width: "100%",
    top: "1%",
    position: "absolute",
  },
  audio_file_padding: {
    position: "relative",
    zIndex: 1,
    padding: 10
  },
  audio_file_container: {
    display: "flex",
    justifyContent: "space-between",
  },

  audio_duration: {
    margin: 0,
    color: "var(--theme)",
    fontSize: 15,
    marginTop: 5
  },
  track_line: {
    background: "rgba(255, 255, 255, 0.1)",
    width: "100%",
    height: 80,
    borderRadius: 7
  },
  svg_polyline: {
    height: "100%", width: "100%"
  },

  track_control: {
    position: "absolute",
    right: -40,
    borderRadius: 4,
    zIndex: 10,
    marginTop: 9,
    background: "rgba(255,255,255,.1)",
    display: "flex",
    flexDirection: "column"
  },
  track_delete: {
    padding: 4,
    display: "flex"
  },
  sure_remove_track: {
    padding: 10,
    height: 80,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "rgba(36, 36, 36, 1)",
    borderRadius: 5
  },
  slider_rect: {
    height: 33,
    width: 150,
    background: "rgba(255,255,255,.1)",
    position: "absolute",
    top: -1,
    left: 36,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  background_volume: {
    height: 33,
    width: 180,
    position: "absolute",
    top: -1,
  },
  slider_knob: {
    height: 20,
    width: 5,
    backgroundColor: "gray",
    position: "absolute"
  },
  slider_rail: {
    height: 5,
    backgroundColor: "white",
    width: 122
  },
  volume_number: {
    position: "absolute",
    top: 0,
    backgroundColor: "rgba(255,255,255,.1)",
    height: 33,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    borderRadius: 4,
  },
  recording_input: {
    backgroundColor: "var(--input-background)",
    border: "none",
    outline: "none",
    paddingLeft: 10,
    color: "white"
  }
}