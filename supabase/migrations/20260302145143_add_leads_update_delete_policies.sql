/*
  # Add Missing UPDATE and DELETE Policies for Leads Table
  
  1. Problem
    - Leads table was missing UPDATE and DELETE policies
    - Admin users couldn't update lead status or delete leads
    - This caused the admin leads page to fail when trying to update statuses
  
  2. Changes
    - Add UPDATE policy for authenticated users (admins)
    - Add DELETE policy for authenticated users (admins)
    - Both policies use the optimized (select auth.uid()) pattern
  
  3. Security
    - Only authenticated users (admins) can update or delete leads
    - Anonymous users can only insert (submit) leads
*/

-- Add UPDATE policy for authenticated users (admins)
CREATE POLICY "Authenticated update leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Add DELETE policy for authenticated users (admins)
CREATE POLICY "Authenticated delete leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);
