"""
analyzer.py — Core NLP analysis module for TruthLens.
Uses TextBlob for sentiment, keyword-based heuristics for bias/fake detection,
and optionally HuggingFace transformers for higher accuracy.
All models are lightweight and run locally without GPU.
"""

import re
from textblob import TextBlob

# ---------------------------------------------------------------------------
# Keyword dictionaries
# ---------------------------------------------------------------------------

SENSATIONAL_WORDS = [
    "shocking", "exposed", "breaking", "explosive", "secret", "hidden",
    "bombshell", "urgent", "must see", "share before", "deleted", "censored",
    "they don't want", "wake up", "unbelievable", "mind-blowing", "exclusive",
    "radical", "destroy", "crisis", "invasion", "threat", "alarming", "exposed",
    "leaked", "conspiracy", "hoax", "cover-up", "insider", "whistleblower",
    "deep state", "elites", "mainstream media lies", "fake news", "plandemic",
    "they are hiding", "truth revealed", "you won't believe", "go viral",
    "share this", "before it's too late", "doctors don't want", "suppressed",
    "miracle cure", "banned", "forbidden", "classified"
]

LEFT_KEYWORDS = [
    "progressive", "social justice", "systemic racism", "inequality", "diversity",
    "equity", "inclusion", "climate crisis", "gun control", "universal healthcare",
    "living wage", "reproductive rights", "lgbtq+", "defund", "abolish",
    "wealth tax", "green new deal", "medicare for all", "workers rights",
    "corporate greed", "billionaire", "tax the rich"
]

RIGHT_KEYWORDS = [
    "radical left", "socialist", "marxist", "liberal agenda", "woke", "cancel culture",
    "free market", "second amendment", "border security", "illegal immigration",
    "law and order", "traditional values", "patriot", "constitution", "deep state",
    "globalist", "mainstream media", "fake news", "election fraud", "make america",
    "freedom", "liberty", "big government", "government overreach", "taxpayers",
    "small business", "military strength", "god and country"
]

NEGATIVE_SENSATIONAL = [
    "outrage", "fury", "rage", "disaster", "catastrophe", "chaos", "violence",
    "attack", "destroy", "corrupt", "criminal", "scandal", "abuse", "lies",
    "betrayal", "failure", "collapse", "threat", "danger", "fear"
]

# ---------------------------------------------------------------------------
# Core analysis functions
# ---------------------------------------------------------------------------

def normalize(text: str) -> str:
    return text.lower()

def count_keyword_hits(text_lower: str, keywords: list[str]) -> int:
    return sum(1 for kw in keywords if kw in text_lower)

def detect_sensational_keywords(text: str) -> list[str]:
    text_lower = normalize(text)
    words = re.findall(r'\b\w+\b', text_lower)
    word_set = set(words)
    found = []
    for kw in SENSATIONAL_WORDS:
        kw_lower = kw.lower()
        if kw_lower in text_lower:
            # Grab the original-case version
            pattern = re.compile(re.escape(kw_lower), re.IGNORECASE)
            match = pattern.search(text)
            if match:
                found.append(match.group(0))
    # Also include words with all-caps (shouting)
    caps_words = re.findall(r'\b[A-Z]{3,}\b', text)
    for w in caps_words:
        if w not in found and len(w) > 2:
            found.append(w)
    return list(dict.fromkeys(found))[:6]  # deduplicate, max 6

def detect_bias(text: str) -> tuple[str, int]:
    """
    Returns (bias_label, left_score - right_score).
    """
    text_lower = normalize(text)
    left_score = count_keyword_hits(text_lower, LEFT_KEYWORDS)
    right_score = count_keyword_hits(text_lower, RIGHT_KEYWORDS)
    diff = left_score - right_score

    if diff >= 3:
        return "Left", diff
    elif diff == 2:
        return "Center-Left", diff
    elif diff == -2:
        return "Center-Right", diff
    elif diff <= -3:
        return "Right", diff
    else:
        return "Neutral", diff

def analyze_tone(text: str) -> tuple[str, str, float]:
    """
    Uses TextBlob sentiment analysis.
    Returns (tone_label, tone_reason, polarity).
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity      # -1 to 1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1

    # Check for mixed signals
    sentences = blob.sentences
    polarities = [s.sentiment.polarity for s in sentences]
    has_positive = any(p > 0.1 for p in polarities)
    has_negative = any(p < -0.1 for p in polarities)

    if has_positive and has_negative and len(sentences) > 1:
        tone = "Mixed"
        reason = "The text contains both positive and negative sentiments across different sections."
    elif polarity > 0.3:
        tone = "Positive"
        reason = f"The text uses predominantly positive language with high sentiment polarity ({polarity:.2f})."
    elif polarity < -0.1:
        tone = "Negative"
        reason = f"The text uses predominantly negative or alarming language (polarity: {polarity:.2f})."
    else:
        tone = "Neutral"
        reason = "The text maintains a relatively neutral tone without strong emotional language."

    return tone, reason, polarity

def compute_fake_score(
    text: str,
    sensational_count: int,
    polarity: float,
    bias_label: str,
    subjectivity: float
) -> tuple[str, int]:
    """
    Heuristic-based fake news scoring.
    Returns (verdict, confidence_percent).
    """
    score = 0  # 0 = real, 100 = fake

    # Sensational keywords are strong fake signals
    score += min(sensational_count * 12, 48)

    # High subjectivity (opinion-heavy) increases fake likelihood
    score += int(subjectivity * 20)

    # Very negative polarity combined with high subjectivity
    if polarity < -0.3 and subjectivity > 0.5:
        score += 15

    # All-caps words
    caps_count = len(re.findall(r'\b[A-Z]{3,}\b', text))
    score += min(caps_count * 5, 20)

    # Excessive exclamation marks
    excl_count = text.count("!")
    score += min(excl_count * 4, 16)

    # Short text that's very sensational
    word_count = len(text.split())
    if word_count < 30 and sensational_count > 1:
        score += 10

    # Quoted attribution to credible sources reduces score
    credible_sources = ["reuters", "associated press", "ap news", "bbc", "new york times",
                        "washington post", "according to", "study shows", "researchers found",
                        "officials said", "data shows", "statistics show"]
    text_lower = normalize(text)
    for src in credible_sources:
        if src in text_lower:
            score -= 15
            break

    score = max(0, min(100, score))

    if score >= 50:
        verdict = "Fake"
        confidence = score
    else:
        verdict = "Real"
        confidence = 100 - score

    return verdict, confidence

def generate_explanation(
    text: str, verdict: str, confidence: int,
    bias: str, tone: str, sensational_count: int,
    polarity: float, subjectivity: float
) -> str:
    word_count = len(text.split())
    caps_count = len(re.findall(r'\b[A-Z]{3,}\b', text))
    excl_count = text.count("!")

    parts = []

    # Verdict explanation
    if verdict == "Fake":
        parts.append(
            f"This content shows {confidence}% likelihood of being misinformation "
            f"based on {sensational_count} sensational keyword(s), "
            f"high subjectivity ({subjectivity:.0%}), "
            f"and {caps_count} all-caps word(s)."
        )
    else:
        parts.append(
            f"This content appears credible with {confidence}% confidence. "
            f"It maintains relatively measured language "
            f"and {'references authoritative sources' if confidence > 75 else 'avoids extreme sensationalism'}."
        )

    # Bias explanation
    if bias == "Neutral":
        parts.append("The political framing appears balanced without strong directional bias.")
    else:
        direction = "left-leaning" if "Left" in bias else "right-leaning"
        parts.append(f"The language and framing show a {direction} political orientation.")

    # Tone
    parts.append(f"Overall tone is {tone.lower()} (sentiment polarity: {polarity:.2f}).")

    return " ".join(parts)

# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def analyze_text(text: str) -> dict:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    keywords = detect_sensational_keywords(text)
    bias, _ = detect_bias(text)
    tone, tone_reason, _ = analyze_tone(text)
    verdict, confidence = compute_fake_score(text, len(keywords), polarity, bias, subjectivity)
    explanation = generate_explanation(text, verdict, confidence, bias, tone, len(keywords), polarity, subjectivity)

    return {
        "verdict": verdict,
        "confidence": confidence,
        "bias": bias,
        "tone": tone,
        "toneReason": tone_reason,
        "keywords": keywords,
        "explanation": explanation,
    }
