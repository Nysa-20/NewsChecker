# TruthLens — AI Fake News & Bias Detector

A production-ready hackathon project that uses NLP to analyze news for misinformation, political bias, and tone.

## Project Structure

```
truthlens/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── analyzer.py      # NLP analysis logic (TextBlob + heuristics)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React application
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Quick Start

### 1. Start the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
python -m textblob.download_corpora   # Download TextBlob data

python main.py
# Backend runs at http://localhost:8000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

### 3. Open the app

Navigate to **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Endpoint   | Description              |
|--------|-----------|--------------------------|
| GET    | `/`       | Health check             |
| POST   | `/analyze` | Analyze news text        |

### POST /analyze

**Request:**
```json
{ "text": "Your news article text here..." }
```

**Response:**
```json
{
  "verdict": "Fake",
  "confidence": 78,
  "bias": "Right",
  "tone": "Negative",
  "toneReason": "The text uses predominantly negative or alarming language.",
  "keywords": ["SHOCKING", "exposed", "radical"],
  "explanation": "This content shows 78% likelihood of being misinformation..."
}
```

---

## How the Analysis Works

### Fake News Detection
Heuristic scoring based on:
- **Sensational keywords** (shocking, exposed, BREAKING, etc.) — +12 pts each
- **All-caps words** — +5 pts each  
- **Exclamation marks** — +4 pts each
- **High subjectivity** (TextBlob) — up to +20 pts
- **Credible source citations** — -15 pts (Reuters, AP, BBC, etc.)

### Political Bias Detection
Keyword matching against curated lists:
- **Left indicators**: progressive, social justice, climate crisis, reproductive rights, etc.
- **Right indicators**: radical left, socialist, border security, traditional values, etc.

### Tone Analysis
TextBlob sentiment analysis:
- Polarity > 0.3 → Positive
- Polarity < -0.1 → Negative
- Mixed signals across sentences → Mixed
- Otherwise → Neutral

### Keyword Flagging
Regex matching against 30+ sensational/manipulative words commonly found in misinformation.

---

## Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React 18 + Vite        |
| Styling   | CSS Variables + Tailwind |
| Backend   | FastAPI + Python 3.11+ |
| NLP       | TextBlob               |
| Analysis  | Custom heuristics      |

---

## Optional: Upgrade to HuggingFace Models

For higher accuracy, replace `analyzer.py` functions with:

```python
from transformers import pipeline

# Fake news detection
fake_detector = pipeline("text-classification", 
  model="hamzab/roberta-fake-news-classification")

# Sentiment/tone
sentiment = pipeline("sentiment-analysis",
  model="cardiffnlp/twitter-roberta-base-sentiment")

# Zero-shot bias classification  
classifier = pipeline("zero-shot-classification",
  model="facebook/bart-large-mnli")
bias_result = classifier(text, ["left-wing", "right-wing", "neutral"])
```

Add to requirements.txt:
```
transformers==4.41.0
torch==2.3.0
```

Note: HuggingFace models require ~2GB disk and 4GB RAM. First run downloads models automatically.

---

## Hackathon Notes

- **Zero training required** — all models are pretrained
- **Runs locally** — no cloud API needed
- **Fast startup** — TextBlob loads in <1 second
- **Demo-ready** — 3 example inputs built in
