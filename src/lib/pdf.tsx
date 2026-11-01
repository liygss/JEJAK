import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

/**
 * Render a @react-pdf/renderer document element to a Blob and trigger a download.
 * The heavy renderer is imported on demand so it stays out of the initial bundle.
 * Returns the file name used.
 */
export async function downloadPdf(doc: ReactElement<DocumentProps>, filename: string): Promise<string> {
  const { pdf } = await import('@react-pdf/renderer')
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return filename
}
