CREATE TABLE system (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  category TEXT
);

CREATE TABLE interfaces_with (
  parent_system_id INTEGER REFERENCES system (id),
  child_system_id INTEGER REFERENCES system (id),
  connection_type TEXT,
  directional INTEGER,
  PRIMARY KEY (parent_system_id, child_system_id)
);
