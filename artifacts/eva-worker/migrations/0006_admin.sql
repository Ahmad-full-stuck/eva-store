-- Isolated Golden Cosmetics administrator account.
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR REPLACE INTO admins (id, username, password_hash, display_name)
VALUES ('owner', 'admin', 'pbkdf2$100000$864c06e18a2ca90c34f5e8e5ef77c6e6$472af809e3a7487384af95c607e5318ab56630a77ced2a0300c1197012e1e0f9', 'مدير Golden Cosmetics');
