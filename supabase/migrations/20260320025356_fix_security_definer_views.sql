/*
  # Fix Security Definer Views

  1. Problem
    - Views `import_stats` and `dealer_overview` use SECURITY DEFINER
    - This means they run with elevated privileges of the view creator
    - This can be a security risk if not needed

  2. Solution
    - Recreate views with SECURITY INVOKER (default, runs with caller's privileges)
    - Grant appropriate access to the views

  3. Views Fixed
    - import_stats - statistics for admin dashboard
    - dealer_overview - dealer aggregation data
*/

-- Drop and recreate import_stats with SECURITY INVOKER
DROP VIEW IF EXISTS import_stats;
CREATE VIEW import_stats WITH (security_invoker = true) AS
SELECT 
  (SELECT count(*) FROM vehicles WHERE is_active = true) AS total_active,
  (SELECT count(DISTINCT merk) FROM vehicles WHERE is_active = true) AS total_merken,
  (SELECT max(started_at) FROM import_logs WHERE status = 'success') AS last_import_at,
  (SELECT vehicles_added FROM import_logs WHERE status = 'success' ORDER BY id DESC LIMIT 1) AS last_added,
  (SELECT vehicles_updated FROM import_logs WHERE status = 'success' ORDER BY id DESC LIMIT 1) AS last_updated;

-- Drop and recreate dealer_overview with SECURITY INVOKER
DROP VIEW IF EXISTS dealer_overview;
CREATE VIEW dealer_overview WITH (security_invoker = true) AS
SELECT 
  aanbieder_naam AS naam,
  aanbieder_plaats AS plaats,
  aanbieder_postcode AS postcode,
  count(*) AS aantal_autos,
  min(verkoopprijs) AS prijs_min,
  max(verkoopprijs) AS prijs_max,
  avg(verkoopprijs) AS prijs_gem
FROM vehicles
WHERE is_active = true AND aanbieder_naam IS NOT NULL
GROUP BY aanbieder_naam, aanbieder_plaats, aanbieder_postcode;

-- Grant access to authenticated users (admins)
GRANT SELECT ON import_stats TO authenticated;
GRANT SELECT ON dealer_overview TO authenticated;
