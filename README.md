# MultiTrack - A drag and drop audio plugin - 0.1.0

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
- Cut and save parts of a track


## Microphone

With the [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API), you can record audio and save the file locally. To start a recording, click the red button on the right in the playback controls. After clicking the button again, your recording will appear in the audio hierarchy, where it can be saved or deleted.

<img width="1102" height="385" alt="image" src="https://github.com/user-attachments/assets/29cdbd55-e72f-4530-a63f-84cbf56d5388" />

## Drag and drop

Not much to say, just easy drag and drop.

![drag-and-drop](https://github.com/user-attachments/assets/7723043d-7e7f-4cd2-8f47-01000a7ad03f)


## Cut and save parts of a track

![cut-track](https://github.com/user-attachments/assets/379c4b88-65b4-4a93-841a-2f14c645284e)

# Installation

Installing the MultiTrack plugin into your project is easy and requires only a few changes.

Start by opening an existing [MotionCanvas](https://motioncanvas.io/docs/quickstart) project or create a new one:
```bash
npm init @motion-canvas@latest
```

Next install the npm package [motion-canvas-multitrack](https://www.npmjs.com/package/motion-canvas-multitrack)
```bash
npm i motion-canvas-multitrack
```

After successfully installing the plugin, create an empty `audio` folder where audio files will be stored and created:
```
  project/
* ├── audio/
  ├── node_modules/
  ├── public/
  ├── src/
  ├── .gitignore
  ├── package-lock.json
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
```

Next, go to the `src/project.ts` file and import `MultiTrack()` from `motion-canvas-multitrack/editor-plugin`. Note that `experimentalFeatures` is added and set to `true`

```ts
import { makeProject } from '@motion-canvas/core'
import example from './scenes/example?scene'

import MultiTrack from 'motion-canvas-multitrack/editor-plugin';

export default makeProject({
  plugins: [MultiTrack()],
  experimentalFeatures: true,
  scenes: [example],
});
```

For the final step, open the config file `vite.config.ts` and add `MultiTrackPlugin()`. This plugin is responsible for fetching the audio files. Don't forget to add `**/audio/multi-track.json**` and `**/audio/**` in the `ignored` array.

```ts
import MultiTrackPlugin from './MultiTrack/vite/backend'
import ffmpeg from '@motion-canvas/ffmpeg'
import { defineConfig } from 'vite'

import MultiTrackPlugin from 'motion-canvas-multitrack';

export default defineConfig({
  plugins: [
    MultiTrackPlugin(),
    motionCanvas(),
    ffmpeg(),
  ],
  server: {
    watch: {
      ignored: ["**/audio/multi-track.json**", "**/audio/**"]
    }
  }
});

```

Start the server with `npm start` and if everything went well, a new tab has appeared in the left panel. You can now begin adding audio files to the audio folder.

## Rendering

To render with the audio from MultiTrack, go to the `video settings` tab and select `MultiTrack` in the dropdown in Rendering

# Contributing
Always welcome :)


# Contributors

[<img src="https://github.com/sglkc.png" width="60px;"/>](https://github.com/sglkc/MultiTrack) | 
:-:|
[sglk](https://github.com/sglkc/MultiTrack)|












