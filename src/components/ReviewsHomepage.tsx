import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  naam: string;
  bedrijf: string;
  sterren: number;
  tekst: string;
  datum: string;
  avatar_init: string | null;
}

function StarRating({ sterren }: { sterren: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={i <= sterren ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function Avatar({ naam, init }: { naam: string; init: string | null }) {
  const letters = init || naam.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
  const color = colors[naam.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${color}`}>
      {letters}
    </div>
  );
}

export function ReviewsHomepage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    supabase.from('reviews').select('*').eq('is_published', true).order('sort_order').limit(3).then(({ data }) => {
      if (data) setReviews(data);
    });
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-sm font-semibold text-gray-700">9.4 op Google</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wat onze klanten zeggen</h2>
          <p className="text-gray-500">Honderden ondernemers vertrouwen op Wiselease</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
              <StarRating sterren={review.sterren} />
              <p className="text-gray-700 text-sm leading-relaxed flex-1 line-clamp-4">
                "{review.tekst}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <Avatar naam={review.naam} init={review.avatar_init} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.naam}</p>
                  {review.bedrijf && <p className="text-xs text-gray-400">{review.bedrijf}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/reviews" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
            Alle reviews bekijken <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
