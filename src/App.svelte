<!-- src/App.svelte -->
<script>
  import Uploader from './components/Uploader.svelte'
  import BgChanger from './components/BgChanger.svelte'
  import Exporter from './components/Exporter.svelte'
  import { originalFile, originalUrl, transparentCanvas, isProcessing, modelProgress, bgType, bgColor, bgImageUrl } from './lib/stores/app.js'
  import { removeBackground } from './lib/ai/segmenter.js'
  import { Sparkles, Loader2, X } from 'lucide-svelte'

  let resultCanvasEl

  // Auto proses pas upload
  $: if ($originalUrl && !$transparentCanvas && !$isProcessing) {
    processImage($originalUrl)
  }

  // Render hasil ke canvas utama
  $: if ($transparentCanvas && resultCanvasEl) {
    resultCanvasEl.width = $transparentCanvas.width
    resultCanvasEl.height = $transparentCanvas.height
    const ctx = resultCanvasEl.getContext('2d')
    ctx.clearRect(0,0,resultCanvasEl.width, resultCanvasEl.height)

    // gambar BG sesuai pilihan
    if ($bgType === 'white') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0,0,resultCanvasEl.width, resultCanvasEl.height)
    } else if ($bgType === 'black') {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0,0,resultCanvasEl.width, resultCanvasEl.height)
    } else if ($bgType === 'color') {
      ctx.fillStyle = $bgColor
      ctx.fillRect(0,0,resultCanvasEl.width, resultCanvasEl.height)
    } else if ($bgType === 'image' && $bgImageUrl) {
      const bgImg = new Image()
      bgImg.src = $bgImageUrl
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, resultCanvasEl.width, resultCanvasEl.height)
        ctx.drawImage($transparentCanvas, 0, 0)
      }
      // jangan return dulu, biar bawah tetep draw transparan kalo bg image belum load
    }

    if ($bgType !== 'image') {
      ctx.drawImage($transparentCanvas, 0, 0)
    }
  }

  async function processImage(url) {
    isProcessing.set(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
    try {
      const canvas = await removeBackground(img, (data) => {
        if (data.progress) modelProgress.set({ text: data.file || 'Download model', percent: Math.round(data.progress) })
      })
      transparentCanvas.set(canvas)
    } catch (e) {
      console.error(e)
    } finally {
      isProcessing.set(false)
    }
  }

  function clearAll() {
    if ($originalUrl) URL.revokeObjectURL($originalUrl)
    originalUrl.set(null)
    originalFile.set(null)
    transparentCanvas.set(null)
    bgType.set('transparent')
  }
</script>

<main class="min-h-screen bg-zinc-950 text-zinc-100 p-4">
  <div class="max-w-md mx-auto space-y-4">
    <header class="flex items-center gap-2 py-2">
      <div class="p-2 bg-white text-black rounded-xl"><Sparkles size={18}/></div>
      <h1 class="font-bold">hudz-studio</h1>
    </header>

    <!-- STEP 1: Upload -->
    {#if !$originalUrl}
      <Uploader />
    <!-- STEP 2: File ter-upload + proses -->
    {:else if $isProcessing}
      <div class="rounded-2xl border border-zinc-800 overflow-hidden">
        <img src={$originalUrl} alt="original" class="w-full max-h-80 object-contain bg-zinc-900" />
        <div class="p-4 flex items-center gap-3 bg-zinc-900">
          <Loader2 size={18} class="animate-spin" />
          <span class="text-sm">{$modelProgress.text || 'Hapus background...'} {$modelProgress.percent ? `${$modelProgress.percent}%` : ''}</span>
        </div>
      </div>
    <!-- STEP 3: Background kehapus -->
    {:else if $transparentCanvas}
      <div class="space-y-4">
        <div class="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a_25%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
          <canvas bind:this={resultCanvasEl} class="w-full max-h-[60vh] object-contain"></canvas>
          <button on:click={clearAll} class="absolute top-2 right-2 p-2 bg-black/60 rounded-full"><X size={16}/></button>
        </div>

        <!-- STEP 4: Pilihan background -->
        <BgChanger />

        <!-- STEP 5: Download -->
        <Exporter />
      </div>
    {/if}
  </div>
</main>