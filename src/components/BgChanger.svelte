<!-- src/components/BgChanger.svelte -->
<script>
  import { Palette, Image as ImageIcon, Droplet, Check, Upload } from 'lucide-svelte'
  import { bgType, bgColor, bgImageUrl, transparentCanvas } from '../lib/stores/app.js'

  let showColorModal = false
  let showImageModal = false
  let tempColor = '#ffffff'

  const options = [
    { id: 'transparent', label: 'Transparan', icon: Droplet },
    { id: 'white', label: 'Putih', color: '#ffffff' },
    { id: 'black', label: 'Hitam', color: '#000000' },
    { id: 'color', label: 'Warna', icon: Palette },
    { id: 'image', label: 'Gambar', icon: ImageIcon }
  ]

  function selectOption(id) {
    if (id === 'color') {
      tempColor = $bgColor
      showColorModal = true
    } else if (id === 'image') {
      showImageModal = true
    } else {
      bgType.set(id)
    }
  }

  function confirmColor() {
    bgColor.set(tempColor)
    bgType.set('color')
    showColorModal = false
  }

  function handleImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if ($bgImageUrl) URL.revokeObjectURL($bgImageUrl)
    bgImageUrl.set(url)
    bgType.set('image')
    showImageModal = false
  }
</script>

<div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
  <div class="flex items-center gap-2 mb-3">
    <Palette size={16} class="text-zinc-400" />
    <span class="text-sm font-medium">Ganti Background</span>
  </div>

  <div class="grid grid-cols-5 gap-2">
    {#each options as opt}
      <button
        on:click={() => selectOption(opt.id)}
        class="flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs transition { $bgType === opt.id ? 'border-white bg-white text-black' : 'border-zinc-800 bg-zinc-800/50 text-zinc-300'}"
      >
        {#if opt.icon}
          <svelte:component this={opt.icon} size={18} />
        {:else}
          <div class="w-5 h-5 rounded-full border" style:background={opt.color}></div>
        {/if}
        {opt.label}
      </button>
    {/each}
  </div>
</div>

<!-- Modal Warna -->
{#if showColorModal}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm">
      <h3 class="font-semibold flex items-center gap-2"><Palette size={16}/> Pilih Warna</h3>
      <div class="mt-4 flex gap-3 items-center">
        <input type="color" bind:value={tempColor} class="w-14 h-14 rounded-xl bg-transparent" />
        <input type="text" bind:value={tempColor} class="flex-1 bg-zinc-800 rounded-xl px-3 py-2 text-sm" />
      </div>
      <div class="flex justify-end gap-2 mt-5">
        <button on:click={() => showColorModal = false} class="px-4 py-2 rounded-full bg-zinc-800 text-sm">Batal</button>
        <button on:click={confirmColor} class="px-4 py-2 rounded-full bg-white text-black text-sm flex items-center gap-1"><Check size={16}/> Pakai</button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Gambar -->
{#if showImageModal}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm">
      <h3 class="font-semibold flex items-center gap-2"><ImageIcon size={16}/> Upload Background</h3>
      <label class="mt-4 flex flex-col items-center gap-2 border-2 border-dashed border-zinc-700 rounded-xl p-6 cursor-pointer hover:bg-zinc-800/50">
        <Upload size={20} />
        <span class="text-sm">Pilih gambar</span>
        <input type="file" accept="image/*" class="hidden" on:change={handleImageFile} />
      </label>
      <div class="flex justify-end mt-5">
        <button on:click={() => showImageModal = false} class="px-4 py-2 rounded-full bg-zinc-800 text-sm">Tutup</button>
      </div>
    </div>
  </div>
{/if}