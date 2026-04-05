# Supabase Backend Setup

## 1) Create a Supabase project
- Go to Supabase dashboard.
- Create a new project and wait for database provisioning.

## 2) Run schema
- Open SQL Editor in Supabase.
- Paste and run [supabase/schema.sql](../supabase/schema.sql).

## 3) Configure env vars
- Copy [.env.local.example](../.env.local.example) to .env.local.
- Fill values from Supabase Project Settings > API.

Required keys:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## 4) Start app
- Run: npm run dev

## 5) Test first API route
- GET /api/categories
- POST /api/categories

Example payload for POST:
{
  "category_name": "Financial",
  "category_desc": "Budget vs Value"
}

## Notes
- The current SQL includes open development RLS policies (allow all).
- Tighten policies before production.
- Do not expose SUPABASE_SERVICE_ROLE_KEY to client-side code.
