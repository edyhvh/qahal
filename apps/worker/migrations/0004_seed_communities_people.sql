CREATE TABLE IF NOT EXISTS communities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  default_member_state TEXT NOT NULL DEFAULT 'not_member' CHECK (default_member_state IN ('not_member', 'requested', 'member')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_people (
  id INTEGER PRIMARY KEY,
  community_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  location_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE IF NOT EXISTS community_person_badges (
  person_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  years INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (person_id, kind),
  FOREIGN KEY (person_id) REFERENCES community_people(id)
);

CREATE TABLE IF NOT EXISTS user_community_memberships (
  telegram_id INTEGER NOT NULL,
  community_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_member', 'requested', 'member')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (telegram_id, community_id),
  FOREIGN KEY (telegram_id) REFERENCES users(telegram_id),
  FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE INDEX IF NOT EXISTS idx_communities_city ON communities(city);
CREATE INDEX IF NOT EXISTS idx_community_people_city ON community_people(city);
CREATE INDEX IF NOT EXISTS idx_user_memberships_telegram_id ON user_community_memberships(telegram_id);

INSERT OR IGNORE INTO communities (id, name, city, country, latitude, longitude, default_member_state) VALUES
  (1, 'Emet', 'Buenos Aires', 'Argentina', -34.6037, -58.3816, 'not_member'),
  (2, 'Emunah', 'Buenos Aires', 'Argentina', -34.6080, -58.3900, 'requested'),
  (3, 'Beitlejem', 'Buenos Aires', 'Argentina', -34.6200, -58.4300, 'member'),
  (4, 'Qahal Shalom', 'Mar de Ajo', 'Argentina', -36.7210, -56.6840, 'not_member'),
  (5, 'Miqra Fellowship', 'Mar de Ajo', 'Argentina', -36.7300, -56.7000, 'requested'),
  (6, 'Derekh Emet', 'Mar de Ajo', 'Argentina', -36.7000, -56.6500, 'member'),
  (7, 'Kefa House', 'Lima', 'Peru', -12.0464, -77.0428, 'not_member'),
  (8, 'Miryam Circle', 'Lima', 'Peru', -12.0550, -77.0600, 'requested'),
  (9, 'Shaliach Lima', 'Lima', 'Peru', -12.0800, -77.0100, 'member'),
  (10, 'Bnei Yisrael Madrid', 'Madrid', 'Spain', 40.4168, -3.7038, 'not_member'),
  (11, 'House of Judah', 'Madrid', 'Spain', 40.4280, -3.7200, 'requested'),
  (12, 'Daughters of Zion', 'Madrid', 'Spain', 40.4500, -3.6800, 'member'),
  (13, 'Exile Return House', 'Ciudad de Mexico', 'Mexico', 19.4326, -99.1332, 'not_member'),
  (14, 'Nehemiah Builders', 'Ciudad de Mexico', 'Mexico', 19.4500, -99.1600, 'requested'),
  (15, 'Esther Assembly', 'Ciudad de Mexico', 'Mexico', 19.3900, -99.1100, 'member'),
  (16, 'Prophets Gate', 'Jacksonville', 'USA', 30.3322, -81.6557, 'not_member'),
  (17, 'Deborah Circle', 'Jacksonville', 'USA', 30.3500, -81.6700, 'requested'),
  (18, 'Isaiah Fellowship', 'Jacksonville', 'USA', 30.3100, -81.6200, 'member');

INSERT OR IGNORE INTO community_people (id, community_id, name, city, country, location_key) VALUES
  (101, 1, 'Ruth bat Naomi', 'Buenos Aires', 'Argentina', 'buenos-aires'),
  (102, 1, 'Boaz ben Salmon', 'Buenos Aires', 'Argentina', 'buenos-aires'),
  (201, 4, 'Abraham ben Terah', 'Mar de Ajo', 'Argentina', 'mar-de-ajo'),
  (202, 4, 'Sarah bat Haran', 'Mar de Ajo', 'Argentina', 'mar-de-ajo'),
  (301, 7, 'Peter', 'Lima', 'Peru', 'lima'),
  (302, 7, 'John', 'Lima', 'Peru', 'lima'),
  (401, 10, 'Reuben', 'Madrid', 'Spain', 'madrid'),
  (402, 10, 'Judah', 'Madrid', 'Spain', 'madrid'),
  (501, 13, 'Daniel', 'Ciudad de Mexico', 'Mexico', 'ciudad-de-mexico'),
  (502, 13, 'Esther', 'Ciudad de Mexico', 'Mexico', 'ciudad-de-mexico'),
  (601, 16, 'Isaiah', 'Jacksonville', 'USA', 'jacksonville'),
  (602, 16, 'Jeremiah', 'Jacksonville', 'USA', 'jacksonville');

INSERT OR IGNORE INTO community_person_badges (person_id, kind, label, years) VALUES
  (101, 'emunah', 'Emunah', NULL),
  (101, 'years', 'Years in Emunah', 2),
  (101, 'hebrew-student', 'Hebrew Student', NULL),
  (102, 'emunah', 'Emunah', NULL),
  (102, 'kehilah', 'Kehilah', NULL),
  (102, 'messenger', 'Messenger', NULL),
  (201, 'emunah', 'Emunah', NULL),
  (201, 'years', 'Years in Emunah', 5),
  (202, 'kehilah', 'Kehilah', NULL),
  (202, 'hebrew-teacher', 'Hebrew Teacher', NULL),
  (301, 'emunah', 'Emunah', NULL),
  (301, 'messenger', 'Messenger', NULL),
  (301, 'years', 'Years in Emunah', 8),
  (302, 'kehilah', 'Kehilah', NULL),
  (302, 'years', 'Years in Emunah', 4),
  (401, 'emunah', 'Emunah', NULL),
  (401, 'kehilah', 'Kehilah', NULL),
  (402, 'messenger', 'Messenger', NULL),
  (402, 'years', 'Years in Emunah', 6),
  (501, 'emunah', 'Emunah', NULL),
  (501, 'years', 'Years in Emunah', 9),
  (502, 'messenger', 'Messenger', NULL),
  (502, 'kehilah', 'Kehilah', NULL),
  (601, 'emunah', 'Emunah', NULL),
  (601, 'years', 'Years in Emunah', 7),
  (602, 'kehilah', 'Kehilah', NULL),
  (602, 'messenger', 'Messenger', NULL);

INSERT OR IGNORE INTO users (telegram_id, first_name, city, language_code, onboarding_completed) VALUES
  (900001, 'Local Member', 'Buenos Aires', 'en', 1),
  (900002, 'Local Requested', 'Lima', 'en', 1),
  (900003, 'Local NotMember', 'Madrid', 'en', 1);

INSERT OR IGNORE INTO user_community_memberships (telegram_id, community_id, status) VALUES
  (900001, 3, 'member'),
  (900001, 2, 'requested'),
  (900002, 8, 'requested'),
  (900003, 10, 'not_member');
