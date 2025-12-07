import { StyleSheet } from '../core/types';

export const styles: StyleSheet = {
  audio_file: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 5,
    position: "relative",
    width: "100%",
    marginBottom: 10,
    overflow: "hidden",
  },
  audio_file_text: {
    margin: 0,
    fontSize: 20
  },
  svg_polyline_file: {
    height: "200%",
    width: "100%",
    top: "1%",
    position: "absolute",
  },
  audio_file_padding: {
    display: "flex",
    position: "relative",
    justifyContent: "space-between",
    padding: 10
  },
  audio_file_container: {
    display: "flex",
    flexDirection:"column",
    justifyContent: "space-between"
  },
  audio_duration: {
    margin: 0,
    color: "var(--theme)",
    fontSize: 15,
    marginTop: 5
  },
}