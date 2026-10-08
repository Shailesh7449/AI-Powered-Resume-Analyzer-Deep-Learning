# AI-Powered Resume Analyzer (Deep Learning & Explainable ATS)

An intelligent, explainable ATS resume evaluation and career guidance platform powered by **PyTorch**, **Hugging Face Sentence Transformers (`all-MiniLM-L6-v2`)**, **FastAPI**, **React (Vite)**, and the **Gemini API**.

---

## Deployment Architecture

Due to PyTorch's native deep-learning dependencies and Sentence Transformer model weights (~2.5 GB total runtime environment), the Python ML service exceeds Vercel's 500 MB serverless function limit.

The application uses a decoupled production architecture:

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Deployment                    │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │           React / Vite SPA Frontend            │   │
│   │           (Static Global Edge CDN)             │   │
│   └──────────────────────┬─────────────────────────┘   │
└──────────────────────────┼─────────────────────────────┘
                           │
                           │ HTTPS requests using VITE_ML_API_URL
                           │ (/api/analyze, /api/ml-health, /api/parse-resume, ...)
                           ▼
┌────────────────────────────────────────────────────────┐
│     Separate Python Hosting (Render / Railway / GCP)   │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │            FastAPI ML Microservice             │   │
│   │                   (ml-service/)                │   │
│   └──────────────────────┬─────────────────────────┘   │
│                          │                             │
│       ┌──────────────────┴──────────────────┐          │
│       ▼                                     ▼          │
│  ┌───────────────────────────┐  ┌────────────────────┐ │
│  │   PyTorch & Transformers  │  │  Gemini Assistant  │ │
│  │     (all-MiniLM-L6-v2)    │  │ (Server-side API)  │ │
│  │ 384-Dim Dense Embeddings  │  │   Chat & Rewriter  │ │
│  │     Cosine Similarity     │  └────────────────────┘ │
│  │   Explainable ATS Scorer  │                         │
│  └───────────────────────────┘                         │
└────────────────────────────────────────────────────────┘
```

---

## Communication Flow

1. **User interaction:** The user opens the React SPA hosted on Vercel.
2. **Configurable Base URL:** The frontend reads `import.meta.env.VITE_ML_API_URL` to determine the endpoint destination:
   - **Production (Vercel):** `VITE_ML_API_URL=https://<your-python-service>.onrender.com`
   - **Local Development:** `VITE_ML_API_URL=http://localhost:5001` (or empty to use Vite's built-in dev proxy).
3. **Cross-Origin (CORS):** The FastAPI service in `ml-service/` is configured with open CORS middleware (`allow_origins=["*"]`) to handle cross-origin browser requests seamlessly.
4. **Secret Safety:** The `GEMINI_API_KEY` is configured **only** in the Python FastAPI environment variables. It is never shipped or exposed in the frontend client bundle.

---

## Deployment Steps

### Step 1: Deploy the Python ML Service (`ml-service/`)
Host the `ml-service` directory on a platform that supports Docker or persistent Python runtimes (e.g., [Render](https://render.com), [Railway](https://railway.app), [Google Cloud Run](https://cloud.google.com/run), or [Hugging Face Spaces]):

* **Root directory:** `ml-service`
* **Build command:** `pip install -r requirements.txt`
* **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
* **Environment variables:**
  * `GEMINI_API_KEY`: Your Google Gemini API key (optional, for AI assistant & section editor).

Once deployed, copy your service's live URL (e.g., `https://resume-ai-ml.onrender.com`).

---

### Step 2: Deploy the Frontend on Vercel
Deploy the root repository to [Vercel](https://vercel.com):

* **Framework Preset:** Vite
* **Root Directory:** `./`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Environment Variables:**
  * `VITE_ML_API_URL`: Paste the live URL of your Python service from Step 1 (e.g., `https://resume-ai-ml.onrender.com`).

---

## Local Development

1. **Start the Python ML service:**
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python3 -m uvicorn main:app --host 0.0.0.0 --port 5001
   ```

2. **Start the Vite frontend:**
   ```bash
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`. Vite automatically proxies `/api/*` calls to `http://localhost:5001`.
