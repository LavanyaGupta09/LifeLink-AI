-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Ensure `ambulances` table has a geography column for location
ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- Update existing lat/lng columns into the location column (if any exist)
-- UPDATE ambulances SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS idx_ambulances_location ON ambulances USING GIST (location);

-- 2. Create RPC function for fetching nearby ambulances
-- This allows the frontend to call `supabase.rpc('get_nearby_ambulances', { lat, lng, radius_meters })`
CREATE OR REPLACE FUNCTION get_nearby_ambulances(
  lat float,
  lng float,
  radius_meters float DEFAULT 15000
)
RETURNS TABLE (
  id uuid,
  driver_name text,
  vehicle_type text,
  status text,
  distance_meters float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.driver_name,
    a.vehicle_type,
    a.status,
    ST_Distance(a.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_meters
  FROM ambulances a
  WHERE ST_DWithin(a.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
  ORDER BY distance_meters ASC;
END;
$$;

-- 3. Ensure `user_profiles` (for blood donors) has geography
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles USING GIST (location);

-- 4. Create RPC function for fetching nearby blood donors
CREATE OR REPLACE FUNCTION get_nearby_blood_donors(
  lat float,
  lng float,
  search_blood_group text DEFAULT NULL,
  radius_meters float DEFAULT 15000
)
RETURNS TABLE (
  id uuid,
  full_name text,
  blood_group text,
  distance_meters float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.blood_group,
    ST_Distance(u.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_meters
  FROM user_profiles u
  WHERE 
    u.is_blood_donor = true 
    AND ST_DWithin(u.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
    AND (search_blood_group IS NULL OR u.blood_group = search_blood_group)
  ORDER BY distance_meters ASC;
END;
$$;
