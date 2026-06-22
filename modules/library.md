Module Name: Content Library & History Module

# [Detailed PRD]

## 1. Module Overview
The Content Library module serves as a historical archive for all generated content. It allows users to review, filter, copy, and delete past copy variants. It ensures that generations are stored persistently and are easy to search.

## 2. Features in that Module
*   **Chronological Feed Grid**: A list view showing generations ordered from newest to oldest.
*   **Search & Filter Chips**: Filter generations by Brand Profile or Content Type.
*   **One-Click Clipboard Copying**: Copies selected copy blocks immediately.
*   **Generation Deletion**: Removes logs and text records from the archive.
*   **Quick Re-run Prompt**: Relaunches the generator workspace using the parameters of a past generation.

## 3. User Interactions
*   **Viewing & Filtering History**: User opens `/library` -> feed loads all past outputs -> user clicks the "Cold Email" filter chip -> UI list updates to show only cold email logs.
*   **Copying Output**: User clicks the clipboard icon on any generation card -> card displays a green checkmark indicating successful copying -> text is copied to the user's system clipboard.
*   **Purging History**: User clicks "Delete" on a card -> modal pops up asking to confirm -> clicks confirm -> card fades out of view and is removed from the database.

## 4. Data Requirements
*   **generations Table (Reads & Deletes)**:
    *   Queries read columns: `id`, `profile_id`, `content_type`, `prompt_used`, `output`, `created_at`.
    *   Join with `brand_profiles` to fetch the human-readable brand name (`brand_profiles.name`) for display.

## 5. API Requirements (High Level)
*   `GET /api/generations?page=1&limit=20&profileId=xyz` - Fetch paginated logs belonging to the user.
*   `DELETE /api/generations/[id]` - Delete specific generation entry.

## 6. Edge Cases
*   **Empty State Feed**: If the user has never generated any content, the page must show an empty state banner with a call-to-action button: *"Start generating copy"* that links to the generator workspace.
*   **Orphaned Generations**: If a brand profile is deleted, all generations linked to it are automatically deleted via the database foreign key Cascade constraint.
*   **Clipboard Compatibility**: Fallback copying mechanisms must be implemented for legacy mobile browsers that lack support for the modern `navigator.clipboard.writeText` API.

---

# PRD:
```markdown
## FR-4 Content Library

### Description
Store generated content for future access.

### Features
* Save Generation
* View History
* Edit Content
* Copy Content
* Delete Content
* Regenerate Content

### Acceptance Criteria
* All generations are stored in the database.
* Users can access previous content anytime.

### Table Schemas: generations
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default: `gen_random_uuid()` | Unique generation record identifier. |
| `profile_id` | `UUID` | Foreign Key (`brand_profiles.id`), Cascade Delete | Reference to the brand profile used. |
| `content_type`| `VARCHAR` | Not Null | E.g., "Instagram Caption", "Cold Email". |
| `prompt_used` | `TEXT` | Not Null | The user instructions inputted. |
| `output` | `TEXT` | Not Null | The generated copy outputted by OpenAI. |
| `created_at` | `TIMESTAMP` | Default: `now()` | Generation timestamp. |
```
