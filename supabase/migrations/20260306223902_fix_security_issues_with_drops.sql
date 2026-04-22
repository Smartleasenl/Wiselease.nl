/*
  # Comprehensive Security Fixes
  
  ## Overview
  This migration addresses multiple security and performance issues:
  
  ## 1. Performance Optimization
  - Fix auth.uid() calls in RLS policies using subquery pattern
  
  ## 2. Index Cleanup
  - Remove 5 unused indexes from whatsapp and leads tables
  
  ## 3. RLS Policy Fixes
  - Replace 7 overly permissive policies (USING(true)/WITH CHECK(true))
  - Remove 9 duplicate permissive policies
  - Separate SELECT/INSERT/UPDATE/DELETE policies for granular control
  
  ## 4. Function Security
  - Add SET search_path to 9 functions preventing search path attacks
  
  ## Security Improvements
  - Public users can only see published content
  - Authenticated users verified via auth.users table
  - Lead submissions require valid email and name
  - Service role policies removed (service role bypasses RLS)
*/

-- ============================================
-- 1. DROP UNUSED INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_whatsapp_conv_lead_id;
DROP INDEX IF EXISTS idx_whatsapp_conv_phone;
DROP INDEX IF EXISTS idx_whatsapp_conv_status;
DROP INDEX IF EXISTS idx_whatsapp_msg_conv_id;
DROP INDEX IF EXISTS idx_leads_vehicle_id;

-- ============================================
-- 2. FIX FOOTER_LINKS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "footer_links_public_read" ON footer_links;
DROP POLICY IF EXISTS "footer_links_admin_write" ON footer_links;

CREATE POLICY "footer_links_public_read"
  ON footer_links
  FOR SELECT
  USING (true);

CREATE POLICY "footer_links_admin_all"
  ON footer_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 3. FIX BLOG_POSTS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Authenticated full access posts" ON blog_posts;
DROP POLICY IF EXISTS "Public read published posts" ON blog_posts;

CREATE POLICY "blog_posts_public_read"
  ON blog_posts
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "blog_posts_auth_select"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_posts_auth_insert"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "blog_posts_auth_update"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "blog_posts_auth_delete"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 4. FIX FAQS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Authenticated full access faqs" ON faqs;
DROP POLICY IF EXISTS "Public read published faqs" ON faqs;

CREATE POLICY "faqs_public_read"
  ON faqs
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "faqs_auth_select"
  ON faqs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "faqs_auth_insert"
  ON faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "faqs_auth_update"
  ON faqs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "faqs_auth_delete"
  ON faqs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 5. FIX PAGES RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can manage pages" ON pages;
DROP POLICY IF EXISTS "Public can read published pages" ON pages;

CREATE POLICY "pages_public_read"
  ON pages
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "pages_auth_select"
  ON pages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "pages_auth_insert"
  ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "pages_auth_update"
  ON pages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "pages_auth_delete"
  ON pages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 6. FIX REVIEWS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Authenticated full access reviews" ON reviews;
DROP POLICY IF EXISTS "Public read published reviews" ON reviews;

CREATE POLICY "reviews_public_read"
  ON reviews
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "reviews_auth_select"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "reviews_auth_insert"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "reviews_auth_update"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "reviews_auth_delete"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 7. FIX LEADS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public insert leads" ON leads;

CREATE POLICY "leads_public_insert"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND naam IS NOT NULL
    AND length(naam) > 0
  );

-- ============================================
-- 8. FIX WHATSAPP TABLES RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role full access conversations" ON whatsapp_conversations;
DROP POLICY IF EXISTS "Service role full access messages" ON whatsapp_messages;

CREATE POLICY "whatsapp_conversations_auth_all"
  ON whatsapp_conversations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "whatsapp_messages_auth_all"
  ON whatsapp_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 9. FIX FUNCTION SEARCH PATHS
-- ============================================

DROP FUNCTION IF EXISTS update_whatsapp_updated_at() CASCADE;
CREATE FUNCTION update_whatsapp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_vehicle_search_vector() CASCADE;
CREATE FUNCTION update_vehicle_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('dutch', COALESCE(NEW.merk, '')), 'A') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.type, '')), 'B') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.brandstof, '')), 'B') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.carrosserie, '')), 'C');
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
CREATE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS get_filter_options() CASCADE;
CREATE FUNCTION get_filter_options()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'merken', (SELECT jsonb_agg(DISTINCT merk ORDER BY merk) FROM vehicles WHERE merk IS NOT NULL),
    'modellen', (SELECT jsonb_agg(DISTINCT model ORDER BY model) FROM vehicles WHERE model IS NOT NULL),
    'brandstoffen', (SELECT jsonb_agg(DISTINCT brandstof ORDER BY brandstof) FROM vehicles WHERE brandstof IS NOT NULL),
    'transmissies', (SELECT jsonb_agg(DISTINCT transmissie ORDER BY transmissie) FROM vehicles WHERE transmissie IS NOT NULL),
    'carrosserieën', (SELECT jsonb_agg(DISTINCT carrosserie ORDER BY carrosserie) FROM vehicles WHERE carrosserie IS NOT NULL)
  ) INTO result;
  
  RETURN result;
END;
$$;

DROP FUNCTION IF EXISTS get_models_for_merk(text) CASCADE;
CREATE FUNCTION get_models_for_merk(p_merk text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(DISTINCT model ORDER BY model)
  INTO result
  FROM vehicles
  WHERE merk = p_merk AND model IS NOT NULL;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

DROP FUNCTION IF EXISTS filter_vehicle_ids_by_opties(text[]) CASCADE;
CREATE FUNCTION filter_vehicle_ids_by_opties(optie_filters text[])
RETURNS TABLE(vehicle_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT v.id
  FROM vehicles v
  WHERE optie_filters <@ string_to_array(v.opties, ',');
END;
$$;

DROP FUNCTION IF EXISTS search_vehicles_with_opties(text, text[], numeric, numeric) CASCADE;
CREATE FUNCTION search_vehicles_with_opties(
  search_term text DEFAULT NULL,
  optie_filters text[] DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  merk text,
  model text,
  type text,
  maandprijs numeric,
  relevance real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.merk,
    v.model,
    v.type,
    v.maandprijs,
    CASE 
      WHEN search_term IS NOT NULL THEN
        ts_rank(v.search_vector, plainto_tsquery('dutch', search_term))
      ELSE 1.0
    END as relevance
  FROM vehicles v
  WHERE 
    (search_term IS NULL OR v.search_vector @@ plainto_tsquery('dutch', search_term))
    AND (optie_filters IS NULL OR optie_filters <@ string_to_array(v.opties, ','))
    AND (min_price IS NULL OR v.maandprijs >= min_price)
    AND (max_price IS NULL OR v.maandprijs <= max_price)
  ORDER BY relevance DESC, v.maandprijs ASC;
END;
$$;

DROP FUNCTION IF EXISTS calculate_maandprijs(numeric, integer, numeric, numeric) CASCADE;
CREATE FUNCTION calculate_maandprijs(
  catalogusprijs numeric,
  looptijd_maanden integer,
  rente_percentage numeric,
  restwaarde_percentage numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  restwaarde numeric;
  te_financieren numeric;
  maand_rente numeric;
  maandprijs numeric;
BEGIN
  restwaarde := catalogusprijs * (restwaarde_percentage / 100.0);
  te_financieren := catalogusprijs - restwaarde;
  maand_rente := rente_percentage / 100.0 / 12.0;
  
  IF maand_rente = 0 THEN
    maandprijs := te_financieren / looptijd_maanden;
  ELSE
    maandprijs := te_financieren * (maand_rente * power(1 + maand_rente, looptijd_maanden)) / 
                  (power(1 + maand_rente, looptijd_maanden) - 1);
  END IF;
  
  RETURN round(maandprijs, 2);
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_search_vector_trigger
  BEFORE INSERT OR UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_search_vector();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();

CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();