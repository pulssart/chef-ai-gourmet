-- Create a table for storing saved recipes
create table public.saved_recipes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    recipe_name text not null,
    ingredients jsonb not null,
    instructions jsonb not null,
    prep_time text,
    difficulty text,
    image text,
    calories integer,
    proteines integer,
    glucides integer,
    lipides integer,
    nutrition_details jsonb,
    tags text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.saved_recipes enable row level security;

-- Create policy to allow users to read their own recipes
create policy "Users can view their own recipes"
    on public.saved_recipes
    for select
    using (auth.uid() = user_id);

-- Create policy to allow users to insert their own recipes
create policy "Users can insert their own recipes"
    on public.saved_recipes
    for insert
    with check (auth.uid() = user_id);

-- Create policy to allow users to update their own recipes
create policy "Users can update their own recipes"
    on public.saved_recipes
    for update
    using (auth.uid() = user_id);

-- Create policy to allow users to delete their own recipes
create policy "Users can delete their own recipes"
    on public.saved_recipes
    for delete
    using (auth.uid() = user_id);

-- Create policy to allow anyone to view recipes (for the homepage)
create policy "Anyone can view recipes"
    on public.saved_recipes
    for select
    using (true);

-- Create function to get random recipes
create or replace function public.get_random_recipes(limit_count integer)
returns setof public.saved_recipes
language sql
as $$
  select *
  from public.saved_recipes
  order by random()
  limit limit_count;
$$;

-- Create index on tags for better performance
CREATE INDEX idx_saved_recipes_tags ON public.saved_recipes USING GIN (tags); 