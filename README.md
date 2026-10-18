# MindReserve AI prototype

A local-first Enterprise Decision and Capability Copilot. Built for Sunil Mysore Kempegowda's AI Builder Cup concept, with traceability from business objective to evidence, human decision, internal action and reported outcome.

## Run locally

Requires Node.js 22 or newer (Node 24 recommended).

```powershell
cd 'C:\Users\sunil\Desktop\zen\2026\ZenSkillAI\Claude\Desktop\Cognitive\mindreserve-prototype'
npm install
npm start
```

Open http://127.0.0.1:8080. Demo mode runs without credentials or remote AI calls. Local records persist in `data/workspace.json`; back up that file if needed. Live integrations require the installed dependencies. Do not edit it while the server runs.

```powershell
npm test
npm run check
```

## Three-minute demo

1. Overview → **Explore the sample review**. It creates a fictional onboarding proposal with an unsupported 40% improvement claim and excessive automation scope.
2. **Run evidence & reasoning review**. Inspect assumptions, alternatives and exact excerpts from the seeded fictional policies.
3. Answer the four questions in your own words; check the source documents you reviewed; revise the recommendation to a limited pilot with human approval, measurements and rollback conditions.
4. Record an approval rationale and confirm the named owner's disposition. This is explicitly self-attested, not authenticated enterprise approval.
5. Create an **internal task**. It does not call email, Microsoft licensing, project-management or other external systems.
6. Record illustrative measurements (40-minute baseline, 32-minute observation, 20 cases) and clearly label them simulated in the measurement note. Outcomes shows a calculated 20% time difference; this is not verified ROI.
7. Export the JSON decision pack. It includes context, review, reasoning, disposition, relevant source records and audit events.
8. Evidence library: add a `.txt`/`.md` source or paste text. Search by words. Meeting intelligence: load a sample transcript and create an **unconfirmed draft** register.

## Implemented

- Decision context (objective, capability, requirement, owner, recommendation).
- Source text ingestion, SHA-256 fingerprints, lexical retrieval and exact-excerpt validation.
- Four-step reasoning interaction: role inversion, assumption audit, alternatives and evidence review.
- Approval gates enforced server-side; duplicate actions rejected; revisions invalidate previous reasoning and approvals.
- Local persistent repository with atomic writes; optional transaction-backed Firestore adapter.
- Optional Gemini REST adapter using Application Default Credentials. Demo mode is deterministic and visibly labelled.
- Transcript-to-draft register, internal tasks, reported outcomes, activity ledger and JSON export.
- Responsive interface, server-side validation, same-origin mutation checks, CSP and optional workspace access key.

## Configure Gemini later

Copy `.env.example` to `.env`, set `AI_MODE=vertex`, `GOOGLE_CLOUD_PROJECT`, an available `GEMINI_MODEL` and `VERTEX_LOCATION`. Default model is `gemini-2.5-flash`; availability and region access must be checked in your project.

```powershell
gcloud auth application-default login
gcloud services enable aiplatform.googleapis.com --project YOUR_PROJECT_ID
```

Restart the server and run a review. The adapter sends the decision and retrieved source text to Vertex AI, asks for JSON, rejects invented source IDs and non-verbatim quotations, and reports errors instead of silently falling back to demo mode. Allow up to 60 seconds per request. The UI says **configured**, not **verified**, until a successful live request is made.

Google API reference: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference

## Cloud Run preparation (not deployed)

The Dockerfile listens on Cloud Run's `PORT`; uses a non-root Node user; installs locked dependencies; excludes local data and secrets. Local filesystem persistence is unsuitable for Cloud Run. Before cloud deployment, create Firestore in Native mode and select `STORE_MODE=firestore`. The adapter is a single shared workspace document (an intentionally bounded prototype, not a scalable enterprise repository).

Use a dedicated service account with Vertex AI User and Firestore access (`roles/datastore.user`) as appropriate. Inject `APP_ACCESS_KEY` from Secret Manager for a private shared demo; never commit the key. Keep the Cloud Run service authenticated unless you deliberately configure a judge-accessible demonstration. Configure access as a separate reviewed step.

The current Firestore adapter and Gemini adapter have not been verified against a live Google Cloud project. Public competition deployment, IAM, billing and source publication require project configuration first.

## OCI deployment baseline

The included `Dockerfile` produces an OCI-compatible image. Copy `.env.example` to `.env`, set a long random `APP_ACCESS_KEY`, and run `docker compose up -d --build`. The service listens on port 8080 and exposes `/health`; the compose volume preserves local records.

Before onboarding real users, use managed PostgreSQL or Firestore, encrypted backups, TLS, rate limiting, tenant-aware OIDC or SAML authentication, retention and deletion controls, and AI quota alerts. Run the API and browser smoke tests after each deployment.

## Cognitive Reserve product model

The prototype uses a four-layer model: lifetime experience informs a CRIq-informed Reserve Profile; current durable skills are assessed separately; AI-assisted behaviour is recorded as observable evidence; and reported business outcomes provide value evidence. The reserve profile is contextual and is not a clinical, intelligence, hiring or short-term performance score.

Mental-health and wellbeing context is an optional safety layer. It may capture brief self-reported workload, stress, sleep or support needs, but it is not diagnostic, therapeutic or an employee performance score. Any high-risk disclosure requires configured human and local crisis-support pathways; the AI must not present itself as a clinician.

The progressive user journey is level-gated across 25 scenarios: Foundation practice, Level 1 Safe User, Level 2 Independent Practitioner and Level 3 Advanced Practitioner. Users see one scenario at a time, with shuffled options and server-side scoring. A failed level triggers targeted practice rather than a longer questionnaire. The wellbeing item is a safety boundary, not a mental-health diagnosis.

## Architecture and boundaries

The organising chain is `Objective → Capability → Requirement → Evidence → Recommendation → Decision → Action → Outcome`, inspired by the thesis's linked architecture artefacts, governance and measurement. Thesis: https://opus.lib.uts.edu.au/bitstream/10453/133173/2/02whole.pdf (§4.6 and §6.3).

The architecture screen distinguishes implemented, configured and planned services:

| Service | Status |
| --- | --- |
| Cloud Run | Container supplied; deployment pending |
| Gemini on Vertex AI | Adapter supplied; demo mode active by default |
| Firestore | Adapter supplied; local-file mode active by default |
| Vertex AI Search / Agent Search | Planned; current retrieval is lexical |
| Document AI | Planned; only plain text / Markdown supported |
| ADK / Agent Runtime | Planned; current orchestration is sequential application logic |
| BigQuery | Planned; current analytics are calculated locally |
| AlloyDB | Enterprise roadmap |

No cognitive reserve, skill decay, System 2 state or organisational maturity is inferred from interaction counts. Assessment scores and xAPI LRS conformance are not claimed. Document excerpts are not independent verification of truth. Meeting extraction is not meeting approval.

This is a single shared demo workspace, without enterprise user authentication, authoritative approval roles or tenant isolation. The optional shared key limits demo access but does not establish a user's identity. Add proper authentication, role-based authorisation, permission-aware retrieval, connector idempotency, retention and audit controls before operational use. Workspace growth is bounded; the Firestore repository must be normalised into collections for larger workloads.

## Source layout

`server.mjs`: HTTP/API and approval workflow. `src/domain.mjs`: validation and state transitions. `src/ai.mjs`: demo / Gemini adapters. `src/store.mjs`: local / Firestore persistence. `public/`: responsive interface. `tests/`: domain and HTTP workflow checks.


## Local assessment administration

The user assessment is at /assessment.html. The protected local admin view is at /admin.html; enter the default local admin key local-admin, or set ADMIN_ACCESS_KEY before starting the server. The browser never receives the answer key: /api/assessment-schema returns shuffled option IDs and the server validates and scores submitted IDs.

