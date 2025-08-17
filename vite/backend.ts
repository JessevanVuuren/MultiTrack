import { Plugin, PLUGIN_OPTIONS } from '@motion-canvas/vite-plugin';

const fs = require('fs');

export default function MultiTrackPlugin(): Plugin {
  return {
    name: 'multi-track-audio-files',

    configureServer(server) {
      server.middlewares.use('/audios', (req, res) => {
        fs.readdir("./audio", { withFileTypes: true }, (err, files) => {
          if (err) {
            res.end(JSON.stringify({ error: "error" }))
            return
          }
          else {
            const list = files.map(f => f.name)
            res.end(JSON.stringify(list));
          }
        })
      });

      server.middlewares.use('/cleanup', (req, res) => {
        fs.stat('./audio/multi-track-audio.wav', function (err, stats) {

          if (err) {
            res.end(JSON.stringify({ error: "error" }))
            return
          }

          fs.unlink('./audio/multi-track-audio.wav', function (err) {
            if (err) {
              res.end(JSON.stringify({ error: "error" }))
              return
            }
            
            res.end(JSON.stringify({ success: "file deleted successfully" }))

          });
        });
      });
    },

    [PLUGIN_OPTIONS]: {
      entryPoint: '',
    },
  };
}