import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Logo from '../ui/Logo'
import type { CarbonRecord, EnergyRecord, Insight } from '../../data/types'
import type { ReportSlug } from '../../data/reports'
import { buildSummary, buildTable, getTemplate } from '../../data/reports'
import { getDailyEnergySeries } from '../../lib/calculations'
import { ENERGY_SOURCE_LABEL, SEVERITY_LABEL } from '../../lib/id'

interface ReportDocumentProps {
  slug: ReportSlug
  plant: string
  period: string
  energy: EnergyRecord[]
  carbon: CarbonRecord[]
  insights: Insight[]
}

const SEVERITY_COLORS: Record<string, string> = {
  High: '#DC2626',
  Medium: '#D97706',
  Low: '#0F766E',
}

const SOURCE_COLORS = ['#059669', '#14B8A6', '#0F766E', '#5EEAD4']

const ReportDocument = ({ slug, plant, period, energy, carbon, insights }: ReportDocumentProps) => {
  const template = getTemplate(slug)
  const summary = buildSummary(slug, energy, carbon, insights)
  const table = buildTable(slug, energy, carbon, insights)
  const generated = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const chart = (() => {
    if (slug === 'energy') {
      const series = getDailyEnergySeries(energy).map((d) => ({
        label: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        value: Number(d.value.toFixed(2)),
      }))
      return { kind: 'area' as const, title: 'Konsumsi energi harian (MWh)', data: series }
    }
    if (slug === 'carbon') {
      const bySource = carbon.reduce((acc, r) => {
        acc[r.source] = (acc[r.source] ?? 0) + r.emissionsTCO2e
        return acc
      }, {} as Record<string, number>)
      const data = Object.entries(bySource).map(([source, value]) => ({
        label: (ENERGY_SOURCE_LABEL as Record<string, string>)[source] ?? source,
        value: Number(value.toFixed(2)),
      }))
      return { kind: 'bar' as const, title: 'Emisi per sumber (tCO₂e)', data }
    }
    const bySeverity = (['High', 'Medium', 'Low'] as const).map((sev) => ({
      label: SEVERITY_LABEL[sev],
      value: insights.filter((i) => i.severity === sev).length,
      color: SEVERITY_COLORS[sev],
    }))
    return { kind: 'severity' as const, title: 'Wawasan berdasarkan keparahan', data: bySeverity }
  })()

  return (
    <div className="report-doc mx-auto max-w-3xl rounded-18 border border-border bg-surface p-6 shadow-sm md:p-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <Logo size="md" showTagline />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-main-text">{template?.name}</h1>
        <p className="mt-1 text-sm text-secondary-text">{template?.type} • Laporan</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-soft-mint px-3 py-1 text-xs font-medium text-primary-green">
          Laporan
        </span>
          <div className="mt-3 space-y-0.5 text-xs text-secondary-text">
            <p><span className="font-medium text-main-text">Pabrik:</span> {plant}</p>
            <p><span className="font-medium text-main-text">Periode:</span> {period}</p>
            <p><span className="font-medium text-main-text">Dibuat pada:</span> {generated}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map((m) => (
          <div key={m.label} className="rounded-12 border border-border bg-main-bg p-3">
            <p className="text-[11px] uppercase tracking-wide text-secondary-text">{m.label}</p>
            <p className="mt-1 text-lg font-bold text-main-text">{m.value}</p>
            {m.hint && <p className="mt-0.5 text-[10px] text-secondary-text">{m.hint}</p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 rounded-12 border border-border p-4">
        <p className="mb-3 text-sm font-semibold text-main-text">{chart.title}</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {chart.kind === 'area' ? (
              <AreaChart data={chart.data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--color-secondary-text)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-secondary-text)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={2} fill="url(#reportArea)" name="MWh" />
              </AreaChart>
            ) : (
              <BarChart data={chart.data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--color-secondary-text)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-secondary-text)" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chart.data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        chart.kind === 'severity'
                          ? (entry as { color: string }).color
                          : SOURCE_COLORS[i % SOURCE_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-main-text">Catatan terperinci</p>
        <div className="overflow-x-auto rounded-12 border border-border">
          <table className="w-full text-xs">
            <thead className="bg-main-bg">
              <tr>
                {table.columns.map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-medium text-secondary-text">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-main-text">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-border pt-4 text-[11px] text-secondary-text">
        <p>
          Laporan ini dibuat dari data periode yang dipilih. Angka-angka bersifat informasi dan
          bukan pengukuran yang divalidasi ataupun pengungkapan resmi.
        </p>
        <p className="mt-1">© 2025 JEJAK — Platform Intelijen Industri Bertenaga AI</p>
      </div>
    </div>
  )
}

export default ReportDocument
