import type { ExporterClass } from '@motion-canvas/core/lib/app'
import { makePlugin } from '@motion-canvas/core/lib/plugin'
import { MultiExport } from './export'

const MultiExporter = makePlugin({
  name: 'MultiExport-plugin',
  exporters(): ExporterClass[] {
    return [MultiExport]
  },
});

export default MultiExporter;
