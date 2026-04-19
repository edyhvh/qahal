ALTER TABLE users ADD COLUMN birth_date TEXT;

CREATE TABLE IF NOT EXISTS user_onboarding_answers (
  telegram_id INTEGER NOT NULL,
  question_key TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (telegram_id, question_key),
  FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
);

CREATE TABLE IF NOT EXISTS user_badges (
  telegram_id INTEGER NOT NULL,
  badge_key TEXT NOT NULL,
  badge_label TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (telegram_id, badge_key),
  FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_telegram_id ON user_badges(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_answers_telegram_id ON user_onboarding_answers(telegram_id);
