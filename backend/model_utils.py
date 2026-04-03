from transformers import pipeline
from textblob import TextBlob
import re

# Load a lightweight fake news classification model
# Note: On first run, this downloads ~500MB
pipe = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-fake-news-detection")

def analyze_text(text: str):
    # 1. Fake vs Real Prediction
    result = pipe(text[:512])[0] # BERT limit is 512 tokens
    label = "REAL" if result['label'] == 'LABEL_1' else "FAKE"
    confidence = round(result['score'] * 100, 2)

    # 2. Tone Analysis (Sentiment)
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.1: tone = "Positive"
    elif polarity < -0.1: tone = "Negative"
    else: tone = "Neutral"

    # 3. Bias Detection (Heuristic-based for speed)
    left_keywords = ['systemic', 'equity', 'progressive', 'injustice', 'healthcare for all']
    right_keywords = ['sovereignty', 'traditional', 'liberty', 'tax cuts', 'radical']
    
    left_score = sum(1 for w in left_keywords if w in text.lower())
    right_score = sum(1 for w in right_keywords if w in text.lower())
    
    if left_score > right_score: bias = "Leans Left"
    elif right_score > left_score: bias = "Leans Right"
    else: bias = "Neutral / Centrist"

    # 4. Keyword Extraction (Sensationalism)
    sensational_words = ["shocking", "exposed", "breaking", "disaster", "unbelievable", "conspiracy"]
    found_keywords = [w for w in sensational_words if w in text.lower()]

    return {
        "prediction": label,
        "confidence": confidence,
        "bias": bias,
        "tone": tone,
        "keywords": found_keywords,
        "reasoning": f"Analysis based on linguistic patterns and {tone.lower()} sentiment indicators."
    }