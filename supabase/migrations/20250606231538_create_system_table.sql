CREATE TABLE system (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  category TEXT
);

alter table system enable row level security;

CREATE TABLE interfaces_with (
  parent_system_id INTEGER REFERENCES system (id),
  child_system_id INTEGER REFERENCES system (id),
  connection_type TEXT,
  directional INTEGER,
  PRIMARY KEY (parent_system_id, child_system_id)
);

alter table interfaces_with enable row level security;

-- Create Policies
create policy "public can read system"
on public.system
for select to anon
using (true);

create policy "public can insert system"
on public.system
for insert to anon
with check (true);

create policy "public can delete system"
on public.system
for delete to anon
using (true);

create policy "public can read interfaces_with"
on public.interfaces_with
for select to anon
using (true);

create policy "public can insert interfaces_with"
on public.interfaces_with
for insert to anon
with check (true);

create policy "public can delete interfaces_with"
on public.system
for delete to anon
using (true);
