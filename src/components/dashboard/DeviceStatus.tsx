import { CheckCircle, AlertCircle, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { devices } from '../../data/insights'
import { DEVICE_STATUS_LABEL, locationLabel } from '../../lib/id'

const statusConfig = {
  Online: { icon: CheckCircle, color: 'text-primary-green', bg: 'bg-soft-mint' },
  Warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-amber-50' },
  Offline: { icon: WifiOff, color: 'text-danger', bg: 'bg-red-50' },
}

const DeviceStatus = () => {
  return (
    <div className="bg-surface rounded-18 border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-main-text">Perangkat Terhubung</h3>
        <span className="text-xs text-secondary-text">Data Perangkat</span>
      </div>
      <div className="space-y-3">
        {devices.map((device, i) => {
          const config = statusConfig[device.status]
          const Icon = config.icon
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between p-3 rounded-12 bg-main-bg/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-10 ${config.bg}`}>
                  <Icon size={16} className={config.color} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-main-text">{device.name}</h4>
                  <p className="text-xs text-secondary-text">{locationLabel(device.location)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${config.color}`}>{DEVICE_STATUS_LABEL[device.status]}</p>
                <p className="text-xs text-secondary-text mt-0.5">Diperbarui: {device.lastUpdate}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default DeviceStatus
