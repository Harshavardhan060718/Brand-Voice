Module Name: AI Content Generation & Prompt Orchestration Module

# [Detailed PRD]

## 1. Module Overview
The Content Generation module compiles user inputs and brand constraints into instructions sent to the OpenAI API. It validates the user's monthly generation count, connects to the AI backend, logs the generated content variations in the database, and updates the usage tracker.

## 2. Features in that Module
*   **Template Selector**: Support for Instagram Caption, Facebook Post, Ad Headline, Product Description, Cold Email, and Marketing Copy.
*   **Dynamic System Prompt Constructor**: Server-side engine compiling brand metadata (name, tone, target audience, negative words list) into an authoritative context prompt.
*   **Variant Generation**: Outputting 1 to 3 distinct copies per request (A/B testing support).
*   **Active Loading Animation**: Renders a skeleton preview with cycling helpful copy while the API waits.
*   **Server-Side Limit Guard**: Secure middleware blocking executions if monthly usage exceeds 10 generations.

## 3. User Interactions
*   **Content Generation Flow**:
    1. User navigates to `/generate`.
    2. Selects a brand profile (e.g., "Nike") and a content type (e.g., "Instagram Caption").
    3. Types instructions in the prompt field (e.g., "Promoting carbon-fiber sole running shoes").
    4. Clicks "Generate Copy".
    5. UI shows loading state, skeleton shimmer overlays, and disables inputs.
    6. System finishes generating, variants fade into view, and a success notification is shown.

## 4. Data Requirements
*   **Reads**: `brand_profiles` fields (name, tone, audience, product_desc, avoid_words).
*   **Writes - generations Table**:
    *   `id`: `UUID` (Primary Key).
    *   `profile_id`: `UUID` (Foreign Key referencing `brand_profiles.id`, Cascade Delete).
    *   `content_type`: `VARCHAR` (e.g., "Ad Headline").
    *   `prompt_used`: `TEXT` (Specific instructions input by the user).
    *   `output`: `TEXT` (JSON or structured string storing generated text variants).
    *   `created_at`: `TIMESTAMP` (Default: `now()`).

## 5. API Requirements (High Level)
*   `POST /api/generate`
    *   **Payload**: `{ profileId: UUID, contentType: VARCHAR, promptUsed: TEXT }`
    *   **Headers**: `Authorization: Bearer <sb-access-token>`
    *   **Response**: `200 OK` with `{ variants: [Variant1, Variant2, Variant3] }` or `403 Forbidden` if over-limit.

## 6. Edge Cases
*   **OpenAI Service Interruptions**: If the OpenAI API returns a rate limit or timeout error, the Next.js API route must catch the exception, log it, and return a `503 Service Unavailable` JSON response. The client must show a retry message *without* clearing the user's typed instructions.
*   **Negative Constraint Bypass**: If a user enters instructions that attempt to override the "words to avoid" list (e.g. asking the AI to write "cheap shoes" when "cheap" is forbidden), the system prompt must contain strict formatting instructions that enforce the forbidden word rules.
*   **API Execution Abort**: If a user navigates away from the generation page during active call loading, the browser cancels the connection safely without breaking the server log sequence.

---

# PRD:
```markdown
## FR-3 Content Generation

### Description
Generate content based on the selected brand profile.

### Content Types
* Instagram Caption
* Facebook Post
* Ad Headline
* Product Description
* Cold Email
* Marketing Copy

### Inputs
* Selected Brand Profile
* Content Type
* User Prompt

### Outputs
* Generated Content
* Multiple Variants (1–3)

### Acceptance Criteria
* AI-generated content follows the selected brand voice.
* Content is returned within acceptable response time.

## 8. AI Prompt Orchestration

The Next.js API route must dynamically build the system prompt using the selected Brand Profile values to ensure the OpenAI model mimics the brand voice correctly.

### Prompt Assembly Flow
```
System Prompt:
"You are a professional marketing copywriter.
Brand Name: {name}
Tone: {tone}
Target Audience: {audience}
Product Description: {product_desc}
Avoid these words: {avoid_words}
Generate content that strictly aligns with these rules."
+
User Prompt:
"Format: {content_type}
Custom User Instructions: {prompt_used}"
=
Sent to OpenAI API
```
```
