# Design Specification Document
## Project Name: BrandVoice – AI-Powered Brand Content Generation SaaS

---

## 1. Overall UI Style & Aesthetic

BrandVoice adopts a **Sleek Neo-Minimalist** interface that feels premium, professional, and developer-adjacent. The visual tone is inspired by high-end developer tools and modern SaaS platforms. It prioritizes data clarity, generous negative space, crisp borders, and subtle depth through layers rather than heavy drop shadows.

### Core Style Attributes
*   **Minimalist & Focused**: Extraneous decorative elements are eliminated to keep the focus on brand profiles and generated content.
*   **Neomorphic Border Lines**: Clean, 1px borders define structure instead of card shadows.
*   **Glow & Glassmorphism Highlights**: Dynamic backdrop-blur panels and subtle radial gradients around active buttons or status icons.
*   **Default Dual-Theme Support**: Dark mode by default (high developer appeal) with a matching, highly-readable light mode.

---

## 2. Color Palette & Typography

### HSL Color Tokens

#### 1. Light Mode Theme
*   **Base Background**: `hsl(210, 40%, 98%)` (Soft Slate-50)
*   **Surface Panel**: `hsl(0, 0%, 100%)` (Pure White)
*   **Border Primary**: `hsl(214, 32%, 91%)` (Muted Slate-200)
*   **Text Primary**: `hsl(222, 47%, 11%)` (Deep Navy-900)
*   **Text Secondary**: `hsl(215, 16%, 47%)` (Slate-600)
*   **Text Muted**: `hsl(215, 20%, 65%)` (Slate-400)

#### 2. Dark Mode Theme
*   **Base Background**: `hsl(224, 71%, 4%)` (Deep Space Navy-950)
*   **Surface Panel**: `hsl(222, 47%, 7%)` (Slate Panel-900)
*   **Border Primary**: `hsl(217, 19%, 19%)` (Gray-800)
*   **Text Primary**: `hsl(210, 40%, 98%)` (Off-white-50)
*   **Text Secondary**: `hsl(215, 20%, 75%)` (Light Gray-400)
*   **Text Muted**: `hsl(215, 12%, 50%)` (Gray-600)

#### 3. Semantic & Brand Accents (Shared)
*   **Brand Primary (Indigo)**: `hsl(239, 84%, 67%)` to `hsl(243, 75%, 59%)`
*   **Brand Primary Light (Glow)**: `hsl(239, 84%, 67%, 0.15)`
*   **Success (Emerald)**: `hsl(142, 70%, 45%)` (For copy copies, successful generations)
*   **Warning (Amber)**: `hsl(37, 90%, 50%)` (For usage count warnings >= 8/10)
*   **Danger (Rose)**: `hsl(346, 84%, 61%)` (For limit locks, error states, and profile deletions)

### Typography Hierarchy

*   **Display / Header Font**: *Outfit* (Google Fonts) — A geometric, modern sans-serif with friendly curves, used exclusively for marketing headings, page titles, and hero components.
*   **UI Controls & Body Font**: *Inter* — A highly readable, neutral sans-serif designed for user interfaces, screens, and input fields.
*   **Structured Content Font**: *JetBrains Mono* — A clean, monospaced font used for displaying raw prompt parameters, words to avoid, and variable text tags.

| Level | Size | Weight | Line Height | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Hero)** | 2.50rem (40px) | 800 (Bold) | 1.2 | Outfit | Main titles, landing header |
| **H2 (Page Title)** | 1.75rem (28px) | 700 (Bold) | 1.3 | Outfit | Dashboard & main section titles |
| **H3 (Panel Header)** | 1.25rem (20px) | 600 (Semi) | 1.4 | Outfit | Modals, card headers, setting titles |
| **Body (Regular)** | 0.937rem (15px)| 400 (Reg) | 1.5 | Inter | Descriptions, copy blocks, content |
| **UI Label** | 0.875rem (14px)| 500 (Med) | 1.2 | Inter | Buttons, form tags, sidebar links |
| **Monospace / Tags**| 0.812rem (13px)| 500 (Med) | 1.4 | JetBrains Mono | Excluded terms list, code logs |

---

## 3. Layout Structure & Grid Systems

The layout transitions from a marketing/auth structure to a split-screen dashboard structure once a user logs in.

```
+-----------------------------------------------------------------------------------+
|  [Sidebar Navigation]    |  [Top Header] Breadcrumbs | Usage (4/10) | Theme [x]   |
|  * BrandVoice Logo       |--------------------------------------------------------|
|                          |                                                        |
|  * Dashboard [x]         |  [Main Content Workspace]                              |
|  * Brand Profiles        |  A dynamic flex container wrapping:                    |
|  * Generate Copy         |  - Grid layout (1-3 columns)                           |
|  * Content Library       |  - Action toolbars                                     |
|  * Billing / Upgrade     |  - Split workspace panels                              |
|                          |                                                        |
|  * [Usage Ring/Progress] |                                                        |
+-----------------------------------------------------------------------------------+
```

### Main Page Layout Structures

#### 1. Global Shell Layout
*   **Sidebar**: A fixed 260px wide left sidebar. Includes logo, nav group (links with icons), and a dynamic circular usage ring at the bottom showing remaining free tier generations.
*   **Header**: Sticky top bar (70px height) providing structural context (breadcrumbs), theme switcher (light/dark), and user profile dropdown.
*   **Main Wrapper**: Flexible box filling the remaining width, with centered constraints (`max-w-7xl` or `1280px` max content width) and responsive paddings.

#### 2. Landing Page Layout
*   **Section 1: Hero**: Left-aligned headline and description with a CTA; right-aligned interactive mock editor showing how input profiles change outputs.
*   **Section 2: Feature Matrix**: A 3-column clean grid highlighting Tone Control, Multi-Channel variations, and Prompt Memory.
*   **Section 3: Subscription Panel**: Side-by-side pricing tier cards (Free vs. Pro).

#### 3. Dashboard Analytics Layout
*   **Metrics Grid**: 4 columns (Total Profiles, Generations, Month Usage, Reset Date).
*   **Recent Activity Table**: A chronological timeline view occupying 2/3 width, coupled with a 1/3 sidebar containing "Quick Copy" cards.

#### 4. Brand Profiles Split Workspace
*   **Master-Detail View**: A 30% width left column listing saved profiles, and a 70% width right column displaying details, editable forms, and deletion settings.

#### 5. Generator Panel
*   **Side-by-Side Workspace**:
    *   **Left (Control Panel - 40%)**: Form inputs for profile select, content type select, and custom instruction box.
    *   **Right (Workspace Canvas - 60%)**: Interactive variant viewer. Outputs appear here as clean, copyable card components.

---

## 4. Component Design Specifications

### Cards (Dashboard, Library, Metrics)
*   **Structure**: `1px` border, `12px` border radius (`rounded-xl`), padding `24px` (`p-6`).
*   **Accents**: Subtle top-border gradient of brand indigo to purple for highlight status.
*   **States**:
    *   **Default**: Flat surface, border Slate-200 (light) / Slate-800 (dark).
    *   **Hover**: Translate Y up by 2px, border colors lighten to Slate-300 (light) / Indigo-500 (dark). Shadow transition goes from none to a soft, diffuse glow.

### Buttons

```
  Primary Button        Secondary Outline      Warning Button
+-----------------+   +-----------------+   +-----------------+
|  Generate Copy  |   |   Cancel Edit   |   |   Delete Brand  |
+-----------------+   +-----------------+   +-----------------+
  [Indigo Solid]        [Transparent Slate]   [Rose/Red Solid]
```

*   **Size Scales**:
    *   *Small*: 32px height, 12px horizontal padding.
    *   *Medium*: 44px height, 16px horizontal padding.
    *   *Large*: 56px height, 24px horizontal padding.
*   **Styles**:
    *   **Primary Accent**: Solid indigo background, white text.
        *   *Hover*: Background color shifts to darker indigo, scale is adjusted to `1.02`.
        *   *Active*: Button scales down to `0.98` (clicking depression feedback).
    *   **Secondary Outline**: Transparent background, border Slate-200 (light) / Slate-800 (dark).
        *   *Hover*: Background changes to Slate-100 (light) / Slate-900 (dark).
    *   **Disabled State**: Opacity reduced to `50%`, cursor set to `not-allowed`, all hover effects disabled.

### Forms & Input Fields
*   **Label Layout**: Left-aligned labels placed above the input field, formatted in bold uppercase UI font (11px size).
*   **Default Field**:
    *   Height: 44px.
    *   Border: 1.5px solid. Slate-200 (light) / Slate-800 (dark).
    *   Border Radius: `8px`.
*   **Interactive States**:
    *   *Focus State*: Border changes to Indigo-500. Inner border shadows are simulated via a ring effect (`box-shadow: 0 0 0 4px hsl(239, 84%, 67%, 0.15)`).
    *   *Error State*: Border turns red (`Rose-500`). Small validation text appears below the input in red font.
*   **Chips (Words to Avoid)**: Monospaced tag chips with a trailing 'x' icon. Rendered in a light-red tint in dark mode to imply warning/exclusion.

### Data Tables & Logs
*   **Header**: Non-clickable, thin, light-gray header line with small typography.
*   **Rows**: Alternating background tints. Row height set to 60px to allow vertical breathing room.
*   **Hover Row**: Toggling a row's background to a lighter tint with a smooth `150ms` transition.
*   **Action Column**: Sticky right side containing primary operation icon links (Edit, Copy, Delete).

---

## 5. Responsiveness & Breakpoint Rules

The design uses four main layout breakpoints.

| Breakpoint | Pixel Width | UI Layout Adjustments |
| :--- | :--- | :--- |
| **Mobile** | `< 640px` | - Left sidebar collapses completely into a hamburger menu.<br>- Master-Detail list views collapse into multi-step pages.<br>- Form fields occupy 100% width.<br>- Content generators stack controls above results. |
| **Tablet** | `640px` - `1024px` | - Sidebar collapses to icons-only (width: 70px) to maximize screen space.<br>- Metric cards transition from 4 columns to 2x2 grid.<br>- Split workspaces (e.g., Generator, Profiles) shift to stacked view on larger screens. |
| **Desktop**| `1024px` - `1440px` | - Sidebar locked open (width: 260px).<br>- Metric cards in 4-column layout.<br>- Side-by-side split screen controls enabled (Profiles, Generator). |
| **Widescreen**| `> 1440px` | - Workspace centers with max-width wrapper constraint of `1440px` to prevent layout stretching.<br>- Side margins expand to auto-balance spacing. |

---

## 6. Animation, Transitions & Micro-interactions

Animations are used to make the application feel responsive and alive, providing cues for status transitions and state changes.

### Timing & Easing Functions
*   **Global Transition Duration**: `200ms` (standard for state hover), `150ms` (for ultra-fast response like click reactions).
*   **Easing Curve**: `cubic-bezier(0.4, 0, 0.2, 1)` (industry-standard ease-in-out).

### Core Micro-interactions

#### 1. Content Generation Shimmer (Skeleton Load)
*   **Effect**: Gray blocks mirroring output cards pulse continuously.
*   **Transition**: Background gradients shift from left to right using a repeating infinite animation cycle.
*   ```css
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    ```

#### 2. Copy Confirmation (Glow Trigger)
*   **Trigger**: Clicking the "Copy" icon.
*   **Transition**: The copy button briefly displays a green checkmark icon, while a subtle green glow fades in and out around the card border over `600ms`.

#### 3. Variant Card Entrance
*   **Trigger**: Completion of OpenAI API response.
*   **Transition**: Generated copy cards fade in and translate upward by `12px` sequentially with a staggered delay (`0ms` delay for variant 1, `100ms` for variant 2, `200ms` for variant 3) to guide the user's eye.

---

## 7. Major UX Flows & Sequence Rules

### UX Flow 1: Creating a Brand Profile

```
[Brand Profiles Page] 
       |
       v
Click "New Profile" Button ---> Opens Slide-Over panel (right-to-left animation)
                                      |
                                      v
                                Fill out fields:
                                - Name (Inline character validator)
                                - Tone / Audience / Desc
                                - Words to Avoid (Comma-separated auto-chip transformation)
                                      |
                                      v
                                Click "Save Profile"
                                      |
                                      v
                                Button enters loading state (spinner replaces text)
                                      |
                                      v
                                Profile list updates + Panel slides out (left-to-right)
                                Toast banner pops up: "Brand Profile created successfully!"
```

### UX Flow 2: Content Generation Loop

```
[Content Generator Page]
       |
       v
Select Brand Profile & Content Type ---> Custom instruction field auto-focuses
                                             |
                                             v
                                       Enter instructions
                                       Click "Generate Content"
                                             |
                                             v
               Server Verification Stage (Server-side limits check)
                                             |
                   +-------------------------+-------------------------+
                   |                                                   |
       [Usage Check: Under Limit]                          [Usage Check: Limit Hit]
                   |                                                   |
                   v                                                   v
- Disable Form Inputs & Button                      - API rejects request (403)
- Render Shimmer Skeletons in workspace canvas      - Display Modal: "Free limit reached"
- Fetch response from API                           - Render Pro Upgrade pricing CTA
- Staggered animation entrance of output variants
- Trigger success sound / confetti effect
- Sidebar usage count updates (e.g., 5/10 -> 6/10)
```

---

## 8. Design Consistency Rules (Design System Guardrails)

To prevent visual drift during codebase development, the following guardrails must be followed:

### Spacing & Grid System
*   **8px Base Grid**: All spacing values (margins, padding, gap sizes) must be multiples of 8 (e.g., `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
*   **Padding Integrity**: Card components must maintain a minimum inner padding of `24px` (`p-6`) on desktop and `16px` (`p-4`) on mobile.

### Interactive Element Requirements
*   **Minimum Touch Targets**: All buttons, links, and form selectors must maintain a minimum height/width of `44px` on mobile screens to ensure tap targets are large enough.
*   **Keyboard Focus Focus-Rings**: Interactive elements (inputs, select fields, buttons) must display a clear, high-contrast focus ring when focused via keyboard navigation. Default browser focus outlines are suppressed in favor of custom rings.
*   **Loader Transitions**: Every async user action (saving, updating, generating) must immediately display a loading state (disabled button, text swap, or progress bar) within `100ms` of the interaction to prevent double-clicking.
