// src/lib/stores/app.js
import { writable } from 'svelte/store'

export const originalFile = writable(null)
export const originalUrl = writable(null)
export const transparentCanvas = writable(null)
export const isProcessing = writable(false)
export const modelProgress = writable({ status: 'idle', percent: 0, text: '' })
export const bgType = writable('transparent')
export const bgColor = writable('#ffffff')
export const bgImageUrl = writable(null)