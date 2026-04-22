/*
  # Fix Multiple Permissive Policies

  1. Problem
    - Tables have both public read and authenticated manage policies
    - When authenticated, both policies apply (permissive OR logic)
    - This is flagged as a security concern

  2. Solution
    - Change public read policies to be for `anon` role only
    - Authenticated users use only their specific policy
    - This provides clearer separation of access

  3. Tables Fixed
    - footer_links
    - vehicle_images  
    - vehicle_opties
    - vehicles
*/

-- footer_links: drop old public policy and recreate for anon only
DROP POLICY IF EXISTS "footer_links_public_read" ON footer_links;
CREATE POLICY "footer_links_anon_read" ON footer_links
  FOR SELECT TO anon USING (true);

-- vehicle_images: drop old public policy and recreate for anon only
DROP POLICY IF EXISTS "Public read images" ON vehicle_images;
CREATE POLICY "Anon read images" ON vehicle_images
  FOR SELECT TO anon USING (true);

-- vehicle_opties: drop old public policy and recreate for anon only
DROP POLICY IF EXISTS "Public read opties" ON vehicle_opties;
CREATE POLICY "Anon read opties" ON vehicle_opties
  FOR SELECT TO anon USING (true);

-- vehicles: drop old public policy and recreate for anon only
DROP POLICY IF EXISTS "Public read vehicles" ON vehicles;
CREATE POLICY "Anon read vehicles" ON vehicles
  FOR SELECT TO anon USING (true);
