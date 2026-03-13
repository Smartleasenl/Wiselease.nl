// src/components/Footer.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FooterLink {
  id: number;
  column_key: string;
  label: string;
  url: string;
  sort_order: number;
}

interface SiteSettings {
  [key: string]: string;
}

function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) {
        const map: SiteSettings = {};
        data.forEach(({ key, value }) => { map[key] = value; });
        setSettings(map);
      }
    });
  }, []);
  return settings;
}

function useFooterLinks() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  useEffect(() => {
    supabase
      .from('footer_links')
      .select('id,column_key,label,url,sort_order')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setLinks((data as FooterLink[]) || []));
  }, []);
  return links;
}

export function Footer() {
  const s = useSiteSettings();
  const allLinks = useFooterLinks();

  const aanbodLinks   = allLinks.filter(l => l.column_key === 'aanbod');
  const flLinks       = allLinks.filter(l => l.column_key === 'financial_lease');
  const meerInfoLinks = allLinks.filter(l => l.column_key === 'meer_informatie');

  const phone       = s['contact_phone']        || '085 - 80 08 600';
  const phoneRaw    = s['contact_phone_raw']     || '0858008777';
  const whatsapp    = s['contact_whatsapp']      || '31613669328';
  const email       = s['contact_email']         || 'info@smartlease.nl';
  const hours       = s['footer_openingstijden'] || 'Ma-Vr 9:00 - 18:00 | Za 10:00 - 14:00';
  const tagline     = s['footer_tagline']        || '';
  const copyright   = s['footer_copyright']      || `© ${new Date().getFullYear()} Smartlease.nl`;
  const reviewScore = s['review_score']          || '4,9';
  const col1Title   = s['footer_col1_title']     || 'Ons aanbod';
  const col2Title   = s['footer_col2_title']     || 'Financial Lease';
  const col3Title   = s['footer_col3_title']     || 'Meer informatie';

  return (
    <footer className="bg-[#F8FAFA] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Kolom 1 - Bedrijfsinfo */}
          <div>
            <img
              src={s['logo_url'] || '/Wiselease_Logo.png'}
              alt="Wiselease"
              className="h-10 w-auto max-w-[200px] object-contain mb-5"
            />

            {tagline ? (
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{tagline}</p>
            ) : null}

            {s['footer_show_reviews_badge'] !== 'false' ? (
              <div className="flex items-center gap-2 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 w-fit">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-bold text-sm text-gray-800">{reviewScore}</span>
                <span className="text-gray-400 text-xs">uit 5 sterren</span>
              </div>
            ) : null}

            <div className="space-y-3">
              <a href={`tel:${phoneRaw}`} className="flex items-center gap-3 text-sm hover:text-smartlease-yellow transition group">
                <div className="w-8 h-8 rounded-lg bg-smartlease-yellow/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-smartlease-yellow" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-smartlease-yellow transition">{phone}</p>
                  <p className="text-xs text-gray-400">{hours}</p>
                </div>
              </a>

              {s['footer_show_whatsapp'] !== 'false' ? (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-green-600 transition group">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-green-600 transition">WhatsApp</span>
                </a>
              ) : null}

              {s['footer_show_email'] !== 'false' && email ? (
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm hover:text-smartlease-yellow transition group">
                  <div className="w-8 h-8 rounded-lg bg-smartlease-yellow/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-smartlease-yellow" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-smartlease-yellow transition">{email}</p>
                    <p className="text-xs text-gray-400">Wij reageren snel</p>
                  </div>
                </a>
              ) : null}
            </div>
          </div>

          {/* Kolom 2 - Ons aanbod */}
          {s['footer_show_aanbod'] !== 'false' && aanbodLinks.length > 0 ? (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">{col1Title}</h4>
              <ul className="space-y-2.5">
                {aanbodLinks.map(link => (
                  <li key={link.id}>
                    <Link to={link.url} className="text-sm text-gray-500 hover:text-smartlease-yellow transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Kolom 3 - Financial Lease */}
          {s['footer_show_financial_lease'] !== 'false' && flLinks.length > 0 ? (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">{col2Title}</h4>
              <ul className="space-y-2.5">
                {flLinks.map(link => (
                  <li key={link.id}>
                    <Link to={link.url} className="text-sm text-gray-500 hover:text-smartlease-yellow transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Kolom 4 - Meer informatie */}
          {s['footer_show_meer_informatie'] !== 'false' && meerInfoLinks.length > 0 ? (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">{col3Title}</h4>
              <ul className="space-y-2.5">
                {meerInfoLinks.map(link => (
                  <li key={link.id}>
                    <Link to={link.url} className="text-sm text-gray-500 hover:text-smartlease-yellow transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

        </div>

        {/* CTA blok */}
        {s['footer_show_cta_blok'] !== 'false' ? (
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-smartlease-yellow to-yellow-500 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-yellow-100">
            <div>
              <p className="font-bold text-white text-lg">Gratis offerte?</p>
              <p className="text-sm text-white/80">Binnen 24 uur een persoonlijk voorstel op maat.</p>
            </div>
            <Link
              to="/offerte"
              className="flex-shrink-0 bg-white hover:bg-gray-50 text-smartlease-yellow font-bold px-6 py-3 rounded-xl transition text-sm shadow-sm"
            >
              Aanvragen &rarr;
            </Link>
          </div>
        ) : null}

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>{copyright} — Alle rechten voorbehouden</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gray-700 transition">Privacy</Link>
            <Link to="/contact" className="hover:text-gray-700 transition">Contact</Link>
            <Link to="/offerte" className="hover:text-gray-700 transition">Offerte</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}