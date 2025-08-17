import type { ExporterClass } from '@motion-canvas/core/lib/app'
import { makePlugin } from '@motion-canvas/core/lib/plugin'
import { MultiExport } from './export'

export default makePlugin({
  name: 'MultiExport-plugin',
  exporters(): ExporterClass[] {
    return [MultiExport]
  },
});