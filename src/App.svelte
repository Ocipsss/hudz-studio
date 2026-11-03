<!-- src/App.svelte -->
<script>
  import Uploader from './components/Uploader.svelte'
  import BgChanger from './components/BgChanger.svelte'
  import Exporter from './components/Exporter.svelte'
  import CropModal from './components/CropModal.svelte'
  import { originalFile, originalUrl, transparentCanvas, isProcessing, modelProgress, bgType, bgColor, bgImageUrl } from './lib/stores/app.js'
  import { removeBackground } from './lib/ai/segmenter.js'
  import { Sparkles, Loader2, X } from 'lucide-svelte'

  let resultCanvasEl
  let rawUploadUrl = null // Menyimpan URL gambar mentah sebelum di-crop
  let showCropModal = false
  let errorMsg = ''

  // Pantau saat ada file mentah baru di-upload di Uploader
  $: if ($originalUrl && !rawUploadUrl && !$transparentCanvas && !$isProcessing) {
    rawUploadUrl = $originalUrl
    showCropModal = true
  }

  function handleCropConfirm({ file, url }) {
    showCropModal = false
    // Update store dengan hasil crop persegi
    originalFile.set(file)
    originalUrl.set(url)
    
    // Jalankan pemrosesan AI setelah disesuaikan
    processImage(url)
  }

  function handleCropCancel() {
    showCropModal = false
    clearAll()
  }

  // Render hasil ke canvas utama
  $: if ($transparentCanvas && resultCanvasEl) {
    requestAnimationFrame(() => {
      resultCanvasEl.width = $transparentCanvas.width
      resultCanvasEl.height = $transparentCanvas.height
      const ctx = resultCanvasEl.getContext('2d')
      ctx.clearRect(0, 0, resultCanvasEl.width, resultCanvasEl.height)

      if ($bgType === 'white') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, resultCanvasEl.width, resultCanvasEl.height)
      } else if ($bgType === 'black') {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, resultCanvasEl.width, resultCanvasEl.height)
      } else if ($bgType === 'color') {
        ctx.fillStyle = $bgColor
        ctx.fillRect(0, 0, resultCanvasEl.width, resultCanvasEl.height)
      } else if ($bgType === 'image' && $bgImageUrl) {
        const bgImg = new Image()
        bgImg.src = $bgImageUrl
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, resultCanvasEl.width, resultCanvasEl.height)
          ctx.drawImage($transparentCanvas, 0, 0)
        }
        return
      }

      if ($bgType !== 'image') {
        ctx.drawImage($transparentCanvas, 0, 0)
      }
    })
  }

  async function processImage(url) {
    isProcessing.set(true)
    modelProgress.set({ text: 'Memuat gambar...', percent: 0 })

    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = url
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = () => rej(new Error('Gagal memuat file gambar.'))
      })

      const canvas = await removeBackground(img, (data) => {
        if (data.file) {
          modelProgress.set({ 
            text: data.file, 
            percent: Math.round(data.progress || 0) 
          })
        }
      })
      transparentCanvas.set(canvas)
    } catch (e) {
      console.error(e)
      errorMsg = e.message || 'Terjadi kesalahan saat memotong background.'
      modelProgress.set({ text: 'Error: ' + errorMsg, percent: 0 })
    } finally {
      isProcessing.set(false)
    }
  }

  function clearAll() {
    if ($originalUrl) URL.revokeObjectURL($originalUrl)
    if (rawUploadUrl && rawUploadUrl !== $originalUrl) URL.revokeObjectURL(rawUploadUrl)
    originalUrl.set(null)
    originalFile.set(null)
    transparentCanvas.set(null)
    bgType.set('transparent')
    rawUploadUrl = null
    showCropModal = false
    errorMsg = ''
  }
</script>

<main class="min-h-screen bg-zinc-950 text-zinc-100 p-4">
  <div class="max-w-md mx-auto space-y-4">
    <header class="flex items-center justify-between py-2">
      <div class="flex items-center gap-2">
        <div class="p-2 bg-white text-black rounded-xl"><Sparkles size={18}/></div>
        <h1 class="font-bold">hudz-studio</h1>
      </div>
      {#if $originalUrl}
        <button on:click={clearAll} class="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition">
          <X size={16}/>
        </button>
      {/if}
    </header>

    <!-- Modal Crop (Muncul setelah pilih file) -->
    {#if showCropModal && rawUploadUrl}
      <CropModal 
        imageUrl={rawUploadUrl} 
        onCropConfirm={handleCropConfirm} 
        onCancel={handleCropCancel} 
      />
    {/if}

    <!-- STEP 1: Upload -->
    {#if !$originalUrl && !showCropModal}
      <Uploader />

    <!-- STEP 2: File ter-upload + proses loading -->
    {:else if $isProcessing}
      <div class="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900">
        <img src={$originalUrl} alt="original" class="w-full max-h-80 object-contain bg-zinc-950/50" />
        <div class="p-4 flex items-center gap-3 bg-zinc-900">
          <Loader2 size={18} class="animate-spin text-white" />
          <span class="text-sm">
            {$modelProgress.text || 'Memproses AI...'} 
            {$modelProgress.percent ? `${$modelProgress.percent}%` : ''}
          </span>
        </div>
      </div>

    <!-- STEP 3: Tampilan Error jika gagal -->
    {:else if errorMsg}
      <div class="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-sm text-red-200 space-y-2">
        <p class="font-medium">Gagal Memproses Gambar</p>
        <p class="text-xs text-red-300">{errorMsg}</p>
        <button on:click={clearAll} class="px-4 py-1.5 bg-red-900 hover:bg-red-800 text-xs text-white rounded-full transition">
          Coba File Lain
        </button>
      </div>

    <!-- STEP 4: Background berhasil dihapus -->
    {:else if $transparentCanvas}
      <div class="space-y-4">
        <div class="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a_25%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
          <canvas bind:this={resultCanvasEl} class="w-full max-h-[60vh] object-contain"></canvas>
        </div>

        <!-- STEP 5: Pilihan background -->
        <BgChanger />

        <!-- STEP 6: Download -->
        <Exporter />
      </div>
    {/if}
  </div>
</main>
