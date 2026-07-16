export async function getBookmarks(db) {
  const { results: bookmarks } = await db.prepare(`
    SELECT id, name, url, hostname, page_title, description, site_name, favicon_url, image_url, created_at, updated_at
    FROM bookmarks ORDER BY created_at DESC
  `).all();
  const { results: rows } = await db.prepare(`
    SELECT bt.bookmark_id, t.id, t.label, t.name
    FROM bookmark_tags bt JOIN tags t ON t.id = bt.tag_id
    ORDER BY t.label COLLATE NOCASE
  `).all();
  const tagsByBookmark = new Map();
  for (const row of rows) {
    const tags = tagsByBookmark.get(row.bookmark_id) || [];
    tags.push({ id: row.id, label: row.label, name: row.name });
    tagsByBookmark.set(row.bookmark_id, tags);
  }
  return bookmarks.map((bookmark) => ({ ...bookmark, tags: tagsByBookmark.get(bookmark.id) || [] }));
}
