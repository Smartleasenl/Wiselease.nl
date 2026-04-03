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

// Map hardcoded paths to slugs
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

  // Determine slug from either URL param or hardcoded path
  const resolvedSlug = slug || PATH_TO_SLUG[location.pathname] || null;

  useEffect(() => {
    if (!resolvedSlug) {
      navigate('/', { replace: true });
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
          navigate('/', { replace: true });
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
    <div className="bg-white min-h-screen">
      <div className="bg-slate-50 border-b border-slate-200 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="prose prose-slate prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-li:text-slate-600
            prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
