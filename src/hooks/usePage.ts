// src/hooks/usePage.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // jouw bestaande supabase client

export interface PageSection {
  heading: string;
  text: string;
}

export interface Page {
  id: string;
  slug: string;
  parent_slug: string;
  menu_label: string;
  title: string;
  subtitle: string;
  hero_image_url: string;
  intro: string;
  content: PageSection[];
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  sort_order: number;
}

export function usePage(slug: string) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setPage(data as Page);
        setLoading(false);
      });
  }, [slug]);

  return { page, loading, error };
}

export function useSubPages(parentSlug: string) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentSlug) return;

    supabase
      .from('pages')
      .select('id, slug, menu_label, sort_order')
      .eq('parent_slug', parentSlug)
      .eq('is_published', true)
      .order('sort_order')
      .then(({ data }) => {
        setPages((data as Page[]) || []);
        setLoading(false);
      });
  }, [parentSlug]);

  return { pages, loading };
}