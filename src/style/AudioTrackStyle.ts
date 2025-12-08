import { StyleSheet } from '../core/types';

export const styles: StyleSheet = {
  audio_track_label: {
    zIndex: 10,
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.27)",
    padding: 5,
    borderBottomRightRadius: 5
  },
  audio_track_options: {
    right: 0,
    zIndex: 10,
    position: "absolute",
    borderBottomLeftRadius: 5,
    backgroundColor: "rgba(0, 0, 0, 0.27)",
  },
  audio_file_text: {
    margin: 0,
    fontSize: 20
  },
  cutting_mode: {
    outlineWidth: "2px",
    outline: "solid var(--theme)",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow: "rgba(51, 166, 255, .2) 0px 0px 33px 1px inset"
  },
  danger_audio: {
    outlineWidth: "2px",
    outline: "solid #FF0000",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow: "rgba(255, 0, 0, .2) 0px 0px 33px 1px inset"
  },
  unsaved_audio: {
    outlineWidth: "2px",
    outline: "solid #FF5F15",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow: "rgba(255, 95, 21, .2) 0px 0px 33px 1px inset"
  },
  audio_options_text: {
    margin: 0,
    padding: 2
  },
  audio_track: {
    background: "rgba(255,255,255,.1)",
    borderRadius: 7,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: 80,
    position: "absolute",
    display: "flex",

  },
  canvas_container: {
    zIndex: 0,
    position: "fixed",
    left: "0%",
    width: "100%",
    height: 80
  },
  canvas_overlay: {
    width: "100%",
    height: "100%",
    position: "absolute"
  },

}