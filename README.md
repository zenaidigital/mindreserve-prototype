# MindReserve AI — Enterprise AI-Readiness and Value-Realisation Platform

**Track:** Future of Work & Enterprise Productivity — Google Cloud AI Builder Cup 2026  
**Team:** MindReserve Labs  
**Team Leader:** Sunil Mysore Kempegowda  
**Team Member:** Bryan Chelliah

**Tagline:** Make AI improve human judgement, not replace it.

A governed Enterprise Decision and Capability Copilot with traceability from business objective to evidence, human decision, internal action and reported outcome.

## Competition Deployment

The competition prototype is deployed on Google Cloud Run as a bounded evaluation environment.

**Region:** `australia-southeast1` — Sydney, Australia

- **User portal:** https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/
- **Assessment:** https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/assessment.html
- **Administrator dashboard:** https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/admin.html
- **Business reserve workflow:** https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/reserve.html
- **Demo video:** https://www.youtube.com/watch?v=_PmVYKsoem0
- **Product specification:** [SPEC.md](SPEC.md)

Reviewer credentials are provided through the official competition portal. Passwords are not published in this repository.

## Origin and Research

MindReserve AI emerged from discussions with peers and observations of how people use digital tools in everyday work. Many people accept AI-generated answers without questioning the evidence, assumptions or consequences.

This observation led to further research into human judgement, AI readiness, evidence verification and accountable decision-making. The prototype is the first practical outcome of that research, which also informs a forthcoming book on Enterprise Architecture, AI and human-centred digital transformation.

The project is designed to help people use AI more thoughtfully: framing better questions, checking evidence, understanding uncertainty and retaining ownership of consequential decisions.

## Overview

AI can increase output volume before it improves reasoning quality. Leaders need visibility into whether people can:

- Frame useful business problems
- Formulate relevant questions
- Select and evaluate evidence
- Verify AI-generated outputs
- Recognise uncertainty and limitations
- Keep human accountability visible
- Approve actions with explicit rationale
- Measure whether outcomes improved

MindReserve AI provides a governed loop:

**Assess → Practise → Use AI → Challenge Evidence → Approve → Measure Outcomes**

The platform combines AI-readiness assessment, evidence-aware decision workflows, human review and measurable outcomes.

## The Problem

AI adoption often focuses on output speed rather than decision quality. Organisations need to know whether people can use AI responsibly while preserving evidence, accountability and human judgement.

MindReserve AI provides a structured capability baseline and a traceable decision workflow.

## Current Prototype Capabilities

- Personal AI-readiness assessment
- Individual user results and assessment history
- Firebase email/password authentication
- Firestore-backed application state
- Evidence-aware decision workflow
- Human review and approval points
- Protected administrator dashboard
- Business reserve workflow
- Cloud Run deployment
- Rule-based demonstration mode
- Gemini on Vertex AI integration adapter
- JSON decision-pack export
- Activity and audit ledger
- Server-side validation
- Content Security Policy and same-origin mutation checks

## Assessment access

Assessment URL:

https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/assessment.html

Users can complete the assessment without signing in. Their result is displayed immediately after submission. They may then create an account to track this result and future assessment history. Account creation is optional.

## Google Cloud Architecture

### Implemented and deployed

- **Cloud Run** — web application and API deployment
- **Cloud Build** — container build and deployment automation
- **Artifact Registry** — versioned container images
- **Firestore** — assessment results, decision records and application state
- **Firebase Authentication / Identity Toolkit** — email/password authentication
- **Secret Manager** — protected runtime secrets and configuration
- **IAM and service accounts** — controlled access to Google Cloud resources
- **Cloud Logging** — runtime diagnostics

### Gemini integration

Gemini was used during research and development to shape assessment content, scenario design, Socratic questions, feedback language, governance framing and enterprise architecture.

The application includes a Gemini on Vertex AI adapter targeting:

```text
gemini-2.5-flash
```

The adapter sends the decision and retrieved source text to Vertex AI, requests structured JSON, rejects invented source identifiers and rejects non-verbatim quotations. Errors are reported rather than silently falling back to demo mode.

A successful live request must be completed before claiming that the Vertex AI connection has been verified.

### Enterprise extension architecture

- **Vertex AI Search / Agent Search** — target enterprise retrieval and access-aware grounding
- **Document AI** — target policy and SOP extraction
- **Vertex AI Agent Engine and Agent Development Kit** — target bounded workflows with human approval gates
- **BigQuery** — target anonymised assessment and outcome analytics
- **xAPI-compatible events** — target capability and learning telemetry
- **OpenTelemetry** — target distributed workflow observability
- **AlloyDB or managed PostgreSQL** — potential enterprise record-store extension

The current prototype implements local lexical search, plain-text and Markdown processing, Firestore persistence, deterministic reasoning and a traceable decision workflow.

## Validation Roadmap

The next research phase will proceed progressively:

1. Create role-based virtual agents representing defined work personas.
2. Generate synthetic scenarios and datasets for controlled testing.
3. Validate the assessment and decision workflows against those scenarios.
4. Conduct a supervised pilot with real users and establish baseline measures.
5. Compare capability development, evidence coverage, rework, approval time and decision quality.
6. With explicit consent and privacy safeguards, analyse anonymised usage patterns to identify where users may need support when working with AI.

Future machine-learning analysis will use data minimisation, purpose limitation, transparency, access controls and retention/deletion controls. The system supports human judgement and does not make employment, clinical or other high-impact decisions about individuals.\r\n\r\n## Governed Decision Workflow

The decision workspace connects:

```text
Business objective
        ↓
Capability and requirement
        ↓
Evidence and source excerpts
        ↓
AI-assisted recommendation
        ↓
Human challenge and reflection
        ↓
Approval or rejection
        ↓
Internal action
        ↓
Reported outcome
```

The workflow keeps human judgement, evidence provenance and outcome measurement visible.

## Assessment Model

The assessment covers capability areas including:

- Problem framing
- Question formulation
- Evidence evaluation
- Accountability
- Systems thinking
- Learning agility
- Collaboration
- Safe and responsible AI use

Assessment results are capability-development feedback. They are not:

- Clinical assessments
- Mental-health diagnoses
- Intelligence tests
- Personality assessments
- Employment decisions

The progressive user journey includes:

- Foundation practice
- Level 1 — Safe user
- Level 2 — Independent practitioner
- Level 3 — Advanced practitioner

Users see one scenario at a time, with shuffled options and server-side scoring. Weak results trigger targeted practice rather than a longer questionnaire.

## Cognitive Reserve Product Boundary

The Cognitive Reserve model treats lifetime experience, current durable skills, observable AI-assisted behaviour and reported business outcomes as separate evidence layers.

The reserve profile is contextual. It is not:

- A clinical score
- An intelligence score
- A hiring score
- A personality score
- A short-term performance score

Mental-health and wellbeing context is an optional safety layer. It is not diagnostic or therapeutic. The AI must not present itself as a clinician.

## Evidence and Meeting Intelligence

The Evidence Library supports:

- Plain-text and Markdown source ingestion
- SHA-256 fingerprints
- Lexical retrieval
- Exact-excerpt validation
- Source ownership and version metadata

Meeting Intelligence supports:

- Transcript input
- Draft decision extraction
- Proposed actions
- Open questions
- Participant confirmation status

Meeting extraction is an unconfirmed draft and does not automatically approve or execute any action.

## Development and Local Testing

Requires Node.js 22 or newer. Node.js 24 is recommended.

Clone the repository:

```bash
git clone https://github.com/zenaidigital/mindreserve-prototype.git
cd mindreserve-prototype
npm install
```

Start the local server:

```bash
npm start
```

Open:

```text
http://127.0.0.1:8080
```

The local demo mode runs without external AI credentials.

Run checks with:

```bash
npm test
npm run check
```

The local environment is for development and testing. The `run.app` URLs above are the deployed competition environment.

## Configure Gemini Locally

Copy the example configuration:

```bash
cp .env.example .env
```

Set:

```text
AI_MODE=vertex
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GEMINI_MODEL=gemini-2.5-flash
VERTEX_LOCATION=global
```

Authenticate with Application Default Credentials:

```bash
gcloud auth application-default login
gcloud services enable aiplatform.googleapis.com --project YOUR_PROJECT_ID
```

Restart the server and run a decision review.

The adapter sends the decision and retrieved source text to Vertex AI, requests structured JSON, rejects invented source identifiers and rejects non-verbatim quotations. Errors are reported rather than silently falling back to demo mode.

A successful live request must be completed before claiming that the Vertex AI connection has been verified.

Vertex AI reference:

https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference

## Deployment Path

```text
GitHub source
    ↓
Cloud Build
    ↓
Artifact Registry
    ↓
Cloud Run
    ↓\r\nCompetition URLs
```

The repository should be updated before creating a new deployment image so that the source, container image and public service remain traceable to the same release.

## Security and Configuration

Do not commit:

- API keys
- Passwords
- Firebase private keys
- Service-account keys
- Secret Manager values
- Production environment files
- Local Windows paths

Use `.env.example` for placeholder configuration only.

The deployed application uses authenticated user access for personal assessment results. Administrator routes require authorised administrator configuration.

Before operational enterprise use, add:

- Tenant isolation
- Enterprise OIDC or SAML integration
- Permission-aware retrieval
- Formal retention and deletion controls
- Rate limiting
- Connector idempotency
- Encrypted backups
- Security testing
- AI quota and cost alerts

## Architecture and Boundaries

The organising chain is:

```text
Objective → Capability → Requirement → Evidence → Recommendation → Decision → Action → Outcome
```

The architecture distinguishes implemented, configured and extension services:

| Service | Current status |
| --- | --- |
| Cloud Run | Deployed competition service |
| Cloud Build | Used for container builds |
| Artifact Registry | Used for versioned images |
| Firestore | Deployed persistence mode |
| Firebase Authentication | Deployed email/password authentication |
| Secret Manager | Used for protected runtime configuration |
| Gemini on Vertex AI | Adapter implemented; demo mode may be active |
| **Vertex AI Search / Agent Search** | Enterprise retrieval extension |
| **Document AI** | Structured document-processing extension |
| **Vertex AI Agent Engine / ADK** | Bounded-agent extension |
| **BigQuery** | Analytics extension |
| xAPI | Event-model extension; conformance not claimed |
| OpenTelemetry | Observability extension; full instrumentation not claimed |
| AlloyDB | Enterprise roadmap |

No cognitive reserve, skill decay, System 2 state or organisational maturity is inferred from interaction counts.

Document excerpts establish traceability, not truth. Assessment scores do not establish clinical or employment conclusions. Meeting extraction is not meeting approval.

This is a bounded prototype. Approval names are self-attested unless an enterprise identity and approval system is configured.

## Source Layout

```text
public/          Browser application, assessment and administrator pages
src/             Domain, AI, authentication and storage modules
scripts/         Development and validation scripts
tests/           Test assets, where present
server.mjs       HTTP server and API routes
Dockerfile       Cloud Run container definition
package.json     Node.js project configuration
.env.example     Non-secret configuration template
README.md        Project documentation
```

## Local Assessment Administration

The user assessment is available at:

```text
/assessment.html
```

The protected local administrator view is available at:

```text
/admin.html
```

For local development, configure `ADMIN_ACCESS_KEY` before starting the server. The browser never receives the answer key. The assessment schema returns shuffled option identifiers, and the server validates and scores submitted identifiers.

## Limitations

This prototype does not claim:

- Clinical validity
- Predictive digital-twin capability
- Automated employment decisions
- Fully autonomous agent execution
- Enterprise tenant isolation
- Formal certification against referenced standards
- Production readiness without further security and validation work

AI-generated material requires human review. Reported outcomes require an identified measurement source and stated limitations.

## Repository and Contact

- **Repository:** https://github.com/zenaidigital/mindreserve-prototype
- **Website:** https://zenaidigital.com
- **Email:** sunil.kempegowda@zenaidigital.com

## Copyright and Commercial Use

Copyright © 2026 Sunil Mysore Kempegowda / MindReserve Labs.

This repository is published for competition evaluation only. No open-source licence is granted. Commercial use, redistribution, modification, or resale requires written permission from the copyright owner.

## Tags

#GoogleCloud #AIBuilderCup #Hack2skill #Gemini #VertexAI #FutureOfWork #AgenticAI #CloudRun



