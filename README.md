# Artist Intelligence & Recommendation System (AIRS)

> A deterministic, evidence-grounded decision intelligence engine that evaluates creative talent (photographers, musicians, video editors) and pairs them with unstructured hirer briefs using verified multimodal portfolio evidence.

---

## 1. Project Overview & Problem Statement

Evaluating freelance creative talent from raw portfolio assets and conversational hiring briefs is fundamentally prone to cognitive bias, ungrounded claims, and communication mismatch.

**AIRS** solves this by enforcing strict **epistemic discipline**:
- Distinguishes **verified multimodal portfolio evidence** (`DEMONSTRATED_EVIDENCE`) from **self-reported claims** (`CLAIM`), **operational assumptions** (`ASSUMPTION`), and **explicit unknowns** (`UNKNOWN`).
- Generates transparent, explainable **Top 2 recommendations** per brief with exact media citations (file names, timestamps, frame observations).
- Generates **comparative trade-off analyses** and **at most 2 high-impact refinement questions**.
- Handles follow-up requirement changes with transparent **before/after re-ranking**.

---

## 2. Dataset Overview & Verified Anomalies

- **Total Files Scanned:** 149 files across 15 artist profiles and 4 hirer conversation records.
- **Artists:** 15 total (5 Photographers, 5 Musicians, 5 Video Editors).
- **Media Files Scanned:** 120 files (Images: JPG/PNG/WebP, Audio: MP3/WAV, Video: MP4).
- **Hirer Briefs:** 4 initial briefs (`01_cafe_music_whatsapp`, `02_skincare_photography_chat`, `03_vertical_video_email`, `04_leadership_event_photos`) + 1 follow-up update (`01_cafe_music_update`).
- **Preserved Anomalies (7 Documented):**
  - Letter-O vs Number-0 identifier typos (`PO4`, `PO5`, `VO4`, `VO5` preserved as raw folder names and mapped canonical internally).
  - Multi-artist identity splits (e.g. `V03` folder contains Rahul Gupta resume and Tara D'Souza video portfolio).
  - Raw dataset remains **100% immutable and intact** in `data/raw/Data set/`.

---

## 3. Repository Architecture

```text
artist-intelligence-recommendation-system/
├── data/
│   ├── raw/Data set/              # 149 original dataset files (IMMUTABLE)
│   └── processed/                 # Generated and verified JSON/JSONL artifacts
│       ├── dataset_inventory.json
│       ├── artist_intelligence.jsonl
│       ├── media_selection_log.json
│       ├── hirer_intelligence.json
│       ├── recommendations.json
│       └── updated_recommendation.json
├── src/
│   ├── models/                    # Pydantic v2 domain schemas & artifact contracts
│   ├── ingestion/                 # Safe dataset scanner & file loaders
│   ├── processing/                # docx profile & txt conversation extractors
│   ├── framework/                 # Category capability dimensions & media selection
│   ├── intelligence/              # Artist & Hirer intelligence pipelines
│   ├── matching/                  # Scorer, Trade-off analyzer, Ranker, Re-ranker
│   ├── api/                       # FastAPI REST backend application & data service
│   └── utils/                     # File utilities & custom error formatting
├── frontend/                      # Evaluator Next.js 14 console (TypeScript, Tailwind)
│   ├── app/                       # App Router pages (Dashboard, Artists, Hirers, Recs, Reranking)
│   ├── components/                # Modular UI & decision intelligence components
│   ├── lib/                       # Typed API client with cold-start retry
│   └── tests/                     # Jest component and client test suite
├── scripts/
│   └── verify_all.py              # Master end-to-end verification script
├── tests/                         # Comprehensive Pytest suite (60 tests passing)
├── decision_note.md               # Technical decision note (Mandatory Assessment Deliverable)
├── README.md                      # Project documentation (Mandatory Assessment Deliverable)
├── AI_USAGE.md                    # Transparent AI usage disclosure (Mandatory Assessment Deliverable)
├── .env.example                   # Backend environment configuration template
└── pytest.ini                     # Pytest configuration
```

---

## 4. Mandatory Deliverables vs Optional UI Product Layer

| Deliverable | Purpose | Mandatory / Optional |
|---|---|---|
| [`data/processed/artist_intelligence.jsonl`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/data/processed/artist_intelligence.jsonl) | 15 structured artist dossiers with claims vs evidence | **Mandatory** |
| [`data/processed/recommendations.json`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/data/processed/recommendations.json) | Top 2 recommendations, fit reasons, citations, max 2 questions | **Mandatory** |
| [`data/processed/updated_recommendation.json`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/data/processed/updated_recommendation.json) | Follow-up re-ranking for cafe music launch night | **Mandatory** |
| [`decision_note.md`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/decision_note.md) | Technical rationale, trade-offs, and scoring methodology | **Mandatory** |
| [`README.md`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/README.md) | Reproduction guide and system documentation | **Mandatory** |
| [`AI_USAGE.md`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/AI_USAGE.md) | Transparent AI tooling usage disclosure | **Mandatory** |
| [`src/api/`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/src/api/) (FastAPI Backend) | REST API exposing artifacts cleanly | *Extension Layer* |
| [`frontend/`](file:///c:/Users/HP/OneDrive/Documents/Desktop/artist-intelligence-recommendation-system/frontend/) (Next.js Console) | Interactive dark intelligence console UI | *Extension Layer* |

---

## 5. Quick Start & Reproduction Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm (for frontend console)

### Step 1: Environment Setup
```bash
# Clone the repository and enter directory
cd artist-intelligence-recommendation-system

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install fastapi uvicorn pydantic python-docx pytest anyio httpx
```

### Step 2: Run Master Verification Script
Validate the entire pipeline, all 6 processed artifacts, citations, and compliance in one command:
```bash
python scripts/verify_all.py
```

### Step 3: Run Backend Tests (60 Tests)
```bash
pytest -v
```

### Step 4: Run Backend FastAPI Server
```bash
uvicorn src.api.main:app --reload --port 8000
```
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Step 5: (Optional) Run Frontend Console
```bash
cd frontend
npm install
npm test
npm run dev
```
Open `http://localhost:3000` to interact with the visual intelligence console.

---

## 6. Core Methodology & Epistemic Discipline

### Epistemic State Isolation
1. **`DEMONSTRATED_EVIDENCE`:** Verified from raw audio/image/video files with timestamp/frame citations.
2. **`CLAIM`:** Profile statements capped at 40% capability weight.
3. **`ASSUMPTION`:** Explicit operational working hypotheses with rationale.
4. **`UNKNOWN`:** Unstated information. **Strict Neutrality:** $0\text{ pts}$ added, $0\text{ pts}$ deducted (never penalized).

### Transparent Scoring Breakdown (0–100 Scale)
$$\text{Total Score} = \text{Requirement Fit (0–50)} + \text{Evidence Strength (0–30)} + \text{Constraint Compatibility (0–20)} - \text{Conflict Penalty (0–40)}$$
- **Requirement Fit (0–50 pts):** Base allocation per requirement ($\frac{50.0}{N_{\text{req}}}$) scaled by importance ($W_{\text{CRITICAL}} = 1.2$, $W_{\text{STD}} = 1.0$, $W_{\text{LOW}} = 0.8$) and demonstration level ($S_{\text{STRONG}} = 1.0$, $S_{\text{MOD}} = 0.8$, $S_{\text{LIM}} = 0.6$, $S_{\text{CLAIM}} = 0.4$, $S_{\text{UNKNOWN}} = 0.0$).
- **Evidence Strength (0–30 pts):** Empirical bonus per verified media requirement ($+6\text{ pts}$ STRONG, $+4\text{ pts}$ MODERATE, $+2\text{ pts}$ LIMITED, $+1\text{ pt}$ CLAIM, $+0\text{ pts}$ UNKNOWN), capped at 30.
- **Constraint Compatibility (0–20 pts):** Baseline 20.0 pts for category and format compatibility.
- **Conflict Penalties (0–40 pts):** Dedicated penalties for direct hard constraint or operational clashes.

---

## 7. Recommendation Summary

| Brief | Hirer | Category | Rank 1 Candidate | Rank 2 Candidate | Refinement Questions |
|---|---|---|---|---|---|
| `01_cafe_music_whatsapp` | Rhea | `musician` | **M01** (Meera & Arjun) — `HIGH` | **M03** (Raghav Sen) — `HIGH` | (1) Venue PA setup; (2) Hindi vs English split |
| `02_skincare_photography_chat` | Nidhi | `photographer` | **P02** (Kabir Mehta) — `HIGH` | **PO5** (Frames) — `HIGH` | (1) Studio delivery vs on-site; (2) Hand models |
| `03_vertical_video_email` | Manu K. | `video_editor` | **V01** (Nisha Kapoor) — `HIGH` | **V03** (Tara D'Souza) — `HIGH` | (1) Music licensing; (2) Dialogue timecodes |
| `04_leadership_event_photos` | Shalini | `photographer` | **P01** (Aanya Rao) — `HIGH` | **PO5** (Frames) — `MEDIUM` | (1) On-camera flash rules; (2) Budget ceiling |

### Follow-Up Re-Ranking (`01_cafe_music_update`)
- **Scope Shift:** 3-hr ambient background ($\approx ₹8\text{k}$) $\rightarrow$ 45-min launch night headline showcase set ($₹15,000$).
- **Result:** `M01` maintained **Rank 1** with increased score ($92.0 \rightarrow 96.0$) due to demonstrated energetic acoustic medley rehearsals. `M03` held **Rank 2** ($81.0 \rightarrow 74.0$) as an acoustic fallback due to slow-tempo folk repertoire mismatch.
