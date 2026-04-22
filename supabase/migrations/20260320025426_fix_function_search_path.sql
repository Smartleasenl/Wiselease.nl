/*
  # Fix Function Search Path Security Issues

  1. Problem
    - Functions `search_vehicles_with_opties` and `update_site_setting` have mutable search_path
    - This can be exploited by malicious actors to inject malicious functions

  2. Solution
    - Set search_path explicitly to 'public' for both functions
    - This prevents search_path injection attacks

  3. Functions Fixed
    - search_vehicles_with_opties - vehicle search function
    - update_site_setting - site settings update function
*/

-- Fix search_vehicles_with_opties search_path
ALTER FUNCTION public.search_vehicles_with_opties(
  p_opties text[],
  p_merk text,
  p_merken text[],
  p_model text,
  p_modellen text[],
  p_categorie text,
  p_brandstof text,
  p_transmissie text,
  p_kleur text,
  p_btw_marge text,
  p_prijs_min numeric,
  p_prijs_max numeric,
  p_jaar_min integer,
  p_jaar_max integer,
  p_km_min integer,
  p_km_max integer,
  p_vermogen_min integer,
  p_vermogen_max integer,
  p_sort text,
  p_page integer,
  p_per_page integer,
  p_zoek text,
  p_categorie_not text,
  p_categorie_in text
) SET search_path = public;

-- Fix update_site_setting search_path
ALTER FUNCTION public.update_site_setting(p_key text, p_value text)
SET search_path = public;
