import { Activity, AlertTriangle, FileText, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const activities = [
  { icon: Activity, color: 'text-teal-accent bg-teal-50', title: 'Data energi diperbarui', detail: 'Lini Produksi', time: '14:30', status: 'Berhasil' },
  { icon: AlertTriangle, color: 'text-warning bg-amber-50', title: 'Anomali baru terdeteksi', detail: 'Konsumsi HVAC melebihi baseline', time: '13:12', status: 'Peringatan' },
  { icon: FileText, color: 'text-deep-teal bg-teal-50', title: 'Laporan karbon disiapkan', detail: 'Laporan karbon dibuat', time: '11:48', status: 'Siap' },
  { icon: CheckCircle, color: 'text-primary-green bg-soft-mint', title: 'Wawasan AI ditinjau', detail: 'Peluang Operasional ditandai ditinjau', time: '09:05', status: 'Selesai' },
]

const RecentActivity = () => {
  return (
    <div className="bg-surface rounded-18 border border-border p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-main-text">Aktivitas Terbaru</h3>
        <span className="text-xs text-secondary-text">Log sistem</span>
      </div>
      <div className="space-y-4">
        {activities.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-10 ${a.color}`}>
              <a.icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-main-text">{a.title}</p>
              <p className="text-xs text-secondary-text">{a.detail}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-secondary-text">{a.time}</p>
              <p className="text-xs text-secondary-text/70">{a.status}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivity
