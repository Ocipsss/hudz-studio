// src/lib/ai/model-loader.js
import { pipeline, env } from '@huggingface/transformers'

env.allowRemoteModels = true
env.useBrowserCache = true

let remover = null

export async function getSegmenter(onProgress) {
  if (remover) return remover

  // Pakai MODNet (Satu-satunya model 100% public tanpa Unauthorized 401)
  remover = await pipeline('image-segmentation', 'Xenova/modnet', {
    progress_callback: (progressData) => {
      if (onProgress && typeof onProgress === 'function') {
        const percent = progressData.progress ? Math.round(progressData.progress) : 0
        const file = progressData.file ? `Memuat ${progressData.file}...` : 'Memuat model AI...'
        
        onProgress({
          status: progressData.status,
          file: file,
          progress: percent
        })
      }
    }
  })

  return remover
}
