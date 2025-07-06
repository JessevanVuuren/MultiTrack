import { StyleSheet } from './types';

export const styles: StyleSheet = {
  audio_timeline_style: {
    marginTop: 7,
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
  audio_file_text: {
    margin: 0,
    fontSize: 20
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
  audio_track_label: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.27)",
    padding: 5,
    borderBottomRightRadius: 5
  },
  audio_track: {
    background: "rgba(255,255,255,.1)",
    borderRadius: 7,
    borderTopLeftRadius: 0,
    height: 80,
    position: "absolute"
  },
  track_control: {
    position: "absolute",
    right: -40,
    borderRadius: 4,
    zIndex: 10,
    background: "rgba(255,255,255,.1)",
    display: "flex",
    flexDirection: "column"
  },
  track_delete: {
    padding: 4,
    display: "flex"
  },
  canvas_overlay: {
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  canvas_container: {
    zIndex: 0,
    position: "fixed",
    left: "0%",
    width: "100%",
    height: 80
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
  slider_knob: {
    height: 20,
    width: 5,
    backgroundColor: "gray" ,
    position: "absolute"
  },
  slider_rail: {
    height: 5,
    backgroundColor: "white",
    width: 122
  }
}