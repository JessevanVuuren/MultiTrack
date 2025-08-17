# MultiTrack - A drag and drop audio plugin

MultiTrack is a [MotionCanvas](https://github.com/motion-canvas/motion-canvas) plugin that allows you to load and arrange multiple audio files across different tracks. With support for multiple tracks, sound effects, and microphone recordings, some pretty complex audio can be created.

<img width="1790" height="1176" alt="image" src="https://github.com/user-attachments/assets/a3908551-d7dc-463b-a399-b283939570e5" />

# Features

MultiTrack has a bunch of different features that make editing and recording audio an easy and painless task:

- Audio hierarchy
- Multiple audio files
- Multiple tracks
- Custom volume per track
- Microphone recordings
- One-click render
- Activate/Deactivate audio files
- Mute tracks
- Drag and drop


## Microhpone

With the [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API), you can record audio and save the file locally. To start a recording, click the red button on the right in the playback controls. After clicking the button again, your recording will appear in the audio hierarchy, where it can be saved or deleted.

<img width="1102" height="385" alt="image" src="https://github.com/user-attachments/assets/29cdbd55-e72f-4530-a63f-84cbf56d5388" />

## Drag and drop

Not much to say, just easy drag and drop.

![ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/7723043d-7e7f-4cd2-8f47-01000a7ad03f)


# Installation

Installing the MultiTrack plugin into your project is easy and requires no extra dependencies.

Start by opening an existing MotionCanvas project or create a new one:
```bash
npm init @motion-canvas@latest
```

Clone this repo in the root of the project:
```bash
git clone https://github.com/JessevanVuuren/MultiTrack.git
```

This should result in a structure like the following. Next, create an empty `audio` folder where audio files will be stored and created:
```
  project/
* ├── audio/
* ├── MultiTrack/
  ├── node_modules/
  ├── public/
  ├── src/
  ├── .gitignore
  ├── package-lock.json
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
```

Next, go to the `src/project.ts` file and import `MultiTrack()` and `MultiExport()`. Note that `experimentalFeatures` is added and set to `true`
 -  `MultiTrack()` is responsible for displaying the user interface
 -  `MultiExport()` adds an extra render output named `MultiTrack`, which can be found in the video settings tab under rendering.

```ts
import { makeProject } from '@motion-canvas/core'
import example from './scenes/example?scene'

import MultiExport from "../MultiTrack/exporter"
import MultiTrack from "../MultiTrack"

export default makeProject({
  plugins: [MultiTrack(), MultiExport()],
  experimentalFeatures: true,
  scenes: [example],
});
```

For the final step, open the config file `vite.config.ts` and add `MultiTrackPlugin()`. This plugin is responsible for fetching the audio files. Don't forget to add `**/audio/multi-track.json**` and `**/audio/**` in the `ignored` array.

```ts
import MultiTrackPlugin from './MultiTrack/vite/backend'
import motionCanvas from '@motion-canvas/vite-plugin'
import ffmpeg from '@motion-canvas/ffmpeg'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    motionCanvas(),
    ffmpeg(),
    MultiTrackPlugin()
  ],
  server: {
    watch: {
      ignored: ["**/audio/multi-track.json**", "**/audio/**"]
    }
  }
});

```

Start the server with `npm start` and if everything went well, a new tab has appeard in the left panel. You can now begin adding audio files to the audio folder.

## Rendering

To render with the audio from MultiTrack, go to the `video settings` tab and select `MultiTrack` in the dropdown in Rendering

# Contributing
Always welcome :)















