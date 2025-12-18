-- Create a table for public profiles using the user ID from auth.users
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text check (role in ('supplier', 'restaurant')) not null,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);
