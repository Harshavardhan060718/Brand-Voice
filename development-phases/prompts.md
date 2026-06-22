# AI Coding Agent Prompt Guide
## Project Name: BrandVoice – AI-Powered Brand Content Generation SaaS

---

## Global Agent Rules & Guardrails
All agents executing subsequent phases must strictly adhere to these rules:
1.  **Zero-Trust Frontend Validation**: Frontend elements (like buttons or input blocks) may hide or disable indicators for UX purposes, but **never trust client-side data**. The backend server API endpoints must perform independent session validation, quota validation, and database operations.
2.  **Strict RLS Isolation**: All database operations must go through Supabase client connections that enforce Row-Level Security (RLS) policies. Every table read or write must isolate data where `user_id == auth.uid()`.
3.  **Responsive Layout Guidelines**: Build using Tailwind CSS mobile-first parameters. Desktop screens support split grids, while tablet and mobile views collapse grids to single columns.
4.  **No Unused Code or Placeholders**: Implement complete, logical functions, concrete error toasts, and realistic mock shimmers. Never insert `// TODO: implement later` blocks.
5.  **State Management & Caching**: Cache brand profile lists and usage quotas locally using React hooks to prevent database roundtrip congestion on page changes.

### Common Mistakes to Avoid:
*   *Hardcoded Secret Keys*: Exposing secret keys (like OpenAI Key or Supabase Service Role Key) on the client client-side state.
*   *Missing Cascade Deletes*: Forgetting to write foreign key cascades, causing database constraint crashes when deleting profiles.
*   *Ignoring API Latency*: Triggering OpenAI requests without disabling the "Generate" button, resulting in double-spend database write bugs.
*   *Naively Resetting Limits*: Resetting quotas on arbitrary dates instead of enforcing clean calendar-month structures (using `YYYY-MM` checks).

---

# Phase 0 Prompt: Environment Setup & Database Initialization

```text
You are a senior software engineer. Your task is to implement "Phase 0: Environment Setup & Database Initialization" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Refer to the Product Requirements Document: [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md)
- Refer to the Design Specification: [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md)
- Refer to the Development Plan: [phases.md](file:///c:/Users/vigne/Desktop/BrandVoice/development-phases/phases.md)

OBJECTIVE:
Scaffold the core project directory and initialize the database schema in Supabase.

DELIVERABLES:
1. Initialize a Next.js App Router workspace with TypeScript, Tailwind CSS, and ESLint in the current folder.
2. Create a SQL migration schema script (`schema.sql`) defining the following PostgreSQL tables:
   - `users` (mirrored from auth.users: id UUID PK, email VARCHAR unique, created_at TIMESTAMP).
   - `brand_profiles` (id UUID PK, user_id UUID FK referencing users.id cascade, name VARCHAR, tone TEXT, audience TEXT, product_desc TEXT, avoid_words TEXT nullable, created_at TIMESTAMP).
   - `generations` (id UUID PK, profile_id UUID FK referencing brand_profiles.id cascade, content_type VARCHAR, prompt_used TEXT, output TEXT, created_at TIMESTAMP).
   - `usage` (user_id UUID, month VARCHAR, count INTEGER, composite PK of user_id + month).
3. Implement SQL statements enabling Row-Level Security (RLS) on `brand_profiles` and `generations`.
4. Configure a clean `.env.local.example` containing placeholders for NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.

CONSTRAINTS:
- Use clean, commented SQL. Ensure cascading deletes are correct.
- Ensure TypeScript strict checking is enabled in tsconfig.json.
```

---

# Phase 1 Prompt: Authentication & Authorization Setup

```text
You are a senior software engineer. Your task is to implement "Phase 1: Authentication & Authorization Setup" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Previous Phase: Phase 0 (App scaffold & database tables configured).
- Refer to [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md) and [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md).

OBJECTIVE:
Integrate Supabase Authentication, build registration and login forms, and create client-side route guards and server-side JWT verification middlewares.

DELIVERABLES:
1. Install Supabase Next.js helper library: `@supabase/ssr` and `@supabase/supabase-js`.
2. Build the Login/Registration pages under `/src/app/login/page.tsx` matching the design specification:
   - Centered card form structure, inputs validation (email format, 8-character password length).
   - Dynamic toggle between Login and Sign-up mode.
3. Configure Next.js Middleware (`/src/middleware.ts`) to handle session route guards:
   - Redirect unauthenticated users navigating to `/dashboard`, `/profiles`, `/generate`, or `/library` to the `/login` route.
   - Redirect authenticated users attempting to load `/login` to `/dashboard`.
4. Create a server-side authentication utility to extract the user session and verify the Bearer token for serverless API endpoints.
5. Create a dynamic header bar providing session states and a "Sign Out" button.

CONSTRAINTS:
- No hardcoded access parameters. Maintain secure server-side session checks.
- Build clean mobile-friendly styling (responsive forms).
```

---

# Phase 2 Prompt: Brand Profile CRUD Management

```text
You are a senior software engineer. Your task is to implement "Phase 2: Brand Profile CRUD Management" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Previous Phases: Phase 0 & Phase 1 (Auth, DB schemas, and middleware in place).
- Refer to [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md) and [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md).

OBJECTIVE:
Create the database client logic and UI workspace enabling users to create, list, edit, and delete Brand Profiles.

DELIVERABLES:
1. Build the Brand Profiles interface at `/src/app/profiles/page.tsx`:
   - Left-column Master List showing saved brands; right-column Detail Form editor.
2. Build forms for profiles creation/editing with input fields:
   - Brand Name, Tone of Voice, Target Audience, Product/Service Description, Words to Avoid.
3. Integrate "Words to Avoid" tag chips parsing comma-separated inputs.
4. Build backend endpoints `GET, POST, PUT, DELETE` under `/src/app/api/profiles/route.ts` (and dynamic `[id]/route.ts` if needed) connecting to Supabase:
   - Enforce server-side validation.
   - Prevent inserting a new profile if the user already has **5 brand profiles** (Free Tier constraint).
5. Implement deletion warning modal and verify cascade delete runs in PostgreSQL.

CONSTRAINTS:
- Use Supabase RLS client so users cannot query or update other users' brand profile data.
- Ensure all forms have loading indicators (disable saving during active updates).
```

---

# Phase 3 Prompt: Usage Tracking & Dashboard Analytics Engine

```text
You are a senior software engineer. Your task is to implement "Phase 3: Usage Tracking & Dashboard Analytics Engine" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Previous Phases: Phase 0 to Phase 2.
- Refer to [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md) and [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md).

OBJECTIVE:
Set up monthly utilization tracking and build the dashboard interface summarizing brand activity KPIs.

DELIVERABLES:
1. Build the main dashboard page at `/src/app/dashboard/page.tsx` using the design specs layout:
   - 4-column metric card group displaying: Active Profiles Count, Total Generations Count, Current Month Usage (e.g. 3/10 used), and Days until Reset.
   - Progress bar rendering usage percent (green for low usage, orange/red for >= 8 generations).
2. Create the backend API endpoint `GET /api/dashboard-metrics` fetching:
   - Brand profiles count owned by the user.
   - Total count of Generations.
   - Current billing month usage counts from the `usage` table (month format: `YYYY-MM`).
3. Build a "Recent Activity Feed" layout detailing the last 5 generated outputs with quick-copy clipboard buttons.

CONSTRAINTS:
- Cache metric values on page switches using React state to prevent heavy load on database tables.
- UI elements must load with shimmering loading skeletons within 1.5 seconds.
```

---

# Phase 4 Prompt: AI Engine Integration & Prompt Orchestration

```text
You are a senior software engineer. Your task is to implement "Phase 4: AI Engine Integration & Prompt Orchestration" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Previous Phases: Phase 0 to Phase 3.
- Refer to [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md) and [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md).

OBJECTIVE:
Integrate OpenAI, execute server-side monthly quota limits check, compile system prompts, and build the content generator interface.

DELIVERABLES:
1. Install development dependencies: `openai` client.
2. Build the Generation page `/src/app/generate/page.tsx`:
   - Left side control form (Brand selection, Content Type dropdown, Prompt textbox).
   - Right side "Workspace Canvas" showing skeleton shimmers during active generation.
3. Build the secure server-side endpoint `POST /api/generate`:
   - Perform a database count verification. If usage count is >= 10, reject immediately with `403 Forbidden`.
   - Fetch the selected Brand Profile.
   - Compile the dynamic system prompt (mapping Brand Name, Tone, Target Audience, Product Desc, and Avoid Words).
   - Submit request to OpenAI Chat Completions API requesting 3 distinct copy variations.
   - On success, insert generated outputs into the `generations` table and increment the count in the `usage` table inside a single database transaction.
4. Render variants in staggered slide-up cards with "Copy to Clipboard" triggers and a celebration confetti pop.

CONSTRAINTS:
- Do NOT expose the OpenAI API key to the client. Keep it in `.env.local`.
- If OpenAI fails, catch errors gracefully: return `503 Service Unavailable` and display a clear toast banner. Do NOT clear user form inputs on error.
```

---

# Phase 5: Content Library & History Management

```text
You are a senior software engineer. Your task is to implement "Phase 5: Content Library & History Management" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Previous Phases: Phase 0 to Phase 4.
- Refer to [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md) and [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md).

OBJECTIVE:
Implement the content library grid page allowing users to search, filter, copy, and purge generations history.

DELIVERABLES:
1. Build the library UI at `/src/app/library/page.tsx`:
   - Search text input and filter chip bar (by Content Type and Brand Profile name).
   - Paginated grid list (20 items per page) rendering copy logs.
2. Create database client queries fetching paginated records from the `generations` table joined with profile names.
3. Build backend endpoint `DELETE /api/generations/[id]` to delete specific logs.
4. Build a clipboard fallback copy interface for mobile devices.
5. Create a "Use Parameters" button on historical logs that redirects back to `/generate` pre-populating forms with details of that generation.

CONSTRAINTS:
- Deleting items in the history does NOT decrease the user's billing usage tally count for that month.
- An empty history list must display a clean CTA redirecting to the generation page.
```

---

# Phase 6: Subscription Integration (Stripe Gateway)

```text
You are a senior software engineer. Your task is to implement "Phase 6: Subscription Integration (Stripe Gateway)" for the BrandVoice SaaS platform.

CONTEXT & DESIGN REFS:
- Previous Phases: Phase 0 to Phase 5.
- Refer to [PRD.md](file:///c:/Users/vigne/Desktop/BrandVoice/PRD.md) and [design.md](file:///c:/Users/vigne/Desktop/BrandVoice/design.md).

OBJECTIVE:
Integrate Stripe gateway, handle payment events, set billing status, and bypass monthly limits for upgraded accounts.

DELIVERABLES:
1. Configure Stripe Test Mode credentials.
2. Create endpoint `POST /api/billing/checkout` generating checkout sessions redirecting users to Stripe pricing portals.
3. Build webhooks endpoint `POST /api/billing/webhook` verifying Stripe webhook signatures:
   - Listen for `checkout.session.completed` and subscription updates.
   - Update the user profile billing metadata (flagging `stripe_status == 'active'`).
4. Modify the `/api/generate` endpoint limit validation:
   - Check user billing flags. If user status is `active`, bypass the 10/month limit checker and generate content without counting limits.
5. Add a "Upgrade to Pro" modal when the dashboard limit progress bar is full.

CONSTRAINTS:
- Enforce strict webhook signature checks.
- Keep test credentials inside environment variables.
```

---

# Development Phases

[PASTE PHASES]
Below is the full development plan for reference.

### Phase 0: Environment Setup & Database Initialization
*   **Objective**: Scaffold the Next.js client/server workspace, establish the core Supabase PostgreSQL schemas, and configure Row-Level Security (RLS) policies.
*   **Features to Implement**:
    *   Initialize Next.js application with TypeScript, Tailwind CSS, and Eslint.
    *   Create base schema configuration files for PostgreSQL tables (`users` reflection, `brand_profiles`, `generations`, `usage`).
    *   Implement database keys, indices, and foreign key Cascade Delete relationships.
    *   Establish Row-Level Security (RLS) policies for user data isolation.
    *   Scaffold `.env.local.example` with Supabase configuration parameters.
*   **Dependencies on Previous Phases**: None.

### Phase 1: Authentication & Authorization Setup
*   **Objective**: Integrate Supabase Authentication for secure register, login, session persistence, and API route protection.
*   **Features to Implement**:
    *   Setup client registration (Sign Up) form with password checks.
    *   Setup client sign-in (Login) form with redirect rules.
    *   Implement client-side middleware route guards (redirecting guest to `/login`, authenticated users to `/dashboard`).
    *   Create server-side JWT verification helper for API endpoints.
    *   Enable logout mechanics clearing session cookies.
*   **Dependencies on Previous Phases**: Phase 0.

### Phase 2: Brand Profile CRUD (Database Logic & UI)
*   **Objective**: Implement the database CRUD logic and frontend workspace UI to allow users to manage up to 5 brand profile definitions.
*   **Features to Implement**:
    *   Create profile lists panel displaying saved brands.
    *   Build profile creation and edit forms (fields: Name, Tone, Audience, Product Description, Words to Avoid).
    *   Implement "avoid words" auto-chip parsing.
    *   Implement profile delete confirmation trigger with database cascade delete.
    *   Add client-side limit validation to block profile creation if count reaches 5.
*   **Dependencies on Previous Phases**: Phase 1.

### Phase 3: Usage Tracking & Dashboard Analytics Engine
*   **Objective**: Set up monthly usage counters and build the client dashboard summarizing brand profiles, usage counts, and historical tallies.
*   **Features to Implement**:
    *   Write backend trigger tracking and writing monthly usage tallies.
    *   Build `GET /api/dashboard-metrics` API aggregating active profile counts, total generations, and current monthly usage count.
    *   Create dashboard UI displaying KPIs and circular/linear usage progress indicators.
*   **Dependencies on Previous Phases**: Phase 2.

### Phase 4: AI Engine Integration & Prompt Orchestration
*   **Objective**: Connect to the OpenAI API, establish secure server-side limit check validation (10/month limit), dynamically assemble system prompts, and output generated variants.
*   **Features to Implement**:
    *   Write server-side prompt compiler mapping active brand guidelines and content types.
    *   Write server-side limit verification middleware checking current month usage *before* calling OpenAI API.
    *   Configure OpenAI Client SDK connecting to Chat Completions API.
    *   Implement transaction logic saving generated text to database and incrementing monthly usage.
    *   Create client-side generation interface showing loading animations, disabled triggers, and staggered variant displays.
*   **Dependencies on Previous Phases**: Phase 3.

### Phase 5: Content Library & History Management
*   **Objective**: Build a historical feed interface enabling users to query, filter, copy, and delete past content generations.
*   **Features to Implement**:
    *   Implement paginated history queries fetching generation entries joined with brand profile metadata.
    *   Create UI list showing generation cards (inputs, outputs, date, brand name).
    *   Build filter chips sorting by brand profile or content template type.
    *   Integrate copy-to-clipboard icons.
    *   Create deletion API route allowing users to purge specific generation logs.
*   **Dependencies on Previous Phases**: Phase 4.

### Phase 6: Subscription Integration (Stripe Gateway)
*   **Objective**: Integrate Stripe checkout systems to allow users to upgrade to the Pro plan, bypassing the 10 generations limit.
*   **Features to Implement**:
    *   Create Stripe Checkout API redirecting user to pricing portals.
    *   Implement Stripe webhooks intercepting subscription changes.
    *   Modify `/api/generate` logic to check subscription flags; bypass the 10/month checker if active subscription exists.
*   **Dependencies on Previous Phases**: Phase 5.
