import { Document, Image, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import logoUrl from '/logo-jejak.jpeg?inline'
import type { CbamExportData } from '../../lib/cbamData'
import { EUR_TO_IDR } from '../../data/cbam'
import { formatCurrencyIDR } from '../../lib/formatters'

const NAVY = '#0B1B2B'
const INK = '#12233A'
const GREEN = '#0E9F6E'
const TEAL = '#14B8A6'
const MINT = '#D1FAE5'
const SOFT = '#F6F9FC'
const LINE = '#DDE6EF'
const MUTED = '#66788C'
const AMBER = '#B45309'

const number = (value: number, digits = 0) =>
  value.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits })

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: INK,
    backgroundColor: '#FFFFFF',
  },
  coverHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 272,
    backgroundColor: NAVY,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#10483F',
    opacity: 0.85,
  },
  heroRing: {
    position: 'absolute',
    top: 34,
    right: 34,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#2DD4BF',
    opacity: 0.35,
  },
  heroRingInner: {
    position: 'absolute',
    top: 66,
    right: 66,
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    opacity: 0.28,
  },
  heroContent: { position: 'relative', paddingTop: 34, paddingHorizontal: 40 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandTile: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  brandLogo: { width: 20, height: 21 },
  brandName: { color: '#FFFFFF', fontFamily: 'Helvetica-Bold', fontSize: 14, letterSpacing: 1.4 },
  heroBadge: {
    borderWidth: 1,
    borderColor: '#3F7A73',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: '#A7F3D0',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
  },
  coverEyebrow: { color: '#7DD3C0', fontSize: 7.5, fontFamily: 'Helvetica-Bold', letterSpacing: 1.1, marginTop: 26 },
  coverTitle: { color: '#FFFFFF', fontFamily: 'Helvetica-Bold', fontSize: 27, lineHeight: 1.08, marginTop: 7 },
  coverSubtitle: { color: '#C7D7E4', fontSize: 8.5, lineHeight: 1.45, marginTop: 9, maxWidth: 395 },
  heroMetaRow: { flexDirection: 'row', marginTop: 19, borderTopWidth: 1, borderTopColor: '#27445B', paddingTop: 11 },
  heroMetaItem: { flex: 1 },
  heroMetaLabel: { color: '#8FB0C4', fontSize: 6.5, letterSpacing: 0.7 },
  heroMetaValue: { color: '#FFFFFF', fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 3 },
  coverSpacer: { height: 214 },
  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotlightAccent: { position: 'absolute', top: 0, left: 16, right: 16, height: 3, backgroundColor: GREEN, borderRadius: 1.5 },
  spotlightLabel: { color: MUTED, fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  spotlightValue: { color: INK, fontSize: 21, fontFamily: 'Helvetica-Bold', marginTop: 5 },
  spotlightSub: { color: MUTED, fontSize: 8, marginTop: 5 },
  spotlightDivider: { width: 1, height: 62, backgroundColor: LINE, marginHorizontal: 14 },
  spotlightStat: { flex: 1 },
  spotlightStatLabel: { color: MUTED, fontSize: 7 },
  spotlightStatValue: { color: INK, fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  metricRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metricCard: { flex: 1, backgroundColor: SOFT, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 10 },
  metricLabel: { color: MUTED, fontSize: 6.5, letterSpacing: 0.6, fontFamily: 'Helvetica-Bold' },
  metricValue: { color: INK, fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 5 },
  metricHint: { color: MUTED, fontSize: 7, marginTop: 3 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8, marginTop: 14 },
  sectionNumber: {
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: { color: GREEN, fontSize: 7, fontFamily: 'Helvetica-Bold' },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: INK },
  sectionAside: { marginLeft: 'auto', color: MUTED, fontSize: 7 },
  bulletRow: { flexDirection: 'row', gap: 8, paddingVertical: 5, borderBottomWidth: 0.6, borderBottomColor: LINE },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: TEAL, marginTop: 3 },
  bulletText: { flex: 1, color: INK, fontSize: 8.5, lineHeight: 1.35 },
  insightCard: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 8, padding: 11, marginTop: 10 },
  insightLabel: { color: GREEN, fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 0.8 },
  insightText: { color: '#294D5B', fontSize: 8, lineHeight: 1.4, marginTop: 4 },
  coverNote: { backgroundColor: '#F0FDF8', borderLeftWidth: 3, borderLeftColor: GREEN, borderRadius: 5, padding: 10, marginTop: 10 },
  coverNoteText: { color: '#365468', fontSize: 7.5, lineHeight: 1.4 },
  innerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  innerBrandText: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: INK, letterSpacing: 1.2 },
  innerDocCode: { color: MUTED, fontSize: 7, textAlign: 'right', lineHeight: 1.4 },
  innerDivider: { height: 2, backgroundColor: GREEN, width: 34, marginTop: 10, marginBottom: 9 },
  innerTitle: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: INK },
  innerSubtitle: { color: MUTED, fontSize: 8.5, marginTop: 4 },
  innerBadge: {
    backgroundColor: MINT,
    color: GREEN,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    letterSpacing: 0.4,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 12 },
  cardSoft: { backgroundColor: SOFT, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 12 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: 0.6, borderBottomColor: LINE },
  kvLabel: { color: MUTED, fontSize: 8, flex: 1 },
  kvValue: { color: INK, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right', maxWidth: 275 },
  kvMuted: { color: MUTED, fontFamily: 'Helvetica' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { borderRadius: 9, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1 },
  pillGreen: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  pillAmber: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  pillGray: { backgroundColor: '#F8FAFC', borderColor: LINE },
  pillText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GREEN },
  pillTextAmber: { color: AMBER },
  pillTextGray: { color: MUTED },
  table: { borderWidth: 1, borderColor: LINE, borderRadius: 8, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: NAVY, paddingVertical: 8, paddingHorizontal: 10 },
  th: { color: '#E2E8F0', fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderTopWidth: 0.6, borderTopColor: LINE },
  tableRowAlt: { backgroundColor: SOFT },
  td: { color: INK, fontSize: 8, paddingRight: 6 },
  tdStrong: { fontFamily: 'Helvetica-Bold' },
  tdRight: { textAlign: 'right' },
  kpiStrip: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 10, backgroundColor: SOFT },
  kpiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  kpiLabel: { color: MUTED, fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 0.4 },
  kpiValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: INK, marginTop: 6 },
  kpiUnit: { color: MUTED, fontSize: 7, marginTop: 3 },
  barRow: { marginBottom: 9 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { color: INK, fontSize: 8 },
  barValue: { color: MUTED, fontSize: 7.5 },
  barTrack: { height: 7, borderRadius: 3.5, backgroundColor: '#E8EEF4', overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 3.5, backgroundColor: TEAL },
  callout: { backgroundColor: '#F0FDF8', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 8, padding: 11 },
  calloutTitle: { color: GREEN, fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  calloutText: { color: '#3E5A6B', fontSize: 7.8, lineHeight: 1.4 },
  noteGrid: { flexDirection: 'row', gap: 8 },
  noteCard: { flex: 1, backgroundColor: SOFT, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 10 },
  noteTitle: { color: INK, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  noteText: { color: MUTED, fontSize: 7.5, lineHeight: 1.4, marginTop: 4 },
  formulaRow: { flexDirection: 'row', gap: 8, paddingVertical: 6, borderBottomWidth: 0.6, borderBottomColor: LINE },
  formulaIndex: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  formulaIndexText: { color: '#FFFFFF', fontSize: 7, fontFamily: 'Helvetica-Bold' },
  formulaLabel: { color: MUTED, fontSize: 7, marginBottom: 2 },
  formulaValue: { color: INK, fontSize: 8, fontFamily: 'Helvetica-Bold', lineHeight: 1.35 },
  readinessCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY, borderRadius: 10, padding: 12 },
  coverageRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderTopWidth: 0.6, borderTopColor: LINE },
  readinessScore: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  readinessLabel: { color: '#9DC5C0', fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: 0.6 },
  readinessTrack: { height: 7, borderRadius: 3.5, backgroundColor: '#25445C', overflow: 'hidden', marginTop: 8 },
  readinessFill: { height: 7, borderRadius: 3.5, backgroundColor: '#34D399' },
  checklistRow: { flexDirection: 'row', gap: 8, paddingVertical: 6, borderBottomWidth: 0.6, borderBottomColor: LINE },
  checkBox: { width: 13, height: 13, borderRadius: 3, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkBoxDone: { backgroundColor: GREEN, borderColor: GREEN },
  checkBoxTodo: { backgroundColor: '#FFFFFF', borderColor: '#B7C6D4' },
  checkMark: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  checklistLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: INK },
  checklistDesc: { fontSize: 7.5, color: MUTED, marginTop: 2, lineHeight: 1.35 },
  footer: { position: 'absolute', bottom: 22, left: 40, right: 40 },
  footerLine: { height: 1, backgroundColor: LINE, marginBottom: 7 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { color: MUTED, fontSize: 6.8 },
  footerPage: { color: GREEN, fontSize: 6.8, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
})

type CbamPdfDocumentProps = {
  data: CbamExportData
}

const Brand = ({ light = false }: { light?: boolean }) => (
  <View style={styles.brandRow}>
    <View style={[styles.brandTile, light ? undefined : { borderWidth: 1, borderColor: LINE }]}>
      <Image src={logoUrl} style={styles.brandLogo} />
    </View>
    <Text style={[styles.brandName, light ? undefined : { color: INK, fontSize: 11 }]}>JEJAK</Text>
  </View>
)

const Footer = ({ code }: { code: string }) => (
  <View style={styles.footer} fixed>
    <View style={styles.footerLine} />
    <View style={styles.footerRow}>
      <Text style={styles.footerText}>{code} · Laporan ilustratif — bukan dokumen resmi UE</Text>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) =>
          `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`
        }
      />
    </View>
  </View>
)

const SectionHeading = ({ no, title, aside }: { no: string; title: string; aside?: string }) => (
  <View style={styles.sectionHead}>
    <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>{no}</Text></View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {aside ? <Text style={styles.sectionAside}>{aside}</Text> : null}
  </View>
)

const KV = ({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) => (
  <View style={styles.kvRow} wrap={false}>
    <Text style={styles.kvLabel}>{label}</Text>
    <Text style={[styles.kvValue, muted ? styles.kvMuted : undefined]}>{value}</Text>
  </View>
)

const Pill = ({ text, tone = 'green' }: { text: string; tone?: 'green' | 'amber' | 'gray' }) => (
  <View style={[styles.pill, tone === 'amber' ? styles.pillAmber : tone === 'gray' ? styles.pillGray : styles.pillGreen]}>
    <Text style={[styles.pillText, tone === 'amber' ? styles.pillTextAmber : tone === 'gray' ? styles.pillTextGray : undefined]}>{text}</Text>
  </View>
)

const InnerHeader = ({ eyebrow, title, subtitle, badge, code }: {
  eyebrow: string
  title: string
  subtitle: string
  badge: string
  code: string
}) => (
  <View>
    <View style={styles.innerHeader}>
      <Brand />
      <Text style={styles.innerDocCode}>{code}</Text>
    </View>
    <View style={styles.innerDivider} />
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.heroMetaLabel, { color: GREEN }]}>{eyebrow}</Text>
        <Text style={styles.innerTitle}>{title}</Text>
        <Text style={styles.innerSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.innerBadge}><Text>{badge}</Text></View>
    </View>
  </View>
)

const CbamPdfDocument = ({ data }: CbamPdfDocumentProps) => {
  const code = `JEJAK-CBAM-${data.installationId}-${data.generatedAtISO.slice(0, 10)}`
  const totalEnergy = data.sourceBreakdown.reduce((sum, row) => sum + row.energyMWh, 0)
  const totalDirect = data.sourceBreakdown.reduce((sum, row) => sum + row.directTCO2e, 0)
  const seeDirect = data.products[0]?.seeDirect ?? 0
  const seeIndirect = data.products[0]?.seeIndirect ?? 0
  const seeTotal = seeDirect + seeIndirect
  const seeDirectShare = seeTotal > 0 ? (seeDirect / seeTotal) * 100 : 0
  const topSource = [...data.sourceBreakdown].sort((a, b) => b.energyMWh - a.energyMWh)[0]
  const topSourceShare = totalEnergy > 0 && topSource ? (topSource.energyMWh / totalEnergy) * 100 : 0

  const coverageTone = (status: string): 'green' | 'amber' | 'gray' => {
    if (status === 'Diisi') return 'green'
    if (status.includes('sebagian') || status.includes('Ringkasan')) return 'amber'
    return 'gray'
  }

  return (
    <Document title="Laporan Komunikasi CBAM — JEJAK" author="JEJAK" subject="Ringkasan komunikasi CBAM berbasis data JEJAK">
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRing} />
          <View style={styles.heroRingInner} />
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <Brand light />
              <Text style={styles.heroBadge}>EDISI ILUSTRATIF · CBAM V2</Text>
            </View>
            <Text style={styles.coverEyebrow}>LAPORAN KOMUNIKASI UNTUK REPORTING DECLARANT</Text>
            <Text style={styles.coverTitle}>Laporan Komunikasi{'\n'} & Kepatuhan CBAM</Text>
            <Text style={styles.coverSubtitle}>
              Ringkasan instalasi, emisi, produk, dan kesiapan pelaporan. Disusun dari telemetri JEJAK
              mengikuti struktur Communication Template for Installations (EU CBAM V2).
            </Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>INSTALASI</Text>
                <Text style={styles.heroMetaValue}>{data.plant}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>PERIODE</Text>
                <Text style={styles.heroMetaValue}>{data.periodLabel}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>DIBUAT</Text>
                <Text style={styles.heroMetaValue}>{data.generatedAt}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.coverSpacer} />

        <View style={styles.spotlightCard}>
          <View style={styles.spotlightAccent} />
          <View style={{ flex: 1.45 }}>
            <Text style={styles.spotlightLabel}>ESTIMASI EKSPOSUR BIAYA CBAM</Text>
            <Text style={styles.spotlightValue}>{formatCurrencyIDR(data.costIDR)}</Text>
            <Text style={styles.spotlightSub}>≈ €{number(data.costEur)} · {number(data.tonnes)} ton {data.commodity.name}</Text>
          </View>
          <View style={styles.spotlightDivider} />
          <View style={styles.spotlightStat}>
            <Text style={styles.spotlightStatLabel}>Emisi tersemat</Text>
            <Text style={styles.spotlightStatValue}>{number(data.embeddedEmissions)}</Text>
            <Text style={styles.spotlightStatLabel}>tCO₂e</Text>
          </View>
          <View style={styles.spotlightStat}>
            <Text style={styles.spotlightStatLabel}>Intensitas</Text>
            <Text style={styles.spotlightStatValue}>{data.intensity.toFixed(2)}</Text>
            <Text style={styles.spotlightStatLabel}>tCO₂e / ton</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ENERGI TERPAU</Text>
            <Text style={styles.metricValue}>{number(data.energyMWh)}</Text>
            <Text style={styles.metricHint}>MWh dari {data.sourceBreakdown.length} area</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>EMISI LANGSUNG</Text>
            <Text style={styles.metricValue}>{number(data.directEmissions)}</Text>
            <Text style={styles.metricHint}>tCO₂e · model pembakaran</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>KESIAPAN DATA</Text>
            <Text style={styles.metricValue}>{data.completion}%</Text>
            <Text style={styles.metricHint}>{data.checklist.filter((item) => item.done).length} dari {data.checklist.length} item</Text>
          </View>
        </View>

        <SectionHeading no="01" title="Sorotan laporan" aside="Ringkasan satu halaman" />
        <View style={styles.cardSoft}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Komoditas {data.commodity.name} dengan kode CN {data.commodity.cnCode}, kategori {data.commodity.goodsCategory}, dan rute produksi {data.commodity.productionRoute}.</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{data.dataQuality}. Metodologi: {data.monitoringMethodology.toLowerCase()}.</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{data.carbonPriceNote} Harga sertifikat acuan €{number(data.certificatePriceEur)}/t dengan kurs €1 ≈ {formatCurrencyIDR(EUR_TO_IDR)}.</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Status verifikasi: {data.verifier}. Lengkapi field template UE yang belum tersedia sebelum pengajuan resmi.</Text>
          </View>
        </View>

        {topSource ? (
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>INSIGHT JEJAK · PRIORITAS AUDIT</Text>
            <Text style={styles.insightText}>
              Area {topSource.source.replace(' (Combustion)', '')} menyumbang {number(topSourceShare)}% dari total energi
              terpantau. Fokuskan verifikasi data dan efisiensi di area ini untuk menurunkan emisi tersemat lebih cepat.
            </Text>
          </View>
        ) : null}

        <View style={styles.coverNote}>
          <Text style={styles.coverNoteText}>
            Seluruh angka bersifat ilustratif untuk demonstrasi JEJAK. Tarif, kurs, emisi, dan status kesiapan
            bukan nilai resmi Komisi Eropa serta bukan nasihat hukum, pajak, atau kepatuhan.
          </Text>
        </View>

        <Footer code={code} />
      </Page>

      <Page size="A4" style={styles.page}>
        <InnerHeader
          eyebrow="BAGIAN A · A_INSTDATA / SUMMARY_PROCESSES"
          title="Profil Instalasi & Cakupan"
          subtitle="Identitas instalasi, cakupan sektor, dan proses produksi yang menjadi dasar pelaporan."
          badge="SECTION 01"
          code={code}
        />

        <SectionHeading no="01" title="Identitas & periode pelaporan" aside="Sumber: data contoh JEJAK" />
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <KV label="Nama instalasi" value={`${data.plant} (JEJAK)`} />
              <KV label="ID instalasi" value={data.installationId} />
              <KV label="Kegiatan ekonomi" value={`Manufacturing — ${data.commodity.goodsCategory}`} />
            </View>
            <View style={{ flex: 1 }}>
              <KV label="Mulai periode" value={data.periodStart.toLocaleDateString('id-ID')} />
              <KV label="Akhir periode" value={data.periodEnd.toLocaleDateString('id-ID')} />
              <KV label="Negara / UNLOCODE" value="Belum tersedia" muted />
            </View>
          </View>
          <KV label="Alamat, kode pos, dan koordinat sumber emisi" value="Belum tersedia di data JEJAK" muted />
        </View>

        <SectionHeading no="02" title="Cakupan sektor CBAM" aside={`${data.sectorCoverage.length} kategori tercakup`} />
        <View style={styles.pillRow}>
          {data.sectorCoverage.map((sector) => <Pill key={sector} text={sector} />)}
        </View>

        <SectionHeading no="03" title="Status deklaran & verifikasi" />
        <View style={styles.cardSoft}>
          <KV label="Status deklaran pelapor" value={data.declarantStatus} />
          <KV label="Metodologi pemantauan" value={data.monitoringMethodology} />
          <KV label="Verifier laporan" value={data.verifier} muted />
        </View>

        <SectionHeading no="04" title="Proses produksi & barang" aside="Summary_Products · P1" />
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '26%' }]}>PROSES</Text>
            <Text style={[styles.th, { width: '29%' }]}>KATEGORI BARANG</Text>
            <Text style={[styles.th, { width: '25%' }]}>RUTE PRODUKSI</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>VOLUME / AGEN</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.tdStrong, { width: '26%' }]}>P1 — {data.commodity.name}</Text>
            <Text style={[styles.td, { width: '29%' }]}>{data.commodity.goodsCategory}</Text>
            <Text style={[styles.td, { width: '25%' }]}>{data.commodity.productionRoute}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>{number(data.tonnes)} t · {data.commodity.reducingAgent}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.td, styles.tdStrong, { width: '26%' }]}>Prekursor dibeli</Text>
            <Text style={[styles.td, { width: '74%' }]}>Belum tersedia — tidak ada catatan prekursor pada data contoh JEJAK (sheet E_PurchPrec).</Text>
          </View>
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>Catatan kesesuaian template</Text>
          <Text style={styles.calloutText}>
            Field wajib UE seperti alamat lengkap, UNLOCODE, koordinat, dan verifikasi belum tersedia pada data
            JEJAK sehingga sengaja ditandai “Belum tersedia” dan tidak diisi dengan nilai rekaan.
          </Text>
        </View>

        <Footer code={code} />
      </Page>

      <Page size="A4" style={styles.page}>
        <InnerHeader
          eyebrow="BAGIAN B–C · B_EMINST / C_EMISSIONS&ENERGY"
          title="Energi, Emisi & Kualitas Data"
          subtitle="Neraca energi, komposisi sumber emisi, dan metodologi penentuan emisi tersemat."
          badge="SECTION 02"
          code={code}
        />

        <View style={styles.kpiStrip}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>ENERGI</Text><View style={styles.kpiDot} /></View>
            <Text style={styles.kpiValue}>{number(data.energyMWh)}</Text>
            <Text style={styles.kpiUnit}>MWh terpantau · {number(data.energyTJ, 1)} TJ</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>EMISI LANGSUNG</Text><View style={styles.kpiDot} /></View>
            <Text style={styles.kpiValue}>{number(data.directEmissions)}</Text>
            <Text style={styles.kpiUnit}>tCO₂e · model B_EmInst</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>EMISI TIDAK LANGSUNG</Text><View style={styles.kpiDot} /></View>
            <Text style={styles.kpiValue}>{number(data.indirectEmissions)}</Text>
            <Text style={styles.kpiUnit}>tCO₂e · Scope 2</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>TOTAL EMISI</Text><View style={styles.kpiDot} /></View>
            <Text style={styles.kpiValue}>{number(data.totalEmissions)}</Text>
            <Text style={styles.kpiUnit}>tCO₂e · catatan karbon</Text>
          </View>
        </View>

        <SectionHeading no="01" title="Komposisi konsumsi energi" aside={`Total ${number(totalEnergy)} MWh`} />
        <View style={styles.card}>
          {data.sourceBreakdown.map((row, idx) => {
            const share = totalEnergy > 0 ? (row.energyMWh / totalEnergy) * 100 : 0
            return (
              <View key={row.source} style={styles.barRow} wrap={false}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>{row.source}</Text>
                  <Text style={styles.barValue}>{number(row.energyMWh)} MWh · {number(share)}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${share}%`, backgroundColor: idx % 2 === 0 ? TEAL : GREEN }]} />
                </View>
              </View>
            )
          })}
        </View>

        <SectionHeading no="02" title="Neraca emisi & kualitas data" aside="C_Emissions&Energy" />
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '55%' }]}>PARAMETER</Text>
            <Text style={[styles.th, { width: '25%' }]}>NILAI</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>SATUAN</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { width: '55%' }]}>Emisi langsung dari sumber (model)</Text>
            <Text style={[styles.td, styles.tdStrong, { width: '25%' }]}>{number(totalDirect)}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>tCO₂e</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.td, { width: '55%' }]}>Emisi terpantau dari catatan karbon</Text>
            <Text style={[styles.td, styles.tdStrong, { width: '25%' }]}>{number(data.monitoredEmissions)}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>tCO₂e</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { width: '55%' }]}>Catatan tercatat / estimasi</Text>
            <Text style={[styles.td, styles.tdStrong, { width: '25%' }]}>{data.recordedCount} / {data.estimatedCount}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>catatan</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.td, { width: '55%' }]}>Kualitas data</Text>
            <Text style={[styles.td, { width: '45%' }]}>{data.dataQuality}</Text>
          </View>
        </View>

        <SectionHeading no="03" title="Metodologi & perlakuan nilai default" />
        <View style={styles.noteGrid}>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Metodologi pemantauan</Text>
            <Text style={styles.noteText}>{data.monitoringMethodology}. Belum diverifikasi oleh pihak terakreditasi.</Text>
          </View>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Nilai default UE</Text>
            <Text style={styles.noteText}>{data.defaultValuesNote}</Text>
          </View>
        </View>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{data.carbonPriceNote} Faktor emisi dan NCV yang digunakan adalah konstanta ilustratif JEJAK, bukan nilai resmi UE.</Text>
        </View>

        <Footer code={code} />
      </Page>

      <Page size="A4" style={styles.page}>
        <InnerHeader
          eyebrow="BAGIAN D–E · SUMMARY_PRODUCTS / D_PROCESSES"
          title="Produk, SEE & Model Biaya"
          subtitle="Specific embedded emissions per produk dan dasar perhitungan estimasi eksposur CBAM."
          badge="SECTION 03"
          code={code}
        />

        <SectionHeading no="01" title="Ringkasan produk & emisi tersemat" aside={`${data.products.length} produk`} />
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '28%' }]}>PROSES / PRODUK</Text>
            <Text style={[styles.th, { width: '13%' }]}>KODE CN</Text>
            <Text style={[styles.th, { width: '17%', textAlign: 'right' }]}>SEE LANGSUNG</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>SEE TAK LANGSUNG</Text>
            <Text style={[styles.th, { width: '22%', textAlign: 'right' }]}>SEE TOTAL</Text>
          </View>
          {data.products.map((product, idx) => (
            <View key={product.process} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : undefined]} wrap={false}>
              <Text style={[styles.td, { width: '28%' }]}>
                <Text style={styles.tdStrong}>{product.process}</Text>
                {'\n'}{product.productName}
              </Text>
              <Text style={[styles.td, { width: '13%' }]}>{product.cnCode}</Text>
              <Text style={[styles.td, styles.tdRight, { width: '17%' }]}>{product.seeDirect.toFixed(2)}</Text>
              <Text style={[styles.td, styles.tdRight, { width: '20%' }]}>{product.seeIndirect.toFixed(2)}</Text>
              <Text style={[styles.td, styles.tdStrong, styles.tdRight, { width: '22%' }]}>{product.seeTotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.td, { width: '100%' }]}>Satuan: tCO₂e per ton produk · kategori {data.products[0]?.aggregatedGood ?? data.commodity.goodsCategory}</Text>
          </View>
        </View>

        <View style={styles.cardSoft}>
          <KV label="Agen pereduksi" value={data.commodity.reducingAgent} />
          <KV label="Bagian emisi nilai default" value={`${data.products[0]?.shareDefault ?? 0}% — seluruhnya dari data aktual JEJAK`} />
          <KV label="Sumber faktor emisi listrik" value={data.products[0]?.electricityEfSource ?? 'Faktor emisi contoh JEJAK'} />
          <KV label="Listrik tersemat" value={`${(data.products[0]?.embeddedElectricity ?? 0).toFixed(2)} MWh per ton`} />
        </View>

        <SectionHeading no="02" title="Komposisi SEE per ton produk" aside={`${seeTotal.toFixed(2)} tCO₂e/t`} />
        <View style={styles.card}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Langsung {number(seeDirectShare)}%</Text>
            <Text style={styles.barLabel}>Tak langsung {number(100 - seeDirectShare)}%</Text>
          </View>
          <View style={[styles.barTrack, { height: 10, flexDirection: 'row' }]}>
            <View style={{ width: `${seeDirectShare}%`, height: 10, backgroundColor: GREEN }} />
            <View style={{ width: `${100 - seeDirectShare}%`, height: 10, backgroundColor: '#7DD3C0' }} />
          </View>
        </View>

        <SectionHeading no="03" title="Model perhitungan biaya CBAM" aside={`€${number(data.costEur)} · ${formatCurrencyIDR(data.costIDR)}`} />
        <View style={styles.card}>
          {data.formula.map((item, idx) => (
            <View key={item.label} style={styles.formulaRow} wrap={false}>
              <View style={styles.formulaIndex}><Text style={styles.formulaIndexText}>{idx + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formulaLabel}>{item.label.toUpperCase()}</Text>
                <Text style={styles.formulaValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>Asumsi perhitungan</Text>
          <Text style={styles.calloutText}>
            Estimasi menggunakan tarif ilustratif €{number(data.certificatePriceEur)} per ton, kurs €1 ≈ {formatCurrencyIDR(EUR_TO_IDR)},
            tanpa penyesuaian alokasi gratis maupun pengurangan pajak karbon di negara asal. Hasil ini bukan tagihan CBAM resmi.
          </Text>
        </View>

        <Footer code={code} />
      </Page>

      <Page size="A4" style={styles.page}>
        <InnerHeader
          eyebrow="BAGIAN F–G · KESIAPAN & LAMPIRAN"
          title="Kesiapan Pelaporan & Cakupan Template"
          subtitle="Daftar periksa internal dan peta kelengkapan field pada template resmi UE."
          badge="SECTION 04"
          code={code}
        />

        <SectionHeading no="01" title="Skor kesiapan pelaporan" aside={`${data.completion}% dari daftar periksa`} />
        <View style={styles.readinessCard}>
          <View style={{ width: 105 }}>
            <Text style={styles.readinessLabel}>SKOR KESIAPAN</Text>
            <Text style={styles.readinessScore}>{data.completion}%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.calloutText, { color: '#D6E8E4' }]}>
              {data.checklist.filter((item) => item.done).length} dari {data.checklist.length} prasyarat data telah ditandai selesai pada simulator JEJAK.
            </Text>
            <View style={styles.readinessTrack}>
              <View style={[styles.readinessFill, { width: `${data.completion}%` }]} />
            </View>
          </View>
        </View>

        <View style={{ marginTop: 9 }}>
          {data.checklist.map((item) => (
            <View key={item.label} style={styles.checklistRow} wrap={false}>
              <View style={[styles.checkBox, item.done ? styles.checkBoxDone : styles.checkBoxTodo]}>
                {item.done ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checklistLabel}>{item.label}</Text>
                <Text style={styles.checklistDesc}>{item.description}</Text>
              </View>
              <Pill text={item.done ? 'Selesai' : 'Perlu ditinjau'} tone={item.done ? 'green' : 'amber'} />
            </View>
          ))}
        </View>

        <SectionHeading no="02" title="Peta kelengkapan template UE" aside="Summary_Communication" />
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '44%' }]}>SHEET / AREA</Text>
            <Text style={[styles.th, { width: '56%' }]}>STATUS & SUMBER DATA</Text>
          </View>
          {data.coverage.map((row, idx) => (
            <View key={row.area} style={[styles.coverageRow, idx % 2 === 1 ? styles.tableRowAlt : undefined]} wrap={false}>
              <Text style={[styles.td, styles.tdStrong, { width: '44%' }]}>{row.area}</Text>
              <View style={{ width: '56%', flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                <Text style={[styles.td, { flex: 1 }]}>{row.source}</Text>
                <Pill text={row.status} tone={coverageTone(row.status)} />
              </View>
            </View>
          ))}
        </View>

        <SectionHeading no="03" title="Batas penggunaan laporan" />
        <View style={styles.noteGrid}>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>01 · Demonstrasi</Text>
            <Text style={styles.noteText}>Angka berasal dari data contoh dan telemetri simulasi JEJAK, bukan pengukuran resmi instalasi.</Text>
          </View>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>02 · Pelengkapan</Text>
            <Text style={styles.noteText}>Lengkapi sheet A–G template UE dan minta verifikasi sebelum digunakan untuk kewajiban regulasi.</Text>
          </View>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>03 · Bukan nasihat</Text>
            <Text style={styles.noteText}>Dokumen ini bukan nasihat hukum, pajak, atau kepatuhan serta bukan pengganti komunikasi resmi kepada otoritas UE.</Text>
          </View>
        </View>

        <Footer code={code} />
      </Page>
    </Document>
  )
}

export default CbamPdfDocument
