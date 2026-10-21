# MindReserve AI v2 — Product and Deployment Specification

**Specification version:** 1.0  
**Specification date:** 23 October 2026  
**Product:** MindReserve AI — Enterprise AI-Readiness and Value-Realisation Platform  
**Deployment covered:** v2 competition deployment

This specification describes the deployed v2 product behaviour and the acceptance criteria used for future changes. It separates confirmed implementation from configured integrations and future architecture.

## 1. Product purpose

MindReserve helps people and organisations assess durable AI-work skills, inspect evidence, challenge AI-assisted recommendations, record human approval and measure reported outcomes.

The governing loop is:

```text
Assess → Practise → Use AI → Challenge Evidence → Approve → Measure Outcomes
```

The product is not a clinical assessment, personality assessment, employment decision system or diagnosis tool.

## 2. Canonical deployment

| Item | Value |
|---|---|
| Google Cloud project | `mindreserve-production` |
| Cloud Run service | `mindreserve-v2` |
| Region | `australia-southeast1` |
| Auditor URL | https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app |
| User assessment | https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/assessment.html |
| Administrator dashboard | https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/admin.html |
| Reserve workflow | https://mindreserve-v2-cqjtrmi7ma-ts.a.run.app/reserve.html |
| Source repository | https://github.com/zenaidigital/mindreserve-prototype |
| Primary persistence | Firestore |
| Runtime | Node.js 22+ on Cloud Run |

The auditor URL is a release invariant. A deployment must update the service behind this URL; publishing a different v2 or v3 URL does not satisfy the requirement.

## 3. User roles

### 3.1 Public assessment participant

A participant can:

- Open `/assessment.html`.
- Enter a name and persona.
- Complete 28 scenarios.
- Submit without signing in.
- See the result immediately.
- Choose whether to create an account for progress tracking.

A participant cannot:

- View another participant's result.
- View the administrator dashboard.
- View private evidence or decision records.

### 3.2 Authenticated participant

An authenticated participant can:

- Submit an assessment.
- Claim an anonymous result after account creation.
- View their own assessment history.
- Use the authenticated decision workspace permitted by the deployment.

### 3.3 Authorised administrator

An administrator must authenticate with Firebase Identity Toolkit and match the configured administrator email allowlist. An administrator can:

- View cohort assessment summaries.
- View scores, levels, priority gaps and dates.
- View reserve summary aggregates.
- Use protected administrator reporting endpoints.

Administrator access must not depend on a browser-exposed administrator secret.

### 3.4 Business decision user

A workspace user can:

- Create a decision record.
- Add evidence.
- Run an AI-assisted or deterministic review.
- Answer challenge questions.
- Record approval or rejection.
- Create an internal action after approval.
- Record a measured outcome.
- Export a decision pack.

External actions are outside the prototype boundary.

## 4. Assessment requirements

### FR-01 — Assessment schema

The server shall expose a 28-scenario assessment schema through `GET /api/assessment-schema`.

Each request shall create a short-lived assessment session. Option identifiers shall be shuffled so that the client does not receive answer positions as the scoring key.

### FR-02 — Participant validation

The server shall validate:

- Name length of at least two characters.
- Persona against the supported persona list.
- Assessment session existence and expiry.
- Session single-use status.
- Answer count.
- Answer identifiers and mapping.

The browser shall not be trusted to calculate the score.

### FR-03 — Anonymous submission

The server shall accept an assessment submission without a bearer token.

The submission shall:

- Be scored server-side.
- Be stored in Firestore when `STORE_MODE=firestore`.
- Return the result to the browser.
- Create a one-time claim token for optional account linking.
- Create an audit event.

### FR-04 — Immediate result

After a successful submission, the browser shall display:

- Participant name.
- Starting level.
- Score and total.
- Priority practice areas.
- Explanations for selected gaps.
- Interpretation boundary.
- Link to the next role pathway.

The result shall be visible before any account is requested.

### FR-05 — Optional progress tracking

After displaying an anonymous result, the browser shall ask whether the participant wants to track progress.

If accepted:

1. The participant creates a Firebase email/password account.
2. Firebase returns an authenticated identity token.
3. The browser submits the one-time claim token.
4. The server links the result to the authenticated user.
5. The claim token is deleted.
6. Future history is available through `GET /api/my-assessments`.

If declined, the participant can retain the displayed result without creating an account.

### FR-06 — Personal history

`GET /api/my-assessments` shall require a valid bearer token and return only records whose `userId` matches the authenticated Firebase identity.

Claim tokens and answer mappings shall not be returned in personal-history or administrator responses.

## 5. Reserve profile requirements

The reserve workflow is an exploratory, research-informed profile. It is not the official CRIq, CRS or CRASH instrument and shall not be presented as a clinical result.

The workflow shall:

- Load its own session and question schema.
- Mark wellbeing context as optional.
- Validate responses server-side.
- Store the profile separately from assessment results.
- Exclude individual wellbeing responses from administrator summaries.
- Display descriptive scores with their limitations.

## 6. Decision workflow requirements

The decision workspace shall support this state sequence:

```text
Draft
  → Review
  → Human reflection
  → Approval or rejection
  → Internal action
  → Reported outcome
```

Rules:

- A review must precede reflection.
- Reflection must identify evidence and a revised recommendation.
- Approval requires an explicit disposition and rationale.
- Only an approved current decision can create an action.
- An action must exist before an outcome can be recorded.
- A revision invalidates prior review, reflection and approval.
- Reported outcomes must include baseline, observation, sample size, measurement source and limitations.

## 7. AI integration requirements

### Implemented/configured

- Gemini adapter in `src/ai.mjs`.
- Vertex AI model configuration through `AI_MODE`, `GEMINI_MODEL` and `VERTEX_LOCATION`.
- Structured JSON response request.
- Source-quote and source-identifier validation.
- Error response when the model returns invalid or unsupported output.
- Deterministic review mode for reliable demonstration.

### Runtime boundary

Assessment scoring is deterministic. Gemini is used for decision reviews and meeting summaries when Vertex mode is enabled and the Cloud Run service account has Vertex AI permission.

The following must be verified before describing Vertex AI as live in a release:

- `aiplatform.googleapis.com` is enabled.
- The Cloud Run runtime service account has `roles/aiplatform.user`.
- `AI_MODE=vertex`.
- `GEMINI_MODEL=gemini-2.5-flash`.
- `VERTEX_LOCATION=global`.
- A successful live review is visible in application behaviour and logs.

Vertex AI shall not independently approve decisions, diagnose health conditions, infer personality or trigger external actions.

The following are architecture extensions unless separately deployed and tested:

- Vertex AI Search / Agent Search.
- Document AI.
- Vertex AI Agent Engine and Agent Development Kit.
- BigQuery analytics pipeline.

## 8. Google Cloud runtime

| Service | v2 role | Status |
|---|---|---|
| Cloud Run | Web application and API | Implemented and deployed |
| Cloud Build | Container build | Implemented |
| Artifact Registry | Versioned image storage | Implemented |
| Firestore | Assessment, decision and application state | Implemented/configured |
| Firebase Identity Toolkit | Email/password authentication | Implemented |
| Secret Manager | Runtime secrets | Implemented/configured |
| IAM and service accounts | Runtime access control | Implemented/configured |
| Cloud Logging | Diagnostics | Implemented |
| Vertex AI Gemini | Decision-review and meeting-intelligence adapter | Configured; live call requires environment verification |
| Vertex AI Search | Enterprise retrieval | Extension |
| Document AI | Structured document extraction | Extension |
| Agent Engine / ADK | Bounded agent orchestration | Extension |
| BigQuery | Anonymised outcome analytics | Extension |

## 9. API contract

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health response |
| GET | `/api/assessment-schema` | Public | Create assessment session and return questions |
| POST | `/api/assessments` | Public or bearer | Validate, score and store assessment |
| POST | `/api/assessments/:id/claim` | Bearer | Link an anonymous result to the signed-in user |
| GET | `/api/my-assessments` | Bearer | Return the signed-in user's results |
| GET | `/api/reserve-schema` | Public | Create reserve-profile session |
| POST | `/api/reserve-profiles` | Public or bearer | Validate and store reserve profile |
| GET | `/api/assessments` | Administrator | Return reporting summaries |
| GET | `/api/reserve-profiles` | Administrator | Return reserve summary data |
| GET | `/api/bootstrap` | Authenticated workspace | Return workspace state and runtime status |
| GET | `/api/search` | Authenticated workspace | Search stored evidence |
| POST | `/api/documents` | Authenticated workspace | Add evidence |
| POST | `/api/decisions` | Authenticated workspace | Create decision |
| POST | `/api/decisions/:id/review` | Authenticated workspace | Generate decision review |
| POST | `/api/decisions/:id/reflection` | Authenticated workspace | Save human challenge and revised recommendation |
| POST | `/api/decisions/:id/approval` | Authenticated workspace | Record approval or rejection |
| POST | `/api/decisions/:id/action` | Authenticated workspace | Create internal action |
| POST | `/api/decisions/:id/outcome` | Authenticated workspace | Record measured outcome |
| POST | `/api/meetings` | Authenticated workspace | Create meeting-intelligence draft |

All mutation requests shall use JSON and same-origin protection.

## 10. Security and privacy requirements

- Use Firebase ID tokens for authenticated users.
- Validate administrator identity against the configured email allowlist.
- Keep secrets in Secret Manager or runtime environment configuration.
- Do not expose answer keys or claim tokens in public read endpoints.
- Use same-origin checks for browser mutations.
- Use a restrictive Content Security Policy.
- Minimise stored data to the stated purpose.
- Provide retention and deletion controls before production use.
- Do not combine health data with employer capability data.
- Do not present prototype scores as clinical, employment or personality determinations.

## 11. Competition release acceptance tests

A release is acceptable only when all applicable tests pass:

### URL and deployment

- [ ] The fixed auditor URL returns HTTP 200 for `/assessment.html`.
- [ ] The deployed service is `mindreserve-v2` in `australia-southeast1`.
- [ ] The build image and GitHub commit are recorded.
- [ ] The root, assessment, admin and reserve paths are tested.
- [ ] A rollback image is identified.

### Participant flow

- [ ] Incognito user can load the assessment.
- [ ] Incognito user can submit without signing in.
- [ ] Result appears immediately.
- [ ] Account creation is optional.
- [ ] New account can claim the anonymous result.
- [ ] Signed-in history shows only that user's results.
- [ ] Refresh and expired-session messages are understandable.

### Administrator flow

- [ ] Non-administrator cannot view reporting.
- [ ] Authorised administrator can sign in.
- [ ] Assessment results appear in the dashboard.
- [ ] Reserve summaries load or show a clear empty state.
- [ ] Individual wellbeing responses are excluded from summary reporting.

### AI and governance

- [ ] Runtime mode is displayed accurately.
- [ ] Vertex AI live call is tested before claiming live Gemini use.
- [ ] Deterministic fallback behaviour is labelled.
- [ ] AI output is challenged against source evidence.
- [ ] Human approval is required before internal actions.
- [ ] Prototype limitations are visible in the interface and README.

### Repository and submission

- [ ] README URLs match the fixed auditor deployment.
- [ ] README separates implemented, configured and extension capabilities.
- [ ] Repository contains the Dockerfile, package manifest, source and environment example.
- [ ] No credentials, local Windows paths or private data are committed.
- [ ] Video links and stated runtime behaviour are consistent with the deployed product.

## 12. Out of scope for v2

- Clinical diagnosis or cognitive impairment screening.
- Personality or employment scoring.
- Health, genomic or wearable data collection.
- Autonomous external actions.
- Production-grade multi-tenant isolation.
- Formal ISO/IEC 42001 conformance.
- Validated clinical instruments.
- Production BigQuery analytics pipeline.
- Production Vertex AI Search, Document AI or Agent Engine deployment.

## 13. Change-control rule

Every future change shall update four artefacts together:

1. This specification.
2. The acceptance test or automated test.
3. The README claim and deployment information.
4. The deployed image and rollback record.

A feature is not “implemented” until it is present in the deployed service, reachable through its canonical URL and covered by an acceptance test.

