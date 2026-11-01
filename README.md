# JEJAK

JEJAK adalah platform intelijen energi dan karbon bertenaga AI yang membantu tim pabrik memantau konsumsi energi, emisi karbon, kesiapan CBAM, dan peluang penghematan dalam satu dasbor.

## Fitur

- Ringkasan KPI energi, karbon, biaya, dan estimasi penghematan
- Pemantauan energi per area: Lini Produksi, HVAC, Pencahayaan, Utilitas
- MRV karbon (Scope 1 & 2) dengan status data
- Estimasi biaya CBAM dan ekspor PDF
- Wawasan AI dan tanya-jawab berbasis aturan
- Laporan siap unduh (CSV/PDF) per pabrik dan periode
- Konsol admin: armada perangkat, alert, dan papan perawatan
- Multi-pabrik: Pabrik Manufaktur A dan B

## Teknologi

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- Recharts, Framer Motion, Lucide
- @react-pdf/renderer, ExcelJS

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173.

## Skrip

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Jalankan server pengembangan |
| `npm run build` | Type-check + build produksi |
| `npm run preview` | Pratinjau hasil build |
| `npm run lint` | Jalankan Oxlint |

## Struktur

```text
src/
  components/   # UI, dashboard, admin, laporan
  data/         # Data contoh energi, karbon, perangkat, insight
  lib/          # Filter, perhitungan, formatter, label i18n
  pages/        # Halaman pengguna dan admin
public/         # Aset statis
```

## Catatan

- Angka yang ditampilkan bersifat ilustratif untuk keperluan demonstrasi.
- Estimasi CBAM bersifat indikatif dan bukan angka resmi maupun nasihat hukum.
