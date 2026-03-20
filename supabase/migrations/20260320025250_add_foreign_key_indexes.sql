/*
  # Add Missing Foreign Key Indexes

  1. New Indexes
    - `idx_vehicle_images_vehicle_id` on `vehicle_images(vehicle_id)` for FK performance
    - `idx_vehicle_opties_vehicle_id` on `vehicle_opties(vehicle_id)` for FK performance
    - `idx_whatsapp_conversations_lead_id` on `whatsapp_conversations(lead_id)` for FK performance
    - `idx_whatsapp_messages_conversation_id` on `whatsapp_messages(conversation_id)` for FK performance

  2. Important Notes
    - These indexes improve JOIN and DELETE CASCADE performance
    - Foreign keys without indexes can cause full table scans
*/

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id 
  ON vehicle_images(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_opties_vehicle_id 
  ON vehicle_opties(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_lead_id 
  ON whatsapp_conversations(lead_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation_id 
  ON whatsapp_messages(conversation_id);
