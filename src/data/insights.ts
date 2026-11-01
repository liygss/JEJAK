import type { Insight, Device } from './types'

export const insights: Insight[] = [
  {
    id: 'ins-1',
    title: 'Potensi Pemborosan Energi',
    description: 'Konsumsi di Lini Produksi berada di atas baseline terkonfigurasi pada periode puncak.',
    severity: 'High',
    area: 'Production Line',
    estimatedSavingsIDR: 9200000,
    status: 'New',
  },
  {
    id: 'ins-2',
    title: 'Peluang Operasional',
    description: 'Tinjau jadwal peralatan pada periode produksi rendah untuk mengurangi konsumsi idle.',
    severity: 'Medium',
    area: 'Production Line',
    estimatedSavingsIDR: 6400000,
    status: 'New',
  },
  {
    id: 'ins-3',
    title: 'Peringatan Karbon',
    description: 'Intensitas emisi meningkat dibanding periode pemantauan sebelumnya.',
    severity: 'Medium',
    area: 'HVAC',
    estimatedSavingsIDR: 3000000,
    status: 'New',
  },
  {
    id: 'ins-4',
    title: 'Optimalisasi Pencahayaan',
    description: 'Pertimbangkan mengoptimalkan jadwal pencahayaan pada periode hunian rendah.',
    severity: 'Low',
    area: 'Lighting',
    estimatedSavingsIDR: 1200000,
    status: 'New',
  },
]

export const devices: Device[] = [
  { id: 'dev-1', name: 'Meteran Energi Utama', location: 'Main Substation', status: 'Online', lastUpdate: '2025-10-09 14:30' },
  { id: 'dev-2', name: 'Sensor Lini Produksi', location: 'Production Line', status: 'Online', lastUpdate: '2025-10-09 14:29' },
  { id: 'dev-3', name: 'Meteran HVAC', location: 'HVAC Room', status: 'Warning', lastUpdate: '2025-10-09 14:25' },
  { id: 'dev-4', name: 'Meteran Utilitas', location: 'Utility Area', status: 'Online', lastUpdate: '2025-10-09 14:28' },
]
