# Project Build & Development Plan
## Project Name: BrandVoice – AI-Powered Brand Content Generation SaaS

---

# Phase 0: Environment Setup & Database Initialization
*   **Objective**: Scaffold the Next.js client/server workspace, establish the core Supabase PostgreSQL schemas, and configure Row-Level Security (RLS) policies.
*   **Features to Implement**:
    *   Initialize Next.js application with TypeScript, Tailwind CSS, and Eslint.
    *   Create base schema configuration files for PostgreSQL tables (`users` reflection, `brand_profiles`, `generations`, `usage`).
    *   Implement database keys, indices, and foreign key Cascade Delete relationships.
    *   Establish Row-Level Security (RLS) policies for user data isolation.
    *   Scaffold `.env.local.example` with Supabase configuration parameters.
*   **Dependencies on Previous Phases**: None.

---

# Phase 1: Authentication & Authorization Setup
*   **Objective**: Integrate Supabase Authentication for secure register, login, session persistence, and API route protection.
*   **Features to Implement**:
    *   Setup client registration (Sign Up) form with password checks.
    *   Setup client sign-in (Login) form with redirect rules.
    *   Implement client-side middleware route guards (redirecting guest to `/login`, authenticated users to `/dashboard`).
    *   Create server-side JWT verification helper for API endpoints.
    *   Enable logout mechanics clearing session cookies.
*   **Dependencies on Previous Phases**: Phase 0.

---

# Phase 2: Brand Profile CRUD (Database Logic & UI)
*   **Objective**: Implement the database CRUD logic and frontend workspace UI to allow users to manage up to 5 brand profile definitions.
*   **Features to Implement**:
    *   Create profile lists panel displaying saved brands.
    *   Build profile creation and edit forms (fields: Name, Tone, Audience, Product Description, Words to Avoid).
    *   Implement "avoid words" auto-chip parsing.
    *   Implement profile delete confirmation trigger with database cascade delete.
    *   Add client-side limit validation to block profile creation if count reaches 5.
*   **Dependencies on Previous Phases**: Phase 1.

---

# Phase 3: Usage Tracking & Dashboard Analytics Engine
*   **Objective**: Set up monthly usage counters and build the client dashboard summarizing brand profiles, usage counts, and historical tallies.
*   **Features to Implement**:
    *   Write backend trigger tracking and writing monthly usage tallies.
    *   Build `GET /api/dashboard-metrics` API aggregating active profile counts, total generations, and current monthly usage count.
    *   Create dashboard UI displaying KPIs and circular/linear usage progress indicators.
*   **Dependencies on Previous Phases**: Phase 2.

---

# Phase 4: AI Engine Integration & Prompt Orchestration
*   **Objective**: Connect to the OpenAI API, establish secure server-side limit check validation (10/month limit), dynamically assemble system prompts, and output generated variants.
*   **Features to Implement**:
    *   Write server-side prompt compiler mapping active brand guidelines and content types.
    *   Write server-side limit verification middleware checking current month usage *before* calling OpenAI API.
    *   Configure OpenAI Client SDK connecting to Chat Completions API.
    *   Implement transaction logic saving generated text to database and incrementing monthly usage.
    *   Create client-side generation interface showing loading animations, disabled triggers, and staggered variant displays.
*   **Dependencies on Previous Phases**: Phase 3.

---

# Phase 5: Content Library & History Management
*   **Objective**: Build a historical feed interface enabling users to query, filter, copy, and delete past content generations.
*   **Features to Implement**:
    *   Implement paginated history queries fetching generation entries joined with brand profile metadata.
    *   Create UI list showing generation cards (inputs, outputs, date, brand name).
    *   Build filter chips sorting by brand profile or content template type.
    *   Integrate copy-to-clipboard icons.
    *   Create deletion API route allowing users to purge specific generation logs.
*   **Dependencies on Previous Phases**: Phase 4.

---

# Phase 6: Subscription Integration (Stripe Gateway)
*   **Objective**: Integrate Stripe checkout systems to allow users to upgrade to the Pro plan, bypassing the 10 generations limit.
*   **Features to Implement**:
    *   Create Stripe Checkout API redirecting user to pricing portals.
    *   Implement Stripe webhooks intercepting subscription changes.
    *   Modify `/api/generate` logic to check subscription flags; bypass the 10/month checker if active subscription exists.
*   **Dependencies on Previous Phases**: Phase 5.

---

# Modules

### 1. Authentication & Security Module (auth.md)
```markdown
Module Name: Authentication & Security Module

## 1. Module Overview
The Authentication & Security module manages user registration, login, logout, and session states. It provides JWT-based API authorization, secures application entry paths, and enforces route guarding so that unauthenticated users are redirected to the login interface.

## 2. Features in that Module
*   User Registration: Allows guests to create accounts using email and password.
*   User Login: Authenticates returning users and establishes secure sessions.
*   Session Management: Persists login states across browser refreshes and page transitions.
*   User Logout: Ends user sessions and clears client auth cookies/local storage.
*   Route Protection: Guards dashboard and generation pages against unauthenticated visits.

## 3. User Interactions
*   Sign Up Flow: User inputs email and password (minimum 8 characters) on the registration form -> clicks "Sign Up" -> account is created, session is initialized, and user is redirected to the dashboard.
*   Login Flow: User inputs credentials on the sign-in page -> clicks "Sign In" -> application authenticates credentials against Supabase Auth -> on success, redirects to the user's dashboard.
*   Protected Access Flow: Unauthenticated visitor attempts to navigate directly to `/dashboard` or `/generate` -> router blocks access and redirects them to `/login`.
*   Sign Out Flow: User clicks the "Sign Out" button in the navigation panel -> system invalidates session -> user redirected back to the public homepage.

## 4. Data Requirements
*   auth.users (Supabase Managed):
    *   id: UUID (Primary Key, unique identifier generated by Supabase Auth).
    *   email: VARCHAR (Unique, verified user email).
    *   created_at: TIMESTAMP (Timestamp of registration).

## 5. API Requirements (High Level)
*   Session Bearer Auth: All API routes (such as `/api/generate`) check for a valid authorization header containing the user's access token JWT (`sb-access-token`).
*   Supabase Client Authentication:
    *   signUp(email, password)
    *   signInWithPassword(email, password)
    *   signOut()
    *   getSession()

## 6. Edge Cases
*   Expired JWT Session: User leaves the tab open for days. When they click "Generate Copy", the API returns `401 Unauthorized`. The frontend must handle this gracefully by prompting a sign-in dialog without losing the user's unsaved input text.
*   Duplicate Registration: A user tries to sign up with an email address that is already registered. The system must display a clear, non-leaking message: "An account with this email already exists. Please login instead."
*   Password Length/Complexity Violations: Registration forms must enforce validation on the client side (e.g., minimum length, uppercase, numbers) before sending the request.
```

### 2. Brand Profile Management Module (profiles.md)
```markdown
Module Name: Brand Profile Management Module

## 1. Module Overview
The Brand Profile Management module provides a CRUD (Create, Read, Update, Delete) engine that allows users to create and manage their brand personas. It handles storing specific traits (such as tone, target audience, product descriptions, and negative words) that shape the generative logic of the AI content generator.

## 2. Features in that Module
*   Create Profile: Multi-field form input to save a new brand persona.
*   View Profile: Detailed preview cards showing all parameters of active profiles.
*   Edit Profile: Update saved attributes (e.g. changing audience demographics or tone directives).
*   Delete Profile: Remove a brand profile from the database, cascading deletion to all generations linked to it.
*   Avoid-Words Tagging: Auto-chip formatting that parses comma-separated negative keywords.

## 3. User Interactions
*   Creating a Profile: User navigates to the Brand Profiles panel -> clicks "+ Add Brand" -> fills in fields (Brand Name, Tone, Target Audience, Product Description, Words to Avoid) -> clicks "Save Brand" -> form closes and list refreshes with a success toast notification.
*   Editing a Profile: User clicks the "Edit" button next to a profile card -> form populates with current database values -> user edits target audience -> clicks "Update" -> updates immediately in database.
*   Deleting a Profile: User clicks the "Delete" trash icon -> confirmation modal appears warning: "Warning: This will permanently delete this profile and all content generated using this profile." -> user clicks "Confirm Delete" -> records are removed.

## 4. Data Requirements
*   brand_profiles Table:
    *   id: UUID (Primary Key, default: UUID generation).
    *   user_id: UUID (Foreign Key referencing `users.id`, Cascade Delete).
    *   name: VARCHAR(255) (Not Null, brand name).
    *   tone: TEXT (Not Null, description of brand voice).
    *   audience: TEXT (Not Null, target audience characteristics).
    *   product_desc: TEXT (Not Null, core product specifications).
    *   avoid_words: TEXT (Nullable, comma-separated list of terms).
    *   created_at: TIMESTAMP (Default: `now()`).

## 5. API Requirements (High Level)
*   GET /api/profiles - Fetch all brand profiles belonging to the logged-in user.
*   POST /api/profiles - Create a brand profile (validates fields).
*   PUT /api/profiles/[id] - Update brand profile by ID (validates ownership).
*   DELETE /api/profiles/[id] - Delete profile and dependencies by ID (validates ownership).

## 6. Edge Cases
*   Quota Limit Hit: The Free Tier limits users to 5 active brand profiles. If a user has 5 profiles and clicks "+ Add Brand", the app must block the creation page and prompt them to upgrade to the Pro plan or delete an existing profile.
*   Deleting a Profile in Use: If a user deletes a brand profile that is currently active in the generator tab selection, the generator tab must dynamically clear its selection to avoid system errors.
*   Database Invalidation: If the user inputs special characters or excessively long descriptions (over 10,000 characters), the API must throw a `422 Unprocessable Entity` validation error before DB insert.
```

### 3. AI Content Generation Module (generator.md)
```markdown
Module Name: AI Content Generation & Prompt Orchestration Module

## 1. Module Overview
The Content Generation module compiles user inputs and brand constraints into instructions sent to the OpenAI API. It validates the user's monthly generation count, connects to the AI backend, logs the generated content variations in the database, and updates the usage tracker.

## 2. Features in that Module
*   Template Selector: Support for Instagram Caption, Facebook Post, Ad Headline, Product Description, Cold Email, and Marketing Copy.
*   Dynamic System Prompt Constructor: Server-side engine compiling brand metadata (name, tone, target audience, negative words list) into an authoritative context prompt.
*   Variant Generation: Outputting 1 to 3 distinct copies per request (A/B testing support).
*   Active Loading Animation: Renders a skeleton preview with cycling helpful copy while the API waits.
*   Server-Side Limit Guard: Secure middleware blocking executions if monthly usage exceeds 10 generations.

## 3. User Interactions
*   Content Generation Flow:
    1. User navigates to `/generate`.
    2. Selects a brand profile (e.g., "Nike") and a content type (e.g., "Instagram Caption").
    3. Types instructions in the prompt field (e.g., "Promoting carbon-fiber sole running shoes").
    4. Clicks "Generate Copy".
    5. UI shows loading state, skeleton shimmer overlays, and disables inputs.
    6. System finishes generating, variants fade into view, and a success notification is shown.

## 4. Data Requirements
*   Reads: `brand_profiles` fields (name, tone, audience, product_desc, avoid_words).
*   Writes - generations Table:
    *   id: UUID (Primary Key).
    *   profile_id: UUID (Foreign Key referencing `brand_profiles.id`, Cascade Delete).
    *   content_type: VARCHAR (e.g., "Ad Headline").
    *   prompt_used: TEXT (Specific instructions input by the user).
    *   output: TEXT (JSON or structured string storing generated text variants).
    *   created_at: TIMESTAMP (Default: `now()`).

## 5. API Requirements (High Level)
*   POST /api/generate
    *   Payload: `{ profileId: UUID, contentType: VARCHAR, promptUsed: TEXT }`
    *   Headers: `Authorization: Bearer <sb-access-token>`
    *   Response: `200 OK` with `{ variants: [Variant1, Variant2, Variant3] }` or `403 Forbidden` if over-limit.

## 6. Edge Cases
*   OpenAI Service Interruptions: If the OpenAI API returns a rate limit or timeout error, the Next.js API route must catch the exception, log it, and return a `503 Service Unavailable` JSON response. The client must show a retry message without clearing the user's typed instructions.
*   Negative Constraint Bypass: If a user enters instructions that attempt to override the "words to avoid" list (e.g. asking the AI to write "cheap shoes" when "cheap" is forbidden), the system prompt must contain strict formatting instructions that enforce the forbidden word rules.
*   API Execution Abort: If a user navigates away from the generation page during active call loading, the browser cancels the connection safely without breaking the server log sequence.
```

### 4. Content Library & History Module (library.md)
```markdown
Module Name: Content Library & History Module

## 1. Module Overview
The Content Library module serves as a historical archive for all generated content. It allows users to review, filter, copy, and delete past copy variants. It ensures that generations are stored persistently and are easy to search.

## 2. Features in that Module
*   Chronological Feed Grid: A list view showing generations ordered from newest to oldest.
*   Search & Filter Chips: Filter generations by Brand Profile or Content Type.
*   One-Click Clipboard Copying: Copies selected copy blocks immediately.
*   Generation Deletion: Removes logs and text records from the archive.
*   Quick Re-run Prompt: Relaunches the generator workspace using the parameters of a past generation.

## 3. User Interactions
*   Viewing & Filtering History: User opens `/library` -> feed loads all past outputs -> user clicks the "Cold Email" filter chip -> UI list updates to show only cold email logs.
*   Copying Output: User clicks the clipboard icon on any generation card -> card displays a green checkmark indicating successful copying -> text is copied to the user's system clipboard.
*   Purging History: User clicks "Delete" on a card -> modal pops up asking to confirm -> clicks confirm -> card fades out of view and is removed from the database.

## 4. Data Requirements
*   generations Table (Reads & Deletes):
    *   Queries read columns: `id`, `profile_id`, `content_type`, `prompt_used`, `output`, `created_at`.
    *   Join with `brand_profiles` to fetch the human-readable brand name (`brand_profiles.name`) for display.

## 5. API Requirements (High Level)
*   GET /api/generations?page=1&limit=20&profileId=xyz - Fetch paginated logs belonging to the user.
*   DELETE /api/generations/[id] - Delete specific generation entry.

## 6. Edge Cases
*   Empty State Feed: If the user has never generated any content, the page must show an empty state banner with a call-to-action button: "Start generating copy" that links to the generator workspace.
*   Orphaned Generations: If a brand profile is deleted, all generations linked to it are automatically deleted via the database foreign key Cascade constraint.
*   Clipboard Compatibility: Fallback copying mechanisms must be implemented for legacy mobile browsers that lack support for the modern `navigator.clipboard.writeText` API.
```

### 5. Usage Tracking & Billing Module (billing.md)
```markdown
Module Name: Usage Tracking, Dashboard & Billing Module

## 1. Module Overview
This module tracks and limits usage on the Free Tier (10 generations/month), calculates dashboard KPIs, handles subscription upgrades using Stripe Test Mode, and manages monthly usage resets.

## 2. Features in that Module
*   Usage Database Registry: Keeps a running tally of successful content generations per user per calendar month.
*   Dashboard KPI Summary: Computes stats for profiles count, total generations, remaining usage, and active subscription state.
*   Zero-Trust Limit Enforcer: Backend check that rejects API generations if user count >= 10.
*   Stripe checkout portal integration: Redirects users to Stripe checkout to upgrade to the Pro tier (unlimited generations).
*   Monthly Counter Reset Scheduler: Automatically clears limits or rolls counts over to a new record on the first of each month.

## 3. User Interactions
*   Viewing Dashboard: User opens `/dashboard` -> dashboard displays total brand profiles, total generations, and a progress bar showing remaining usage (e.g. "7 / 10 generations remaining").
*   Upgrade Trigger: User reaches 10/10 generations -> clicks "Generate Copy" -> modal blocks input and shows message: "Monthly free limit reached. Upgrade to Pro for unlimited access." -> clicks "Upgrade Now".
*   Checkout & Return: Redirects to Stripe Checkout page -> user inputs test credit card -> clicks Pay -> redirects back to BrandVoice with a success notification and a "Pro Plan" badge.

## 4. Data Requirements
*   usage Table:
    *   user_id: UUID (Composite Primary Key, FK referencing `users.id`).
    *   month: VARCHAR (Composite Primary Key, format `YYYY-MM`).
    *   count: INTEGER (Default: `0`).

## 5. API Requirements (High Level)
*   GET /api/dashboard-metrics - Fetch summary counters for dashboard.
*   POST /api/billing/checkout - Create a Stripe checkout session for the user and return the redirect URL.
*   POST /api/billing/webhook - Stripe webhooks that intercept payment successes and update user subscription metadata in database.

## 6. Edge Cases
*   Race Conditions: If a user fires multiple rapid requests simultaneously to bypass the 10/10 limit, the backend API must run a transaction lock on the `usage` table to verify current count before executing the AI generation.
*   Stripe Webhook Delivery Failure: If a payment goes through but Stripe webhooks fail to reach the server, the user's account might not get updated. The system must support manual validation or verify credentials upon session refresh.
*   Month Rollover Sync: If a user makes a request at the end of a month (e.g. 11:59 PM on May 31), the server must calculate the date using UTC time to determine if it belongs to the current month or the next.
```
