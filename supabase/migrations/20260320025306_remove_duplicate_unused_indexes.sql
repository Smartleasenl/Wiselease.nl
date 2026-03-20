/*
  # Remove Duplicate and Unused Indexes

  1. Duplicate Indexes Removed
    - Keeping `vehicles_is_active_idx`, dropping `idx_vehicles_is_active`
    - Keeping `vehicles_merk_idx`, dropping `idx_vehicles_merk`
    - Keeping `vehicles_model_idx`, dropping `idx_vehicles_model`
    - Keeping `vehicles_search_idx`, dropping `idx_vehicles_search`

  2. Unused Indexes Removed
    - `idx_leads_vehicle_id` - not used in queries
    - `idx_vehicles_maandprijs` - not used in queries

  3. Important Notes
    - Removing unused indexes improves write performance
    - Duplicate indexes waste storage and slow down inserts/updates
*/

DROP INDEX IF EXISTS idx_vehicles_is_active;
DROP INDEX IF EXISTS idx_vehicles_merk;
DROP INDEX IF EXISTS idx_vehicles_model;
DROP INDEX IF EXISTS idx_vehicles_search;

DROP INDEX IF EXISTS idx_leads_vehicle_id;
DROP INDEX IF EXISTS idx_vehicles_maandprijs;
