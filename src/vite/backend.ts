import { Plugin, PLUGIN_OPTIONS } from '@motion-canvas/vite-plugin';
import fs from 'node:fs/promises';
import path from 'node:path';

export default function MultiTrackPlugin(): Plugin {
  return {
    name: 'multi-track-audio-files',
    configureServer(server) {
      const audioDir = path.resolve(server.config.root, 'audio');
      const audioFile = path.join(audioDir, 'multi-track-audio.wav');

      // List audio files
      server.middlewares.use('/audios', async (_, res) => {
        try {
          const files = await fs.readdir(audioDir, { withFileTypes: true });
          const list = files.map(f => f.name);
          res.end(JSON.stringify(list));
        } catch (error) {
          res.end(JSON.stringify({ error: String(error) }));
        }
      });

      // Delete temp audio file
      server.middlewares.use('/cleanup', async (_, res) => {
        try {
          await fs.stat(audioFile); // check existence
          await fs.unlink(audioFile);
          res.end(JSON.stringify({ success: "file deleted successfully" }));
        } catch (error) {
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
    [PLUGIN_OPTIONS]: {
      entryPoint: 'motion-canvas-multitrack/exporter',
    },
  };
}

