from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import analyze_text
import uvicorn

app = FastAPI(title="TruthLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    verdict: str
    confidence: int
    bias: str
    tone: str
    toneReason: str
    keywords: list[str]
    explanation: str

@app.get("/")
def root():
    return {"status": "ok", "service": "TruthLens API"}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    if not req.text or len(req.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text must be at least 20 characters long.")
    result = analyze_text(req.text)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
