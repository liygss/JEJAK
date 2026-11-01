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

  // 1. Fill A_InstData (sheet 5 approx or by name 'A_InstData')
  const sheetA = workbook.getWorksheet('A_InstData')
  if (sheetA) {
    sheetA.getCell('I9').value = data.periodStart
    sheetA.getCell('L9').value = data.periodEnd
    sheetA.getCell('I20').value = data.plant
    sheetA.getCell('I22').value = `Manufacturing of ${data.commodity.goodsCategory}`

    // Goods category row 62
    sheetA.getCell('E62').value = data.commodity.goodsCategory
    sheetA.getCell('I62').value = data.commodity.productionRoute

    // Production process row 83
    sheetA.getCell('E83').value = data.commodity.goodsCategory
    sheetA.getCell('F83').value = 'Only direct production'
    sheetA.getCell('L83').value = `JEJAK ${data.commodity.name} Production Line`
  }

  // 2. Fill B_EmInst (sheet 'B_EmInst')
  const sheetB = workbook.getWorksheet('B_EmInst')
  if (sheetB) {
    // Rows 14-16 contain sample activity data in the official template.
    // Clear only the input columns; I/K/M hold formulas (incl. shared
    // formula masters) and must never be overwritten.
    const inputCols = ['D', 'E', 'F', 'G', 'H', 'J', 'N', 'O']
    for (let r = 14; r <= 16; r++) {
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

  // 3. Fill C_Emissions&Energy (sheet 'C_Emissions&Energy')
  const sheetC = workbook.getWorksheet('C_Emissions&Energy')
  if (sheetC) {
    sheetC.getCell('I15').value = data.energyTJ
    sheetC.getCell('M26').value = data.indirectEmissions
    sheetC.getCell('H40').value = 'Mostly measurements & national standard factors for e.g. the emission factor'
    sheetC.getCell('H42').value = 'Four eyes principle'
  }

  // 4. Fill D_Processes (sheet 'D_Processes')
  const sheetD = workbook.getWorksheet('D_Processes')
  if (sheetD) {
    // Process 1 starts around row 11
    sheetD.getCell('L16').value = data.tonnes
    sheetD.getCell('L27').value = data.tonnes
    sheetD.getCell('L54').value = data.directEmissions
    sheetD.getCell('L65').value = data.energyMWh
    sheetD.getCell('L66').value = data.energyMWh > 0 ? data.indirectEmissions / data.energyMWh : 0
    sheetD.getCell('L67').value = 'D.4.1'
  }

  // 5. Fill Summary_Products (sheet 'Summary_Products')
  const sheetSummaryProd = workbook.getWorksheet('Summary_Products')
  if (sheetSummaryProd) {
    sheetSummaryProd.getCell('D10').value = 'P1'
    sheetSummaryProd.getCell('F10').value = data.commodity.cnCode
    sheetSummaryProd.getCell('H10').value = `${data.commodity.name} (JEJAK verified)`
    sheetSummaryProd.getCell('P10').value = data.commodity.reducingAgent
  }

  // 6. Create JEJAK Summary Cover Sheet
  const coverSheet = workbook.addWorksheet('JEJAK_Summary', {
    views: [{ showGridLines: true }],
  })
  workbook.worksheets.unshift(workbook.worksheets.pop()!) // move cover to first

  coverSheet.columns = [
    { width: 32 },
    { width: 28 },
    { width: 20 },
    { width: 35 },
  ]

  coverSheet.mergeCells('A1:D1')
  const tCell = coverSheet.getCell('A1')
  tCell.value = 'JEJAK — RINGKASAN KOMUNIKASI & KEPATUHAN CBAM'
  tCell.font = { name: 'Helvetica', size: 14, bold: true, color: { argb: 'FFFFFF' } }
  tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } }
  tCell.alignment = { vertical: 'middle', horizontal: 'center' }
  coverSheet.getRow(1).height = 40

  const addRow = (label: string, val: string | number, hint = '') => {
    coverSheet.addRow([label, val, hint])
  }

  coverSheet.addRow([])
  addRow('Informasi Instalasi', '', '')
  coverSheet.getRow(coverSheet.rowCount).font = { bold: true, color: { argb: '0F172A' } }
  
  addRow('Nama Pabrik', data.plant, 'Pabrik terpilih di JEJAK')
  addRow('Periode Laporan', data.periodLabel, data.generatedAt)
  addRow('Komoditas Tercakup', data.commodity.name, data.commodity.goodsCategory)
  addRow('Kode CN', data.commodity.cnCode, '')
  addRow('Volume Tahunan Model', `${data.tonnes.toLocaleString('id-ID')} ton`, '')
  addRow('Intensitas Tersemat', `${data.intensity.toFixed(2)} tCO₂e/t`, '')

  coverSheet.addRow([])
  addRow('Ringkasan Emisi & Eksposur', '', '')
  coverSheet.getRow(coverSheet.rowCount).font = { bold: true, color: { argb: '0F172A' } }

  addRow('Estimasi Biaya CBAM', formatCurrencyIDR(data.costIDR), `≈ €${data.costEur.toLocaleString('id-ID')}`)
  addRow('Biaya per tCO₂e', formatCurrencyIDR(data.perTonneCo2IDR), '')
  addRow('Total Emisi Terpantau', `${data.monitoredEmissions.toFixed(1)} tCO₂e`, 'Dari sensor IoT JEJAK')
  addRow('Estimasi Emisi Langsung (Model)', `${data.directEmissions.toFixed(1)} tCO₂e`, 'Berdasarkan model pembakaran')
  addRow('Emisi Tak Langsung (Scope 2)', `${data.indirectEmissions.toFixed(1)} tCO₂e`, 'Listrik terpantau')
  addRow('Kesiapan Checklist CBAM', `${data.completion}% selesai`, '')

  coverSheet.addRow([])
  addRow('Catatan & Asumsi', '', '')
  coverSheet.getRow(coverSheet.rowCount).font = { bold: true, color: { argb: '0F172A' } }
  coverSheet.addRow(['• Dokumen ini dihasilkan otomatis oleh platform JEJAK berbasis template resmi EU CBAM (Desember 2024).'])
  coverSheet.addRow(['• Seluruh sheet template utama (A_InstData, B_EmInst, C_Emissions&Energy, D_Processes, Summary_Products) telah terisi otomatis.'])
  coverSheet.addRow(['• Angka dan asumsi ini bersifat ilustratif untuk keperluan evaluasi kepatuhan.'])

  // Enable full calculation on load
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
