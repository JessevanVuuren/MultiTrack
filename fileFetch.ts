import { Plugin, PLUGIN_OPTIONS } from '@motion-canvas/vite-plugin';

const fs = require('fs');

export default function multiTrackPlugin(): Plugin {
  return {
    name: 'multi-track-audio-files',

    configureServer(server) {
      server.middlewares.use('/audios', (req, res) => {
        fs.readdir("./audio", { withFileTypes: true }, (err, files) => {
          if (err) {
            console.log(err)
            res.end(JSON.stringify({ error: "error" }))
          }
          else {
            const list = files.map(f => f.name)
            res.end(JSON.stringify(list));
          }
        })
      });
    },

    [PLUGIN_OPTIONS]: {
      entryPoint: '',
    },
  };
}