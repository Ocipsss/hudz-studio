// src/lib/ai/model-loader.js
import { pipeline, env } from '@huggingface/transformers'

env.allowRemoteModels = true
env.useBrowserCache = true

let remover = null

export async function getSegmenter(onProgress) {
  if (remover) return remover
  // FIX: pake background-removal bukan image-segmentation
  remover = await pipeline('background-removal', 'briaai/RMBG-1.4', {
    progress_callback: onProgress
  })
  return remover
}