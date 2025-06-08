CREATE TABLE system (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  category TEXT,
  parent_system_id INTEGER REFERENCES system (id) NULL
);

CREATE TABLE interfaces_with (
  first_system_id INTEGER REFERENCES system (id),
  second_system_id INTEGER REFERENCES system (id),
  connection_type TEXT,
  directional INTEGER,
  PRIMARY KEY (first_system_id, second_system_id)
);
