<!-- src/components/CropModal.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte'
  import Cropper from 'cropperjs'
  import 'cropperjs/dist/cropper.css'
  import { Check, X } from 'lucide-svelte'

  export let imageUrl = ''
  export let onCropConfirm = () => {}
  export let onCancel = () => {}

  let imageEl
  let cropper

  onMount(() => {
    if (imageEl) {
      cropper = new Cropper(imageEl, {
        aspectRatio: 1, // Kunci rasio 1:1 (Persegi)
        viewMode: 1,
        autoCropArea: 0.9,
        background: false,
        responsive: true
      })
    }
  })

  onDestroy(() => {
    if (cropper) cropper.destroy()
  })

  function handleConfirm() {
    if (!cropper) return
    // Ambil hasil crop sebagai Blob / File baru
    cropper.getCroppedCanvas({ width: 1024, height: 1024 }).toBlob((blob) => {
      const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' })
      const croppedUrl = URL.createObjectURL(blob)
      onCropConfirm({ file: croppedFile, url: croppedUrl })
    }, 'image/png')
  }
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
  <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-sm w-full space-y-4">
    <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
      <h3 class="font-semibold text-sm">Sesuaikan Foto (1:1)</h3>
      <button on:click={onCancel} class="text-zinc-400 hover:text-white"><X size={18}/></button>
    </div>

    <!-- Container Gambar Cropper -->
    <div class="max-h-[60vh] overflow-hidden rounded-xl bg-zinc-950 flex items-center justify-center">
      <img bind:this={imageEl} src={imageUrl} alt="Crop target" class="max-w-full block" />
    </div>

    <!-- Tombol Aksi -->
    <div class="flex justify-end gap-2 pt-2 border-t border-zinc-800">
      <button on:click={onCancel} class="px-4 py-2 rounded-full bg-zinc-800 text-xs">Batal</button>
      <button on:click={handleConfirm} class="px-4 py-2 rounded-full bg-white text-black font-medium text-xs flex items-center gap-1">
        <Check size={14}/> Potong & Proses
      </button>
    </div>
  </div>
</div>
