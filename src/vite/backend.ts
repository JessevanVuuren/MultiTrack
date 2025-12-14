import { Plugin, PLUGIN_OPTIONS } from '@motion-canvas/vite-plugin';
import fs from 'node:fs/promises';
import path from 'node:path';

// TODO: make this clean, a.k.a clean this up
export default function MultiTrackPlugin(): Plugin {
  return {
    name: 'multi-track-audio-files',
    configureServer(server) {
      const audio_dir = path.resolve(server.config.root, 'audio');
      const audio_file = path.join(audio_dir, 'multi-track-audio.wav');

      // List audio files
      server.middlewares.use('/audios', async (_, res) => {
        try {
          const files = await fs.readdir(audio_dir, { withFileTypes: true });
          const list = files.map(f => f.name);
          res.end(JSON.stringify(list));
        } catch (error) {
          res.end(JSON.stringify({ error: String(error) }));
        }
      });

      // Delete temp audio file
      server.middlewares.use('/remove', async (req, res) => {
        try {
          const url = new URL(req.url, "http://localhost/remove");
          const file_name = url.searchParams.get("name")

          if (!file_name) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Missing file name" }));
          }

          const safe_name = path.basename(file_name);
          const file_path = path.join(audio_dir, safe_name);

          await fs.stat(file_path);
          await fs.unlink(file_path);

          res.statusCode = 200;
          return res.end(JSON.stringify({ success: "file deleted successfully" }));
        } catch (error) {
          res.statusCode = error.code === "ENOENT" ? 404 : 500;
          return res.end(JSON.stringify({ error: "Error while trying to delete a file " }));
        }
      });
    },
    [PLUGIN_OPTIONS]: {
      entryPoint: 'motion-canvas-multitrack/exporter',
    },
  };
}

