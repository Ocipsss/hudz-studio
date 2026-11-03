// src/lib/ai/segmenter.js
import { getSegmenter } from './model-loader.js'

export async function removeBackground(imageElement, onProgress) {
  const remover = await getSegmenter(onProgress)
  
  // pipeline background-removal langsung return image transparan
  const output = await remover(imageElement)

  // output bisa berupa Blob / Canvas / Image, kita normalin jadi canvas
  const canvas = document.createElement('canvas')
  const w = imageElement.naturalWidth || imageElement.width
  const h = imageElement.naturalHeight || imageElement.height
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  if (output instanceof HTMLCanvasElement) {
    ctx.drawImage(output, 0, 0, w, h)
  } else if (output instanceof Blob) {
    const img = await createImageBitmap(output)
    ctx.drawImage(img, 0, 0, w, h)
  } else if (output?.width) {
    // RawImage dari transformers
    ctx.drawImage(output, 0, 0, w, h)
  } else {
    // fallback: output adalah Image element
    ctx.drawImage(output, 0, 0, w, h)
  }

  return canvas
}