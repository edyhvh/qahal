ALTER TABLE communities ADD COLUMN owner_telegram_id INTEGER;

CREATE TABLE IF NOT EXISTS community_meeting_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  community_id INTEGER NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  time_minutes INTEGER NOT NULL CHECK (time_minutes BETWEEN 0 AND 1439),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (community_id, weekday, time_minutes),
  FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE INDEX IF NOT EXISTS idx_community_meeting_slots_community_id ON community_meeting_slots(community_id);
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(lower(username));

UPDATE communities
SET owner_telegram_id = (
  SELECT m.telegram_id
  FROM user_community_memberships m
  WHERE m.community_id = communities.id
    AND m.status = 'member'
  ORDER BY m.updated_at DESC
  LIMIT 1
)
WHERE owner_telegram_id IS NULL;
