Module Name: Brand Profile Management Module

# [Detailed PRD]

## 1. Module Overview
The Brand Profile Management module provides a CRUD (Create, Read, Update, Delete) engine that allows users to create and manage their brand personas. It handles storing specific traits (such as tone, target audience, product descriptions, and negative words) that shape the generative logic of the AI content generator.

## 2. Features in that Module
*   **Create Profile**: Multi-field form input to save a new brand persona.
*   **View Profile**: Detailed preview cards showing all parameters of active profiles.
*   **Edit Profile**: Update saved attributes (e.g. changing audience demographics or tone directives).
*   **Delete Profile**: Remove a brand profile from the database, cascading deletion to all generations linked to it.
*   **Avoid-Words Tagging**: Auto-chip formatting that parses comma-separated negative keywords.

## 3. User Interactions
*   **Creating a Profile**: User navigates to the Brand Profiles panel -> clicks "+ Add Brand" -> fills in fields (Brand Name, Tone, Target Audience, Product Description, Words to Avoid) -> clicks "Save Brand" -> form closes and list refreshes with a success toast notification.
*   **Editing a Profile**: User clicks the "Edit" button next to a profile card -> form populates with current database values -> user edits target audience -> clicks "Update" -> updates immediately in database.
*   **Deleting a Profile**: User clicks the "Delete" trash icon -> confirmation modal appears warning: *"Warning: This will permanently delete this profile and all content generated using this profile."* -> user clicks "Confirm Delete" -> records are removed.

## 4. Data Requirements
*   **brand_profiles Table**:
    *   `id`: `UUID` (Primary Key, default: UUID generation).
    *   `user_id`: `UUID` (Foreign Key referencing `users.id`, Cascade Delete).
    *   `name`: `VARCHAR(255)` (Not Null, brand name).
    *   `tone`: `TEXT` (Not Null, description of brand voice).
    *   `audience`: `TEXT` (Not Null, target audience characteristics).
    *   `product_desc`: `TEXT` (Not Null, core product specifications).
    *   `avoid_words`: `TEXT` (Nullable, comma-separated list of terms).
    *   `created_at`: `TIMESTAMP` (Default: `now()`).

## 5. API Requirements (High Level)
*   `GET /api/profiles` - Fetch all brand profiles belonging to the logged-in user.
*   `POST /api/profiles` - Create a brand profile (validates fields).
*   `PUT /api/profiles/[id]` - Update brand profile by ID (validates ownership).
*   `DELETE /api/profiles/[id]` - Delete profile and dependencies by ID (validates ownership).

## 6. Edge Cases
*   **Quota Limit Hit**: The Free Tier limits users to **5 active brand profiles**. If a user has 5 profiles and clicks "+ Add Brand", the app must block the creation page and prompt them to upgrade to the Pro plan or delete an existing profile.
*   **Deleting a Profile in Use**: If a user deletes a brand profile that is currently active in the generator tab selection, the generator tab must dynamically clear its selection to avoid system errors.
*   **Database Invalidation**: If the user inputs special characters or excessively long descriptions (over 10,000 characters), the API must throw a `422 Unprocessable Entity` validation error before DB insert.

---

# PRD:
```markdown
## FR-2 Brand Profile Management

### Description
Users can create and manage brand profiles.

### Fields
* Brand Name
* Tone
* Target Audience
* Product Description
* Words To Avoid

### Operations
* Create Profile
* View Profile
* Edit Profile
* Delete Profile

### Acceptance Criteria
* Users can manage multiple brand profiles.
* Brand information is saved in the database.

### Table Schemas: brand_profiles
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default: `gen_random_uuid()` | Unique profile identifier. |
| `user_id` | `UUID` | Foreign Key (`users.id`), Cascade Delete | Owner of the brand profile. |
| `name` | `VARCHAR` | Not Null, Length <= 255 | Name of the brand (e.g., "Nike"). |
| `tone` | `TEXT` | Not Null | Description of the brand tone. |
| `audience` | `TEXT` | Not Null | Target audience definition. |
| `product_desc`| `TEXT` | Not Null | Core product/service description. |
| `avoid_words` | `TEXT` | Nullable | Comma-separated list of restricted words. |
| `created_at` | `TIMESTAMP` | Default: `now()` | Profile creation date. |
```
