-- Forms table
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  schema jsonb not null default '[]',
  theme text not null default 'default',
  slug text unique not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forms enable row level security;

create policy "Users can manage their own forms"
  on public.forms
  for all
  using (auth.uid() = user_id);

create policy "Public can read published forms"
  on public.forms
  for select
  using (is_published = true);

-- Responses table
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.forms(id) on delete cascade not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.responses enable row level security;

create policy "Form owners can read responses"
  on public.responses
  for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = responses.form_id
      and forms.user_id = auth.uid()
    )
  );

create policy "Anyone can insert responses to published forms"
  on public.responses
  for insert
  with check (
    exists (
      select 1 from public.forms
      where forms.id = responses.form_id
      and forms.is_published = true
    )
  );

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Auto-create subscription on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger forms_updated_at
  before update on public.forms
  for each row execute procedure public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Response count function (avoids N+1)
create or replace function public.get_form_response_counts(form_ids uuid[])
returns table(form_id uuid, count bigint) as $$
  select form_id, count(*) as count
  from public.responses
  where form_id = any(form_ids)
  group by form_id;
$$ language sql security definer;
