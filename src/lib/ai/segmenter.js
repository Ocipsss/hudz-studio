// src/lib/ai/segmenter.js
import { getSegmenter } from './model-loader.js'

export async function removeBackground(imageElement, onProgress) {
  const remover = await getSegmenter(onProgress)
  
  const w = imageElement.naturalWidth || imageElement.width || 300
  const h = imageElement.naturalHeight || imageElement.height || 300

  // Panggil MODNet
  const output = await remover(imageElement.src || imageElement)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imageElement, 0, 0, w, h)
  const origData = ctx.getImageData(0, 0, w, h)

  // Ambil Canvas Mask dari MODNet
  let maskCanvas = null
  if (Array.isArray(output) && output.length > 0) {
    maskCanvas = output[0].mask?.toCanvas ? output[0].mask.toCanvas() : output[0].mask
  } else if (output?.mask) {
    maskCanvas = output.mask.toCanvas ? output.mask.toCanvas() : output.mask
  }

  if (maskCanvas) {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = w
    tempCanvas.height = h
    const tCtx = tempCanvas.getContext('2d')
    tCtx.drawImage(maskCanvas, 0, 0, w, h)
    
    const maskData = tCtx.getImageData(0, 0, w, h)

    // Cari nilai piksel tertinggi (terterang) yang didapat MODNet
    let maxVal = 0
    for (let i = 0; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > maxVal) maxVal = maskData.data[i]
    }

    // Jika nilai tertinggi rendah (misal MODNet ragu itu produk/bukan manusia),
    // kita amplify/naikkan nilainya biar gambarnya tidak transparan total
    const boostFactor = maxVal > 0 ? (255 / maxVal) : 1

    for (let i = 0; i < origData.data.length; i += 4) {
      let alpha = maskData.data[i] * boostFactor
      
      // Berikan threshold tipis agar bagian produk tidak samar
      if (alpha < 30) alpha = 0 
      
      origData.data[i + 3] = Math.min(255, alpha)
    }

    ctx.putImageData(origData, 0, 0)
  }

  return canvas
}
