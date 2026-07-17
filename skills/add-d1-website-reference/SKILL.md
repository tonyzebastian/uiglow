---
name: add-d1-website-reference
description: Add a curated website to UiGlow's Cloudflare D1 Link Library. Use when asked to save a design, interaction, portfolio, or other web reference in the library, including tags and a concise editorial note.
---

# Add D1 Website Reference

Use the Cloudflare MCP for every live D1 read and write. Always use a direct D1 query through the Cloudflare API MCP before adding a reference and again to verify it. Do not use local SQLite, a migration command, or guessed database identifiers for the live update.

## Workflow

1. Use the Cloudflare API MCP search tool to confirm the D1 query endpoint if needed.
2. List the account's D1 databases through the Cloudflare API MCP. Select the database named `uiglow-bookmarks` unless the user directs otherwise.
3. Before any write, make one direct D1 preflight query that checks `bookmarks` for every requested URL and retrieves existing `tags` for every required tag name. Reuse the returned tag IDs; never assume a stable ID from a tag name. Preserve existing bookmark records. Do not infer the database state from dashboard metadata or local migrations.
4. Retrieve the page's public metadata and look for `<meta property="og:image">`. Resolve a relative image URL against the canonical page URL. Store the resulting HTTPS URL in `image_url` when it is valid; otherwise store `NULL`. Do not invent a preview URL.
5. Create the bookmark, required tags, and `bookmark_tags` relations with an idempotent D1 batch query. Include `image_url` in the bookmark insert. Use stable UUIDs or URL-derived IDs, `INSERT OR IGNORE` for tags and relations, and only update an existing bookmark after confirming the user wants its editorial fields changed.
6. Store the canonical HTTPS URL, hostname, a short title, and a compact note in the user's voice. Use lowercase kebab-case tag names and readable labels.
7. Verify the saved bookmark, its tags, and `image_url` with a final direct D1 `SELECT` query. Report the title, URL, tags, and whether an OG image was saved.

Use direct Cloudflare MCP D1 queries as the only persistence mechanism. Do not create or update repository migrations for website references unless the user explicitly asks for a database bootstrap file.
