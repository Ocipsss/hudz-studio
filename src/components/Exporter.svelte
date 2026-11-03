<!-- src/components/Exporter.svelte -->
<script>
  import { Download, Image as ImageIcon, Layers, Check } from 'lucide-svelte'
  import { transparentCanvas, bgType, bgColor, bgImageUrl, originalFile } from '../lib/stores/app.js'

  let showDownloadModal = false
  let compositeCanvas

  function getCompositeCanvas() {
    if (!$transparentCanvas) return null
    const w = $transparentCanvas.width
    const h = $transparentCanvas.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // BG
    if ($bgType === 'white') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0,0,w,h)
    } else if ($bgType === 'black') {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0,0,w,h)
    } else if ($bgType === 'color') {
      ctx.fillStyle = $bgColor
      ctx.fillRect(0,0,w,h)
    } else if ($bgType === 'image' && compositeCanvas) {
      // untuk image BG, kita draw dari img element
    }

    ctx.drawImage($transparentCanvas, 0, 0)
    return canvas
  }

  function downloadTransparent() {
    if (!$transparentCanvas) return
    $transparentCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hudz-${Date.now()}-transparent.png`
      a.click()
      URL.revokeObjectURL(url)
      showDownloadModal = false
    }, 'image/png')
  }

  function downloadWithBg() {
    const canvas = document.createElement('canvas')
    const w = $transparentCanvas.width
    const h = $transparentCanvas.height
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    if ($bgType === 'white') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0,0,w,h)
    } else if ($bgType === 'black') {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0,0,w,h)
    } else if ($bgType === 'color') {
      ctx.fillStyle = $bgColor
      ctx.fillRect(0,0,w,h)
    } else if ($bgType === 'image' && $bgImageUrl) {
      const img = new Image()
      img.src = $bgImageUrl
      // sync draw gak ideal, tapi buat MVP kita draw cover
      ctx.drawImage(img, 0, 0, w, h)
    }

    ctx.drawImage($transparentCanvas, 0, 0)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hudz-${Date.now()}-with-bg.png`
      a.click()
      URL.revokeObjectURL(url)
      showDownloadModal = false
    }, 'image/png')
  }
</script>

<div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
  <button
    on:click={() => showDownloadModal = true}
    disabled={!$transparentCanvas}
    class="w-full py-3 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <Download size={18} /> Download HD
  </button>
  <p class="text-[11px] text-zinc-500 text-center mt-2">PNG transparan HD • resolusi asli</p>
</div>

<!-- Modal Pilihan Download Wajib -->
{#if showDownloadModal}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm">
      <h3 class="font-semibold flex items-center gap-2"><Layers size={16}/> Pilih Versi Download</h3>
      
      <div class="mt-4 space-y-2">
        <button on:click={downloadTransparent} class="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white text-black rounded-lg"><ImageIcon size={16}/></div>
            <div>
              <p class="text-sm font-medium">Transparan HD</p>
              <p class="text-xs text-zinc-400">Buat sticker / edit lanjut</p>
            </div>
          </div>
          <Check size={16} class="text-zinc-500" />
        </button>

        <button on:click={downloadWithBg} class="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-zinc-700 text-white rounded-lg"><Layers size={16}/></div>
            <div>
              <p class="text-sm font-medium">Dengan Background</p>
              <p class="text-xs text-zinc-400">Sesuai pilihan di BgChanger</p>
            </div>
          </div>
          <Check size={16} class="text-zinc-500" />
        </button>
      </div>

      <button on:click={() => showDownloadModal = false} class="w-full mt-4 py-2 rounded-full bg-zinc-800 text-sm">Tutup</button>
    </div>
  </div>
{/if}