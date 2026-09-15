-- Run this in Supabase SQL Editor, after poles/hazards tables already exist.
-- Requires the postgis extension (already enabled).

-- Farm / land area boundaries, captured as a closed polygon.
CREATE TABLE IF NOT EXISTS farm_areas (
    id SERIAL PRIMARY KEY,
    area_name TEXT,
    description TEXT,
    submitted_by TEXT,           -- authenticated user's id/email
    point_count INT,             -- how many vertices were captured, for reference
    status TEXT DEFAULT 'pending_review',
    server_received_at TIMESTAMP DEFAULT now(),
    geom GEOMETRY(Polygon, 4326)
);

-- Cable / fiber line routes, captured as a line (ordered list of points).
CREATE TABLE IF NOT EXISTS cable_lines (
    id SERIAL PRIMARY KEY,
    line_name TEXT,
    line_type TEXT,              -- 'cable' | 'fiber' | 'other'
    description TEXT,
    submitted_by TEXT,
    point_count INT,
    status TEXT DEFAULT 'pending_review',
    server_received_at TIMESTAMP DEFAULT now(),
    geom GEOMETRY(LineString, 4326)
);

-- Refresh PostgREST's schema cache after creating new tables so the API
-- picks them up right away instead of waiting for its normal refresh cycle.
NOTIFY pgrst, 'reload schema';

-- Note on auth: Supabase Auth (email/password) is enabled by default on
-- every Supabase project -- no extra setup needed beyond using the
-- supabase-js client's signUp()/signInWithPassword() from the mobile app.
-- The backend verifies each request's access token via Supabase's own
-- auth.get_user() call (see backend/services/auth.py), so no separate
-- users table is required for this pilot.
