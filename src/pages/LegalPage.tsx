import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LegalPageData {
  slug: string;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

const PATH_TO_SLUG: Record<string, string> = {
  '/privacyverklaring': 'privacyverklaring',
  '/algemene-voorwaarden': 'algemene-voorwaarden',
  '/cookiebeleid': 'cookiebeleid',
};

export default function LegalPage() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedSlug = slug || PATH_TO_SLUG[location.pathname] || null;

  useEffect(() => {
    if (!resolvedSlug) {
      navigate('\/', { replace: true });
      return;
    }
    setLoading(true);

    supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', resolvedSlug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('\/', { replace: true });
          return;
        }
        setPage(data as LegalPageData);
        document.title = data.meta_title || data.title + ' – Wiselease.nl';
        setLoading(false);
      });
  }, [resolvedSlug, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{page.title}</h1>
      <p className="text-gray-400 text-sm mb-10">Laatste update: april 2026</p>

      <div
        className="prose prose-gray max-w-none text-gray-600 leading-relaxed
          [&_section]:mb-8
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h2]:mt-0
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-2
          [&_p]:mb-3 [&_p]:text-gray-600 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:mt-2 [&_ul]:mb-3
          [&_li]:text-gray-600
          [&_strong]:text-gray-900 [&_strong]:font-semibold
          [&_a]:text-teal-600 [&_a:hover]:underline"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
