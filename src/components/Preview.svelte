<!-- src/components/Preview.svelte -->
<script>
  import { Eye, Loader2, ImageOff } from 'lucide-svelte'
  import { originalUrl, transparentCanvas, isProcessing, modelProgress } from '../lib/stores/app.js'

  let canvasEl

  $: if ($transparentCanvas && canvasEl) {
    canvasEl.width = $transparentCanvas.width
    canvasEl.height = $transparentCanvas.height
    const ctx = canvasEl.getContext('2d')
    ctx.clearRect(0,0,canvasEl.width, canvasEl.height)
    ctx.drawImage($transparentCanvas, 0, 0)
  }
</script>

<div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
  <div class="p-3 flex items-center gap-2 border-b border-zinc-800">
    <Eye size={16} class="text-zinc-400" />
    <span class="text-sm font-medium">Preview HD</span>
    {#if $isProcessing}
      <span class="ml-auto text-xs text-zinc-400">{$modelProgress.text} {$modelProgress.percent ? `${$modelProgress.percent}%` : ''}</span>
    {/if}
  </div>

  <div class="relative aspect-[4/3] bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a_25%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] flex items-center justify-center">
    {#if $isProcessing}
      <div class="flex flex-col items-center gap-3">
        <Loader2 size={28} class="animate-spin text-white" />
        <p class="text-xs text-zinc-400">AI lagi motong background...</p>
      </div>
    {:else if $transparentCanvas}
      <canvas bind:this={canvasEl} class="max-w-full max-h-full object-contain"></canvas>
    {:else if $originalUrl}
      <img src={$originalUrl} alt="original preview" class="max-w-full max-h-full object-contain opacity-50" />
      <p class="absolute bottom-3 text-xs bg-black/60 px-3 py-1 rounded-full">Belum dihapus</p>
    {:else}
      <div class="flex flex-col items-center gap-2 text-zinc-600">
        <ImageOff size={28} />
        <p class="text-xs">Belum ada foto</p>
      </div>
    {/if}
  </div>
</div>