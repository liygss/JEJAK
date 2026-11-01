import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Factory,
  CalendarDays,
  Bell,
  ShieldCheck,
  Database,
  Plug,
  User,
  Check,
} from 'lucide-react'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import { useFilters } from '../lib/FiltersContext'
import { useToast } from '../components/ui/Toast'
import { Reveal, Stagger, StaggerItem } from '../components/ui/Reveal'
import { PLANT_LABEL, PERIOD_LABEL } from '../lib/id'

type Toggle = { id: string; label: string; description: string; defaultOn: boolean }

const NOTIFICATIONS: Toggle[] = [
  { id: 'email', label: 'Ringkasan email harian', description: 'Terima ringkasan konsumsi energi & emisi setiap pagi.', defaultOn: true },
  { id: 'anomaly', label: 'Peringatan anomali', description: 'Notifikasi saat konsumsi melewati baseline.', defaultOn: true },
  { id: 'report', label: 'Laporan mingguan', description: 'Kirim laporan operasional otomatis tiap minggu.', defaultOn: false },
]

const INTEGRATIONS = [
  { id: 'iot', name: 'Gateway IoT', detail: '9 perangkat terhubung', connected: true, icon: Plug },
  { id: 'scada', name: 'SCADA Plant', detail: 'Belum terhubung', connected: false, icon: Database },
  { id: 'erp', name: 'ERP Keuangan', detail: 'Belum terhubung', connected: false, icon: Database },
]

const SettingsPage = () => {
  const { openSidebar } = useSidebar()
  const { plant, period } = useFilters()
  const { toast } = useToast()
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultOn]))
  )

  const flip = (t: Toggle) => {
    const next = !toggles[t.id]
    setToggles((prev) => ({ ...prev, [t.id]: next }))
    toast({
      title: next ? 'Pengaturan diaktifkan' : 'Pengaturan dinonaktifkan',
      description: `${t.label} ${next ? 'aktif' : 'nonaktif'}.`,
      variant: 'info',
    })
  }

  return (
    <>
      <AppHeader title="Pengaturan" subtitle="Konfigurasi sistem" onMenuClick={openSidebar} />
      <main className="space-y-6 p-4 md:p-6">
        <Reveal>
          <div className="flex items-start gap-3 rounded-12 border border-warning/20 bg-amber-50 p-4 text-xs leading-relaxed text-warning">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>
              Perubahan pengaturan pada halaman ini belum tersimpan. Gunakan pemilih pabrik dan periode
              di header dasbor untuk mengubah tampilan aktif.
            </span>
          </div>
        </Reveal>

        {/* Profile + active context */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="flex h-full items-center gap-4 rounded-18 border border-border bg-surface p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-18 bg-soft-mint text-primary-green">
                <User size={26} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-main-text">Budi Santoso</p>
                <p className="truncate text-xs text-secondary-text">operations@jejak.co.id</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-main-bg px-2 py-0.5 text-[10px] font-medium text-secondary-text">
                  Peran: Operator
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="lg:col-span-2">
            <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-18 border border-border bg-surface p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-12 bg-teal-50 text-deep-teal">
                  <Factory size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary-text">Pabrik Aktif</p>
                  <p className="truncate text-sm font-semibold text-main-text">{PLANT_LABEL[plant]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-18 border border-border bg-surface p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-12 bg-teal-50 text-deep-teal">
                  <CalendarDays size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary-text">Periode Pemantauan</p>
                  <p className="truncate text-sm font-semibold text-main-text">{PERIOD_LABEL[period]}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Notifications + Integrations */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-18 border border-border bg-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-main-text">Notifikasi</h3>
                  <p className="text-xs text-secondary-text">Preferensi peringatan</p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {NOTIFICATIONS.map((n) => {
                  const on = toggles[n.id]
                  return (
                    <div key={n.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-main-text">{n.label}</p>
                        <p className="text-xs text-secondary-text">{n.description}</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={on}
                        aria-label={n.label}
                        onClick={() => flip(n)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          on ? 'bg-primary-green' : 'bg-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            on ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex h-full flex-col rounded-18 border border-border bg-surface p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-teal-50 text-deep-teal">
                  <Plug size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-main-text">Integrasi Sumber Data</h3>
                  <p className="text-xs text-secondary-text">Koneksi sistem</p>
                </div>
              </div>
              <div className="space-y-3">
                {INTEGRATIONS.map((it) => {
                  const Icon = it.icon
                  return (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3 rounded-12 border border-border bg-main-bg/50 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-10 ${
                            it.connected ? 'bg-soft-mint text-primary-green' : 'bg-main-bg text-secondary-text'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-main-text">{it.name}</p>
                          <p className="truncate text-xs text-secondary-text">{it.detail}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          it.connected ? 'bg-soft-mint text-primary-green' : 'bg-main-bg text-secondary-text'
                        }`}
                      >
                        {it.connected ? 'Terhubung' : 'Nonaktif'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Read-only config summary */}
        <Reveal>
          <div className="rounded-18 border border-border bg-surface p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-main-bg text-secondary-text">
                <SettingsIcon size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-main-text">Konfigurasi Sistem</h3>
                <p className="text-xs text-secondary-text">Ringkasan konfigurasi aktif</p>
              </div>
            </div>
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StaggerItem>
                <div className="rounded-12 border border-border bg-main-bg/50 p-4">
                  <p className="text-xs text-secondary-text">Pabrik Aktif</p>
                  <p className="mt-1 text-sm font-semibold text-main-text">{PLANT_LABEL[plant]}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-12 border border-border bg-main-bg/50 p-4">
                  <p className="text-xs text-secondary-text">Periode Pemantauan</p>
                  <p className="mt-1 text-sm font-semibold text-main-text">{PERIOD_LABEL[period]}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-12 border border-border bg-main-bg/50 p-4">
                  <p className="text-xs text-secondary-text">Sumber Data</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-main-text">
                    <Check size={14} className="text-primary-green" /> IoT
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-12 border border-border bg-main-bg/50 p-4">
                  <p className="text-xs text-secondary-text">Status Data</p>
                  <p className="mt-1 text-sm font-semibold text-main-text">Aktif</p>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </Reveal>
      </main>
    </>
  )
}

export default SettingsPage
