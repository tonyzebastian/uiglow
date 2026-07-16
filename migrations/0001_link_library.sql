CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  hostname TEXT NOT NULL,
  page_title TEXT,
  description TEXT,
  site_name TEXT,
  favicon_url TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);
