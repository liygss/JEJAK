import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CbamExportData } from '../../lib/cbamData'
import { formatCurrencyIDR } from '../../lib/formatters'

const GREEN = '#059669'
const TEXT = '#0F172A'
const MUTED = '#64748B'
const BORDER = '#E2E8F0'
const SOFT = '#F8FAFC'
const MINT = '#D1FAE5'

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 36, fontSize: 8.5, fontFamily: 'Helvetica', color: TEXT },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  brand: { fontSize: 20, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  brandGreen: { color: GREEN },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 6 },
  subtitle: { fontSize: 8, color: MUTED, marginTop: 2 },
  badge: { backgroundColor: MINT, color: GREEN, fontSize: 7.5, fontFamily: 'Helvetica-Bold', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8 },
  metaRow: { alignItems: 'flex-end' },
  metaText: { fontSize: 7.5, color: MUTED, marginTop: 1 },
  metaStrong: { color: TEXT, fontFamily: 'Helvetica-Bold' },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 10 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: TEXT },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 4.5 },
  rowLabel: { fontSize: 8.5, color: MUTED },
  rowValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: TEXT },
  bigCard: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, backgroundColor: SOFT, padding: 10, marginBottom: 10 },
  bigValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: TEXT, marginTop: 2 },
  grid2: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  col: { flex: 1 },
  checklistItem: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  check: { fontSize: 8.5, fontFamily: 'Helvetica-Bold' },
  itemText: { fontSize: 8.5, color: TEXT, flex: 1 },
  disclaimer: { marginTop: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 8, backgroundColor: SOFT },
  disclaimerText: { fontSize: 7, color: MUTED, lineHeight: 1.3 },
  footer: { position: 'absolute', bottom: 20, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6 },
  footerText: { fontSize: 7, color: MUTED },
})

export type CbamPdfDocumentProps = {
  data: CbamExportData
}

const CbamPdfDocument = ({ data }: CbamPdfDocumentProps) => {
  return (
    <Document title="Laporan Kepatuhan & Komunikasi CBAM JEJAK" author="JEJAK" subject="CBAM Installation Communication Summary">
      {/* Page 1: Summary & Financials */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>
              JE<Text style={styles.brandGreen}>JAK</Text>
            </Text>
            <Text style={styles.title}>Laporan Komunikasi & Kepatuhan CBAM</Text>
            <Text style={styles.subtitle}>EU Carbon Border Adjustment Mechanism (Definitive Phase Ready)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.badge}>OFFICIAL TEMPLATE ALIGNED</Text>
            <Text style={styles.metaText}><Text style={styles.metaStrong}>Pabrik: </Text>{data.plant}</Text>
            <Text style={styles.metaText}><Text style={styles.metaStrong}>Periode: </Text>{data.periodLabel}</Text>
            <Text style={styles.metaText}><Text style={styles.metaStrong}>Dibuat: </Text>{data.generatedAt}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bigCard}>
          <Text style={styles.rowLabel}>Estimasi Eksposur Biaya CBAM Tahunan</Text>
          <Text style={styles.bigValue}>{formatCurrencyIDR(data.costIDR)}</Text>
          <Text style={{ fontSize: 7.5, color: MUTED, marginTop: 3 }}>
            ≈ €{data.costEur.toLocaleString('id-ID')} pada volume {data.tonnes.toLocaleString('id-ID')} ton {data.commodity.name} (€{data.commodity.ratePerTonneEur}/t)
          </Text>
        </View>

        <View style={styles.grid2}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Parameter Simulasi</Text>
            {[
              ['Komoditas', data.commodity.name],
              ['Kategori Barang', data.commodity.goodsCategory],
              ['Kode CN', String(data.commodity.cnCode)],
              ['Rute Produksi', data.commodity.productionRoute],
              ['Volume Tahunan', `${data.tonnes.toLocaleString('id-ID')} ton`],
              ['Intensitas Tersemat', `${data.intensity.toFixed(2)} tCO₂e/t`],
            ].map(([l, v]) => (
              <View key={l} style={styles.row}>
                <Text style={styles.rowLabel}>{l}</Text>
                <Text style={styles.rowValue}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Metrik Biaya & Emisi</Text>
            {[
              ['Biaya per ton', formatCurrencyIDR(data.perTonneIDR)],
              ['Biaya per tCO₂e', formatCurrencyIDR(data.perTonneCo2IDR)],
              ['Emisi Tersemat Tersirat', `${data.embeddedEmissions.toLocaleString('id-ID', { maximumFractionDigits: 0 })} tCO₂e`],
              ['Total Energi Terpantau', `${data.energyMWh.toLocaleString('id-ID')} MWh`],
              ['Total Emisi Terpantau', `${data.monitoredEmissions.toFixed(1)} tCO₂e`],
              ['Emisi Langsung (Model)', `${data.directEmissions.toFixed(1)} tCO₂e`],
              ['Emisi Tak Langsung (Scope 2)', `${data.indirectEmissions.toFixed(1)} tCO₂e`],
            ].map(([l, v]) => (
              <View key={l} style={styles.row}>
                <Text style={styles.rowLabel}>{l}</Text>
                <Text style={styles.rowValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>JEJAK — Platform Intelijen Industri Bertenaga AI</Text>
          <Text style={styles.footerText}>Halaman 1 dari 2</Text>
        </View>
      </Page>

      {/* Page 2: Source Streams, Products & Readiness */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Rincian Sumber Emisi & Kesiapan Pelaporan</Text>
            <Text style={styles.subtitle}>{data.plant} • {data.periodLabel}</Text>
          </View>
          <Text style={styles.badge}>LAMPIRAN B & SUMMARY</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>1. Aliran Sumber Emisi (B_EmInst Aligned)</Text>
        {data.sourceBreakdown.map((src: { source: string; energyMWh: number; activityT: number; directTCO2e: number }) => (
          <View key={src.source} style={styles.row}>
            <Text style={styles.rowLabel}>{src.source} ({src.energyMWh.toLocaleString('id-ID')} MWh)</Text>
            <Text style={styles.rowValue}>{src.activityT.toFixed(1)} ton aktivitas • {src.directTCO2e.toFixed(1)} tCO₂e</Text>
          </View>
        ))}

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>2. Ringkasan Produk & SEE (Summary_Products)</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Proses & Produk</Text>
            <Text style={styles.rowValue}>P1 — {data.commodity.name} (CN: {data.commodity.cnCode})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Agen Pereduksi Utama</Text>
            <Text style={styles.rowValue}>{data.commodity.reducingAgent}</Text>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>3. Daftar Periksa Kesiapan CBAM — {data.completion}% Selesai</Text>
          {data.checklist.map((item: { label: string; done: boolean }) => (
            <View key={item.label} style={styles.checklistItem}>
              <Text style={{ ...styles.check, color: item.done ? GREEN : MUTED }}>{item.done ? '[ ✓ ]' : '[   ]'}</Text>
              <Text style={styles.itemText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Pemberitahuan: Laporan ini diselaraskan dengan struktur Communication Template for Installations (EU CBAM V2). Seluruh tarif, kurs, dan estimasi adalah nilai referensi dan bukan dokumen hukum resmi. Konfirmasikan kewajiban pelaporan dengan Komisi Eropa dan penasihat berlisensi.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>JEJAK — Platform Intelijen Industri Bertenaga AI</Text>
          <Text style={styles.footerText}>Halaman 2 dari 2</Text>
        </View>
      </Page>
    </Document>
  )
}

export default CbamPdfDocument
