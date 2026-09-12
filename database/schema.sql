-- Run this in Supabase SQL Editor.
-- Requires the postgis extension enabled (Database -> Extensions -> postgis).

CREATE TABLE IF NOT EXISTS poles (
    id SERIAL PRIMARY KEY,
    pole_code TEXT,
    condition TEXT,
    status TEXT DEFAULT 'pending_review',        -- pending_review | verified | flagged | rejected
    accuracy_m FLOAT,
    submitted_by TEXT,
    device_timestamp TIMESTAMP,
    server_received_at TIMESTAMP DEFAULT now(),
    photo_url TEXT,
    geom GEOMETRY(Point, 4326)
);

-- Sample rows for testing in QGIS (Addis Ababa area)
INSERT INTO poles (pole_code, condition, status, accuracy_m, submitted_by, device_timestamp, geom)
VALUES
('P-001', 'good', 'verified', 4.2, 'worker_01', now() - interval '2 days',
 ST_SetSRID(ST_MakePoint(38.7469, 9.0192), 4326)),
('P-002', 'leaning', 'pending_review', 12.5, 'worker_02', now() - interval '1 day',
 ST_SetSRID(ST_MakePoint(38.7612, 9.0301), 4326)),
('P-003', 'good', 'verified', 3.8, 'worker_01', now() - interval '3 hours',
 ST_SetSRID(ST_MakePoint(38.7325, 9.0089), 4326));

-- Quick check
SELECT id, pole_code, status, ST_AsText(geom) FROM poles;
