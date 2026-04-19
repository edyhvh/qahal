ALTER TABLE user_locations ADD COLUMN city TEXT;
ALTER TABLE user_locations ADD COLUMN state TEXT;
ALTER TABLE user_locations ADD COLUMN country TEXT;

CREATE INDEX IF NOT EXISTS idx_user_locations_city ON user_locations(city);
CREATE INDEX IF NOT EXISTS idx_user_locations_country ON user_locations(country);
