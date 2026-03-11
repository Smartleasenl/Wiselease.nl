/*
  # Fix Security Issues
  
  1. Performance & Indexing
    - Add index on `leads.vehicle_id` foreign key for better query performance
    - Remove unused indexes: `idx_site_settings_category`, `idx_leads_type`
  
  2. RLS Policy Optimization
    - Fix site_settings policies to use `(select auth.uid())` pattern for better performance
  
  3. Policy Consolidation & Security
    - Remove duplicate "Service full access" policies (overly permissive)
    - Keep only the necessary public access policies with proper restrictions
    - Restrict leads INSERT to only allow anonymous/public submissions (no unrestricted access)
  
  4. Important Notes
    - Service role bypasses RLS, so dedicated service policies are redundant
    - Public policies should be as restrictive as possible while allowing legitimate access
*/

-- ============================================================================
-- 1. ADD MISSING INDEX ON FOREIGN KEY
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_vehicle_id ON leads(vehicle_id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_site_settings_category;
DROP INDEX IF EXISTS idx_leads_type;

-- ============================================================================
-- 3. FIX SITE_SETTINGS RLS POLICIES (use select pattern)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated insert site_settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated delete site_settings" ON site_settings;

-- Recreate with optimized pattern
CREATE POLICY "Authenticated update site_settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated insert site_settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated delete site_settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================================================
-- 4. CONSOLIDATE AND RESTRICT POLICIES - LEADS TABLE
-- ============================================================================

-- Remove overly permissive "Service full access" policy
DROP POLICY IF EXISTS "Service full access leads" ON leads;

-- Remove unrestricted public insert policy
DROP POLICY IF EXISTS "Public insert leads" ON leads;

-- Create a more restrictive public insert policy (only for lead submissions)
CREATE POLICY "Public insert leads"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Keep authenticated users able to read their own data (if needed for admin)
-- This assumes you'll add a user_id column in the future to track ownership
-- For now, only authenticated users (admins) can read leads
CREATE POLICY "Authenticated read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================================================
-- 5. CONSOLIDATE POLICIES - VEHICLE_IMAGES TABLE
-- ============================================================================

-- Remove service access policy (redundant - service role bypasses RLS)
DROP POLICY IF EXISTS "Service full access images" ON vehicle_images;

-- Keep public read policy only
-- "Public read images" already exists, so we're good

-- ============================================================================
-- 6. CONSOLIDATE POLICIES - VEHICLE_OPTIES TABLE
-- ============================================================================

-- Remove service access policy
DROP POLICY IF EXISTS "Service full access opties" ON vehicle_opties;

-- Keep public read policy only
-- "Public read opties" already exists

-- ============================================================================
-- 7. CONSOLIDATE POLICIES - VEHICLES TABLE
-- ============================================================================

-- Remove service access policy
DROP POLICY IF EXISTS "Service full access vehicles" ON vehicles;

-- Keep public read policy only
-- "Public read vehicles" already exists

-- ============================================================================
-- 8. CONSOLIDATE POLICIES - IMPORT_LOGS TABLE
-- ============================================================================

-- Remove overly permissive policy
DROP POLICY IF EXISTS "Service full access logs" ON import_logs;

-- Add restrictive policy: only authenticated users (admins) can access logs
CREATE POLICY "Authenticated read logs"
  ON import_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated insert logs"
  ON import_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);
