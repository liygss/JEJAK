import { Document, Page, Text, View, StyleSheet, Svg, Rect, Line } from '@react-pdf/renderer'
import type { CarbonRecord, EnergyRecord, Insight } from '../../data/types'
import type { ReportSlug } from '../../data/reports'
import { buildSummary, buildTable, getTemplate } from '../../data/reports'
import { getDailyEnergySeries, getDailyCarbonSeries } from '../../lib/calculations'
import { SEVERITY_LABEL } from '../../lib/id'

const GREEN = '#059669'
const TEAL = '#0F766E'
const ACCENT = '#14B8A6'
const TEXT = '#0F172A'
const MUTED = '#64748B'
const BORDER = '#E2E8F0'
const SOFT = '#F8FAFC'
const MINT = '#D1FAE5'

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 54,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: TEXT,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  brandGreen: { color: GREEN },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginTop: 10 },
  subtitle: { fontSize: 9, color: MUTED, marginTop: 3 },
  badge: {
    backgroundColor: MINT,
    color: GREEN,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  metaRow: { marginTop: 10, alignItems: 'flex-end' },
  metaText: { fontSize: 8, color: MUTED, marginTop: 2 },
  metaStrong: { color: TEXT, fontFamily: 'Helvetica-Bold' },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  summaryGrid: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: SOFT,
    padding: 8,
  },
  summaryLabel: { fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.4 },
  summaryValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  summaryHint: { fontSize: 7, color: MUTED, marginTop: 3 },
  chartWrap: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 10, marginTop: 4 },
  table: { marginTop: 4, borderWidth: 1, borderColor: BORDER, borderRadius: 6 },
  thRow: { flexDirection: 'row', backgroundColor: SOFT, borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: MUTED, padding: 5, flex: 1 },
  tdRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: BORDER },
  td: { fontSize: 7.5, color: TEXT, padding: 5, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: MUTED, lineHeight: 1.4 },
})

type ChartData = { label: string; value: number }

function buildChart(slug: ReportSlug, energy: EnergyRecord[], carbon: CarbonRecord[], insights: Insight[]): { title: string; data: ChartData[] } {
  if (slug === 'energy') {
    const series = getDailyEnergySeries(energy).map((d) => ({
      label: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      value: Number(d.value.toFixed(2)),
    }))
    return { title: 'Konsumsi energi harian (MWh)', data: series }
  }
  if (slug === 'carbon') {
    const series = getDailyCarbonSeries(carbon).map((d) => ({
      label: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      value: Number(d.value.toFixed(2)),
    }))
    return { title: 'Emisi per hari (tCO2e)', data: series }
  }
  const bySeverity = (['High', 'Medium', 'Low'] as const).map((sev) => ({
    label: SEVERITY_LABEL[sev],
    value: insights.filter((i) => i.severity === sev).length,
  }))
  return { title: 'Wawasan berdasarkan keparahan', data: bySeverity }
}

function BarChart({ data }: { data: ChartData[] }) {
  const width = 515
  const height = 130
  const padLeft = 34
  const padBottom = 20
  const padTop = 10
  const plotW = width - padLeft - 10
  const plotH = height - padBottom - padTop
  const max = Math.max(1, ...data.map((d) => d.value))
  const n = data.length || 1
  const slot = plotW / n
  const barW = Math.min(48, slot * 0.55)
  const colors = [GREEN, ACCENT, TEAL, '#5EEAD4']

  return (
    <Svg width={width} height={height}>
      <Line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke={BORDER} strokeWidth={1} />
      <Line x1={padLeft} y1={padTop + plotH} x2={width - 10} y2={padTop + plotH} stroke={BORDER} strokeWidth={1} />
      {data.map((d, i) => {
        const h = (d.value / max) * plotH
        const x = padLeft + slot * i + (slot - barW) / 2
        const y = padTop + plotH - h
        return (
          <View key={i}>
            <Rect x={x} y={y} width={barW} height={h} rx={3} fill={colors[i % colors.length]} />
          </View>
        )
      })}
    </Svg>
  )
}

interface ReportPdfDocumentProps {
  slug: ReportSlug
  plant: string
  period: string
  energy: EnergyRecord[]
  carbon: CarbonRecord[]
  insights: Insight[]
}

const ReportPdfDocument = ({ slug, plant, period, energy, carbon, insights }: ReportPdfDocumentProps) => {
  const template = getTemplate(slug)
  const summary = buildSummary(slug, energy, carbon, insights)
  const table = buildTable(slug, energy, carbon, insights)
  const chart = buildChart(slug, energy, carbon, insights)
  const generated = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Document title={template?.name ?? 'Laporan JEJAK'} author="JEJAK" subject="Laporan">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>
              JE<Text style={styles.brandGreen}>JAK</Text>
            </Text>
            <Text style={styles.title}>{template?.name}</Text>
            <Text style={styles.subtitle}>{template?.type} — Laporan</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.badge}>DATA</Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaStrong}>Pabrik: </Text>
              {plant}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaStrong}>Periode: </Text>
              {period}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaStrong}>Dibuat pada: </Text>
              {generated}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Ringkasan</Text>
        <View style={styles.summaryGrid}>
          {summary.map((m) => (
            <View key={m.label} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{m.label}</Text>
              <Text style={styles.summaryValue}>{m.value}</Text>
              {m.hint ? <Text style={styles.summaryHint}>{m.hint}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.chartWrap}>
          <Text style={{ ...styles.sectionTitle, fontSize: 10 }}>{chart.title}</Text>
          <BarChart data={chart.data} />
        </View>

        <View wrap={false}>
          <Text style={{ ...styles.sectionTitle, marginTop: 14 }}>Catatan terperinci</Text>
          <View style={styles.table}>
            <View style={styles.thRow} fixed>
              {table.columns.map((c, i) => (
                <Text key={c} style={{ ...styles.th, flex: i === 0 ? 1.4 : 1 }}>
                  {c}
                </Text>
              ))}
            </View>
            {table.rows.map((row, ri) => (
              <View key={ri} style={styles.tdRow} wrap={false}>
                {row.map((cell, ci) => (
                  <Text key={ci} style={{ ...styles.td, flex: ci === 0 ? 1.4 : 1 }}>
                    {String(cell)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Laporan ini dibuat dari data periode yang dipilih. Angka-angka bersifat informasi dan bukan pengukuran
            yang divalidasi ataupun pengungkapan resmi.
          </Text>
          <Text style={{ ...styles.footerText, marginTop: 2 }}>
            (c) 2026 JEJAK — Platform Intelijen Industri Bertenaga AI
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default ReportPdfDocument
