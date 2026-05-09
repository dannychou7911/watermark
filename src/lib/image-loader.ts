/**
 * Load a File (from <input type="file"> or drag-drop) into an HTMLImageElement.
 * Returns the element, an ObjectURL (caller is responsible for revoking later),
 * and natural dimensions. Rejects on invalid images or unsupported MIME types.
 */
export interface LoadedImage {
  file: File
  url: string
  img: HTMLImageElement
  width: number
  height: number
}

const ACCEPTED = /^image\/(jpeg|png|webp|gif|bmp)$/i

export async function loadImageFromFile(file: File): Promise<LoadedImage> {
  if (!ACCEPTED.test(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || 'unknown'}`)
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await loadElement(url)
    return {
      file,
      url,
      img,
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
}

function loadElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () =>
      reject(new Error('Failed to decode image — file may be corrupt'))
    img.src = url
  })
}

/** Convenience helper: only accept the first image from a FileList/array */
export function pickFirstImage(files: FileList | File[] | null): File | null {
  if (!files) return null
  const list = Array.from(files)
  return list.find((f) => ACCEPTED.test(f.type)) ?? null
}
