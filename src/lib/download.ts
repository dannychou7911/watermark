/** Trigger a browser download of the given blob */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Defer revoke so Chrome can pick up the download properly
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
