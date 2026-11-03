<!-- src/components/Uploader.svelte -->
<script>
  import { Upload, X, FileImage, AlertTriangle } from 'lucide-svelte'
  import { originalFile, originalUrl, transparentCanvas } from '../lib/stores/app.js'

  let dragOver = false
  let showSizeModal = false
  let pendingFile = null

  function handleFiles(files) {
    const file = files[0]
    if (!file) return

    // Pilihan wajib modal kalo file > 15MB
    if (file.size > 15 * 1024 * 1024) {
      pendingFile = file
      showSizeModal = true
      return
    }
    setFile(file)
  }

  function setFile(file) {
    originalFile.set(file)
    transparentCanvas.set(null)
    if ($originalUrl) URL.revokeObjectURL($originalUrl)
    originalUrl.set(URL.createObjectURL(file))
    showSizeModal = false
  }

  function onDrop(e) {
    e.preventDefault()
    dragOver = false
    handleFiles(e.dataTransfer.files)
  }

  function clear() {
    originalFile.set(null)
    if ($originalUrl) URL.revokeObjectURL($originalUrl)
    originalUrl.set(null)
    transparentCanvas.set(null)
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label="Drop zone upload foto"
  class="border-2 border-dashed rounded-2xl p-6 text-center transition {dragOver ? 'border-white bg-zinc-900' : 'border-zinc-700 bg-zinc-900/50'}"
  on:dragover|preventDefault={() => dragOver = true}
  on:dragleave={() => dragOver = false}
  on:drop={onDrop}
  on:keydown={(e) => { if(e.key === 'Enter') document.querySelector('input[type=file]')?.click() }}
>
  {#if $originalUrl}
    <div class="relative">
      <img src={$originalUrl} alt="original" class="max-h-64 mx-auto rounded-xl" />
      <button on:click={clear} class="absolute -top-2 -right-2 bg-white text-black p-1.5 rounded-full">
        <X size={16} />
      </button>
    </div>
    <p class="mt-3 text-xs text-zinc-400 flex items-center justify-center gap-1">
      <FileImage size={14} /> {$originalFile?.name}
    </p>
  {:else}
    <div class="flex flex-col items-center gap-3">
      <div class="p-3 bg-white text-black rounded-full"><Upload size={22} /></div>
      <p class="font-medium">Drop foto disini</p>
      <p class="text-xs text-zinc-500">JPG, PNG, WebP • max 15MB</p>
      <label class="mt-2 px-4 py-2 bg-zinc-800 rounded-full text-sm cursor-pointer hover:bg-zinc-700">
        Pilih File
        <input type="file" accept="image/*" class="hidden" on:change={(e) => handleFiles(e.target.files)} />
      </label>
    </div>
  {/if}
</div>

<!-- Modal wajib kalo ada pilihan -->
{#if showSizeModal}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full">
      <div class="flex gap-3">
        <div class="p-2 bg-amber-500/20 text-amber-400 rounded-full h-fit"><AlertTriangle size={18} /></div>
        <div>
          <h3 class="font-semibold">File gede banget</h3>
          <p class="text-sm text-zinc-400 mt-1">File {(pendingFile.size/1024/1024).toFixed(1)}MB, bisa lemot di HP. Lanjut?</p>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-5">
        <button on:click={() => showSizeModal = false} class="px-4 py-2 rounded-full bg-zinc-800 text-sm">Batal</button>
        <button on:click={() => setFile(pendingFile)} class="px-4 py-2 rounded-full bg-white text-black text-sm">Lanjut</button>
      </div>
    </div>
  </div>
{/if}