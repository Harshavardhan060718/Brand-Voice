Module Name: Usage Tracking, Dashboard & Billing Module

# [Detailed PRD]

## 1. Module Overview
This module tracks and limits usage on the Free Tier (10 generations/month), calculates dashboard KPIs, handles subscription upgrades using Stripe Test Mode, and manages monthly usage resets.

## 2. Features in that Module
*   **Usage Database Registry**: Keeps a running tally of successful content generations per user per calendar month.
*   **Dashboard KPI Summary**: Computes stats for profiles count, total generations, remaining usage, and active subscription state.
*   **Zero-Trust Limit Enforcer**: Backend check that rejects API generations if user count >= 10.
*   **Stripe checkout portal integration**: Redirects users to Stripe checkout to upgrade to the Pro tier (unlimited generations).
*   **Monthly Counter Reset Scheduler**: Automatically clears limits or rolls counts over to a new record on the first of each month.

## 3. User Interactions
*   **Viewing Dashboard**: User opens `/dashboard` -> dashboard displays total brand profiles, total generations, and a progress bar showing remaining usage (e.g. *"7 / 10 generations remaining"*).
*   **Upgrade Trigger**: User reaches 10/10 generations -> clicks "Generate Copy" -> modal blocks input and shows message: *"Monthly free limit reached. Upgrade to Pro for unlimited access."* -> clicks "Upgrade Now".
*   **Checkout & Return**: Redirects to Stripe Checkout page -> user inputs test credit card -> clicks Pay -> redirects back to BrandVoice with a success notification and a "Pro Plan" badge.

## 4. Data Requirements
*   **usage Table**:
    *   `user_id`: `UUID` (Composite Primary Key, FK referencing `users.id`).
    *   `month`: `VARCHAR` (Composite Primary Key, format `YYYY-MM`).
    *   `count`: `INTEGER` (Default: `0`).

## 5. API Requirements (High Level)
*   `GET /api/dashboard-metrics` - Fetch summary counters for dashboard.
*   `POST /api/billing/checkout` - Create a Stripe checkout session for the user and return the redirect URL.
*   `POST /api/billing/webhook` - Stripe webhooks that intercept payment successes and update user subscription metadata in database.

## 6. Edge Cases
*   **Race Conditions**: If a user fires multiple rapid requests simultaneously to bypass the 10/10 limit, the backend API must run a transaction lock on the `usage` table to verify current count before executing the AI generation.
*   **Stripe Webhook Delivery Failure**: If a payment goes through but Stripe webhooks fail to reach the server, the user's account might not get updated. The system must support manual validation or verify credentials upon session refresh.
*   **Month Rollover Sync**: If a user makes a request at the end of a month (e.g. 11:59 PM on May 31), the server must calculate the date using UTC time to determine if it belongs to the current month or the next.

---

# PRD:
```markdown
## FR-5 Usage Tracking

### Description
Track monthly content generation usage.

### Free Plan Limit
10 generations per month.

### Acceptance Criteria
* Every successful generation increases usage count.
* Usage resets monthly.
* Users cannot exceed the limit.

## FR-6 Dashboard

### Description
Provide account overview.

### Dashboard Metrics
* Total Brand Profiles
* Total Generations
* Monthly Usage
* Remaining Generations
* Recent Activity

### Acceptance Criteria
* Dashboard data is updated in real-time.

## 9. Security & Limit Enforcement (Free Tier)

> [!IMPORTANT]
> **Zero Trust Frontend Policy**: The client-side dashboard should disable buttons and display error states for user convenience, but **only backend database checks** dictate whether a request is authorized to run.

### Table Schemas: usage
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | Composite Primary Key, FK (`users.id`) | Reference to the user. |
| `month` | `VARCHAR` | Composite Primary Key (Format: `YYYY-MM`) | The active billing month. |
| `count` | `INTEGER` | Default: `0`, Check (`count` >= 0) | Number of generations executed. |
```
