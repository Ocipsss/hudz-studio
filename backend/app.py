# backend/app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image
import io
import torch
from transformers import AutoModelForImageSegmentation, AutoProcessor

app = FastAPI(title="hudz-studio API - RMBG-1.4")

# Biar frontend vercel bisa akses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model sekali pas start (biar satset pas request)
model = None
processor = None

@app.on_event("startup")
def load_model():
    global model, processor
    print("Loading briaai/RMBG-1.4...")
    processor = AutoProcessor.from_pretrained("briaai/RMBG-1.4", trust_remote_code=True)
    model = AutoModelForImageSegmentation.from_pretrained("briaai/RMBG-1.4", trust_remote_code=True)
    model.eval()
    if torch.cuda.is_available():
        model.cuda()
    print("Model ready!")

@app.get("/")
def root():
    return {"status": "hudz-studio API ready", "model": "briaai/RMBG-1.4"}

@app.post("/remove")
async def remove_bg(file: UploadFile = File(...)):
    # Baca file upload
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    
    # Proses RMBG-1.4
    inputs = processor(image, return_tensors="pt")
    if torch.cuda.is_available():
        inputs = {k: v.cuda() if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Ambil mask & bikin transparan
    mask = processor.post_process_image_segmentation(outputs, target_sizes=[image.size[::-1]])[0]
    # mask adalah list of dict, ambil yang foreground
    # Untuk RMBG-1.4, output langsung mask alpha
    # Simplifikasi: pake PIL putalpha
    import numpy as np
    # outputs.logits -> ambil prediksi
    # Cara paling gampang: pake rembg style threshold
    # Kita pake mask dari processor
    # Jika mask list kosong, fallback pake alpha dari model
    if isinstance(mask, list) and len(mask) > 0:
        # Ambil mask terbesar (foreground)
        alpha = mask[0]['mask'] if 'mask' in mask[0] else None
    else:
        alpha = None

    # Fallback simpel: pake model output sebagai alpha
    if alpha is None:
        # outputs.logits shape [1,1,H,W]
        pred = torch.sigmoid(outputs.logits).squeeze().cpu().numpy()
        alpha = (pred * 255).astype('uint8')
        alpha_img = Image.fromarray(alpha).resize(image.size)
    else:
        alpha_img = alpha.resize(image.size) if hasattr(alpha, 'resize') else Image.fromarray((np.array(alpha)*255).astype('uint8')).resize(image.size)

    # Bikin RGBA
    image.putalpha(alpha_img)
    
    # Return PNG transparan HD
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png", headers={"Content-Disposition": f"attachment; filename=hdzt-{file.filename}.png"})
