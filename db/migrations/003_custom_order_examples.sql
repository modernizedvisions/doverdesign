-- Adds message metadata fields + custom order examples table
ALTER TABLE messages ADD COLUMN type TEXT NOT NULL DEFAULT 'message';
ALTER TABLE messages ADD COLUMN category_id TEXT;
ALTER TABLE messages ADD COLUMN category_name TEXT;
ALTER TABLE messages ADD COLUMN inspo_example_id TEXT;
ALTER TABLE messages ADD COLUMN inspo_title TEXT;
ALTER TABLE messages ADD COLUMN inspo_image_url TEXT;

CREATE TABLE IF NOT EXISTS custom_order_examples (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
