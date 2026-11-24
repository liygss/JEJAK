import ExcelJS from 'exceljs'
import type { CbamExportData } from './cbamData'
import { formatCurrencyIDR } from './formatters'

export async function generateCbamExcel(data: CbamExportData): Promise<void> {
  const response = await fetch(`${import.meta.env.BASE_URL}templates/cbam-installations-2024-12-13.xlsx`)
  if (!response.ok) {
    throw new Error('Gagal mengambil template resmi CBAM.')
  }
  const arrayBuffer = await response.arrayBuffer()

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)

  const sheetA = workbook.getWorksheet('A_InstData')
  if (sheetA) {
    sheetA.getCell('I9').value = data.periodStart
    sheetA.getCell('L9').value = data.periodEnd
    sheetA.getCell('I20').value = data.plant
    sheetA.getCell('I22').value = `Manufacturing of ${data.commodity.goodsCategory}`
    sheetA.getCell('E62').value = data.commodity.goodsCategory
    sheetA.getCell('I62').value = data.commodity.productionRoute
    sheetA.getCell('E83').value = data.commodity.goodsCategory
    sheetA.getCell('F83').value = 'Only direct production'
    sheetA.getCell('L83').value = `JEJAK ${data.commodity.name} Production Line`
  }

  const sheetB = workbook.getWorksheet('B_EmInst')
  if (sheetB) {
    const inputCols = ['D', 'E', 'F', 'G', 'H', 'J', 'N', 'O']
    const lastRow = 13 + Math.max(3, data.sourceBreakdown.length)
    for (let r = 14; r <= lastRow; r++) {
      inputCols.forEach((col) => {
        sheetB.getCell(`${col}${r}`).value = null
      })
    }
    data.sourceBreakdown.forEach((src, idx) => {
      const r = 14 + idx
      sheetB.getCell(`D${r}`).value = 'Combustion'
      sheetB.getCell(`E${r}`).value = src.source
      sheetB.getCell(`F${r}`).value = src.activityT
      sheetB.getCell(`G${r}`).value = 't'
      sheetB.getCell(`H${r}`).value = 48
      sheetB.getCell(`J${r}`).value = 56.1
      sheetB.getCell(`N${r}`).value = 100
      sheetB.getCell(`O${r}`).value = '%'
    })
  }

  const sheetC = workbook.getWorksheet('C_Emissions&Energy')
  if (sheetC) {
    sheetC.getCell('I15').value = data.energyTJ
    sheetC.getCell('M26').value = data.indirectEmissions
    sheetC.getCell('H40').value = data.monitoringMethodology
    sheetC.getCell('H42').value = data.verifier
  }

  const sheetD = workbook.getWorksheet('D_Processes')
  if (sheetD) {
    sheetD.getCell('L16').value = data.tonnes
    sheetD.getCell('L27').value = data.tonnes
    sheetD.getCell('L54').value = data.directEmissions
    sheetD.getCell('L65').value = data.energyMWh
    sheetD.getCell('L66').value = data.energyMWh > 0 ? data.indirectEmissions / data.energyMWh : 0
    sheetD.getCell('L67').value = 'D.4.1'
  }

  const sheetSummaryProd = workbook.getWorksheet('Summary_Products')
  if (sheetSummaryProd) {
    const p = data.products[0]
    sheetSummaryProd.getCell('D10').value = p.process
    sheetSummaryProd.getCell('F10').value = p.cnCode
    sheetSummaryProd.getCell('H10').value = p.productName
    sheetSummaryProd.getCell('P10').value = p.reducingAgent
  }

  const coverSheet = workbook.addWorksheet('JEJAK_Summary', {
    views: [{ showGridLines: true }],
  })
  workbook.worksheets.unshift(workbook.worksheets.pop()!)

  coverSheet.columns = [
    { width: 38 },
    { width: 34 },
    { width: 52 },
  ]

  coverSheet.mergeCells('A1:C1')
  const tCell = coverSheet.getCell('A1')
  tCell.value = 'JEJAK — RINGKASAN KOMUNIKASI & KEPATUHAN CBAM'
  tCell.font = { name: 'Helvetica', size: 14, bold: true, color: { argb: 'FFFFFF' } }
  tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } }
  tCell.alignment = { vertical: 'middle', horizontal: 'center' }
  coverSheet.getRow(1).height = 40

  const addRow = (label: string, val: string | number | Date, hint = '') => {
    coverSheet.addRow([label, val, hint])
  }
  const addHeading = (label: string) => {
    coverSheet.addRow([])
    addRow(label, '', '')
    coverSheet.getRow(coverSheet.rowCount).font = { bold: true, color: { argb: '0F172A' } }
  }

  addHeading('Informasi Instalasi')
  addRow('ID instalasi (ilustratif)', data.installationId, data.plant)
  addRow('Periode pelaporan', data.reportingPeriod, data.periodLabel)
  addRow('Mulai periode', data.periodStart, '')
  addRow('Akhir periode', data.periodEnd, '')
  addRow('Status deklaran', data.declarantStatus, 'Berdasarkan daftar periksa JEJAK')
  addRow('Sektor CBAM tercakup', data.sectorCoverage.join(', '), 'Cakupan sektor resmi UE')

  addHeading('Komoditas & Perhitungan')
  addRow('Komoditas', data.commodity.name, data.commodity.goodsCategory)
  addRow('Kode CN', data.commodity.cnCode, 'Contoh; verifikasi klasifikasi resmi')
  addRow('Rute produksi', data.commodity.productionRoute, data.commodity.reducingAgent)
  addRow('Volume tahunan', `${data.tonnes.toLocaleString('id-ID')} ton`, '')
  addRow('Intensitas tersemat', `${data.intensity.toFixed(2)} tCO₂e/t`, '')
  data.formula.forEach((item) => addRow(item.label, item.value, ''))

  addHeading('Emisi & Eksposur')
  addRow('Estimasi biaya CBAM', formatCurrencyIDR(data.costIDR), `≈ €${data.costEur.toLocaleString('id-ID')}`)
  addRow('Biaya per tCO₂e', formatCurrencyIDR(data.perTonneCo2IDR), '')
  addRow('Total emisi terpantau', `${data.monitoredEmissions.toFixed(1)} tCO₂e`, data.dataQuality)
  addRow('Emisi langsung (model)', `${data.directEmissions.toFixed(1)} tCO₂e`, 'Model pembakaran JEJAK')
  addRow('Emisi tak langsung', `${data.indirectEmissions.toFixed(1)} tCO₂e`, 'Catatan Scope 2')
  addRow('Pajak karbon dibayar', `€${data.carbonPricePaidEur}`, data.carbonPriceNote)

  addHeading('Metodologi & Verifikasi')
  addRow('Metodologi pemantauan', data.monitoringMethodology, '')
  addRow('Nilai default UE', data.defaultValuesNote, '')
  addRow('Verifier', data.verifier, '')
  addRow('Kesiapan checklist', `${data.completion}% selesai`, `${data.checklist.filter((i) => i.done).length}/${data.checklist.length} item`)

  addHeading('Peta Kelengkapan Template')
  data.coverage.forEach((row) => addRow(row.area, row.status, row.source))

  addHeading('Catatan & Asumsi')
  coverSheet.addRow(['• Dokumen ini dihasilkan otomatis oleh JEJAK berbasis Communication Template for Installations (EU CBAM V2, Desember 2024).'])
  coverSheet.addRow(['• Sebagian sheet template utama telah diisi otomatis. Tinjau dan lengkapi field lain sebelum digunakan untuk pengajuan resmi.'])
  coverSheet.addRow(['• Seluruh tarif, kurs, emisi, dan status kesiapan bersifat ilustratif dan bukan dokumen hukum resmi.'])

  workbook.calcProperties.fullCalcOnLoad = true

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `jejak_cbam_communication_${data.commodity.id}_${data.plant.replace(/\s+/g, '_').toLowerCase()}.xlsx`
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
