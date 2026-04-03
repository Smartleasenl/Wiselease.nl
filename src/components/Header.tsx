// src/components/Header.tsx
import { useSubPages } from '../hooks/usePage';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Phone, MessageCircle, Star, Menu, X,
  Car, Calculator, Sparkles, FileText, Info,
  ChevronRight, ChevronDown, Check,
  Users, Truck, Recycle, Zap, LayoutGrid, GitCompare,
} from 'lucide-react';

const AANBOD_SUB = [
  { label: "Alle auto's",  to: '/aanbod',                          icon: LayoutGrid },
  { label: 'Personenauto',  to: '/aanbod?bodytype=personenauto',   icon: Users      },
  { label: 'Bedrijfsauto',  to: '/aanbod?bodytype=bedrijfsauto',   icon: Truck      },
  { label: 'Occasions',     to: '/aanbod?type=occasion',           icon: Recycle    },
  { label: 'Elektrisch',    to: '/aanbod?fuel=elektrisch',         icon: Zap        },
  { label: "Marge auto's",  to: '/aanbod?type=marge',              icon: Car        },
];

const SEO_MERKEN = [
  { label: 'BMW Financial Lease',        to: '/financial-lease/lease/bmw' },
  { label: 'Mercedes Financial Lease',   to: '/financial-lease/lease/mercedes-benz' },
  { label: 'Volkswagen Financial Lease', to: '/financial-lease/lease/volkswagen' },
  { label: 'Audi Financial Lease',       to: '/financial-lease/lease/audi' },
  { label: 'Toyota Financial Lease',     to: '/financial-lease/lease/toyota' },
  { label: 'Tesla Financial Lease',      to: '/financial-lease/lease/tesla' },
];

const SEO_CATEGORIEEN = [
  { label: 'ZZP Lease',       to: '/financial-lease/lease/zzp' },
  { label: 'Elektrisch',      to: '/financial-lease/lease/elektrisch' },
  { label: 'Zakelijk',        to: '/financial-lease/lease/zakelijk' },
  { label: 'Starter Lease',   to: '/financial-lease/lease/starter' },
  { label: 'Goedkoop Leasen', to: '/financial-lease/lease/goedkoop' },
];

const NAV_ITEMS = [
  { to: '/aanbod',                label: 'Aanbod',          desc: "Bekijk 60.000+ auto's",      icon: Car,         hasDropdown: true, dropdownKey: 'aanbod'           },
  { to: '/calculator',            label: 'Calculator',       desc: 'Bereken je maandbedrag',     icon: Calculator                                                      },
  { to: '/keuzehulp',             label: 'AI Keuzehulp',     desc: 'Vind je perfecte auto',      icon: Sparkles                                                        },
  { to: '/offerte-vergelijker',   label: 'Vergelijker',      desc: 'Bespaar op je lease',        icon: GitCompare                                                      },
  { to: '/financial-lease',       label: 'Financial Lease',  desc: 'Alles over financial lease', icon: FileText,    hasDropdown: true, dropdownKey: 'financial-lease', parentSlug: 'financial-lease' },
  { to: '/meer-informatie',       label: 'Meer informatie',  desc: 'Veelgestelde vragen',        icon: Info,        hasDropdown: true, dropdownKey: 'meer-informatie', parentSlug: 'meer-informatie' },
];

const USP_ITEMS = ['Investeer in je eigen bedrijf', 'Direct eigenaar van de auto', 'Veel fiscale voordelen', 'Financial lease voor ZZP & MKB', 'Geen jaarcijfers vereist', 'Vaste lage maandlast'];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown]     = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownRef                         = useRef<HTMLDivElement>(null);
  const location                            = useLocation();
  const navigate                            = useNavigate();

  const { pages: flPages } = useSubPages('financial-lease');
  const { pages: miPages } = useSubPages('meer-informatie');

  const subPageMap: Record<string, typeof flPages> = {
    'financial-lease': flPages,
    'meer-informatie': miPages,
  };

  const SLUG_OVERRIDES: Record<string, string> = {
    'meer-informatie/veelgestelde-vragen': '/veelgestelde-vragen',
    'meer-informatie/reviews':             '/reviews',
    'meer-informatie/financial-lease-blog': '/blog',
  };
  function resolveSubSlug(slug: string) {
    return SLUG_OVERRIDES[slug] ?? `/${slug}`;
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname + location.search]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleAanbodLink(to: string) {
    setOpenDropdown(null);
    navigate(to);
  }

  const HEADER_HEIGHT = 64;

  return (
    <>
      <style>{`
        @keyframes usp-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .drop-in { animation: dropIn 0.18s ease forwards; }
      `}</style>

      {/* Desktop top bar */}
      <div className="hidden md:block bg-white border-b border-gray-200 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <a href="tel:0858008777" className="flex items-center space-x-2 text-gray-700 hover:text-smartlease-yellow transition">
              <Phone className="h-4 w-4 text-smartlease-yellow" /><span className="font-semibold">085 - 80 08 777</span>
            </a>
            <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-700 hover:text-smartlease-yellow transition">
              <MessageCircle className="h-4 w-4 text-green-500" /><span>WhatsApp</span>
            </a>
          </div>
          <div className="flex items-center space-x-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
            <span className="font-semibold text-gray-700">4,9 reviews</span>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 md:h-20">

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative z-[60] p-2 -ml-2 text-gray-700 hover:text-smartlease-yellow transition"
              aria-label={mobileMenuOpen ? 'Menu sluiten' : 'Menu openen'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 flex items-center z-[60]">
              <img src="/Wiselease_Logo.png" alt="Wiselease" className="h-8 md:h-12 w-auto" />
            </Link>

            <div className="flex md:hidden items-center space-x-3 z-[60]">
              <a href="tel:0858008777" className="p-2 text-gray-700 hover:text-smartlease-yellow transition">
                <Phone className="h-5 w-5" />
              </a>
              <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600 transition">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>

            {/* Desktop nav */}
            <nav ref={dropdownRef} className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {NAV_ITEMS.map((item) => {
                const isOpen = openDropdown === item.dropdownKey;

                if (item.dropdownKey === 'aanbod') {
                  const isActive = location.pathname === '/aanbod';
                  return (
                    <div key={item.to} className="relative">
                      <div className="flex items-center gap-0.5">
                        <Link
                          to="/aanbod"
                          className={`font-semibold transition-colors ${isActive ? 'text-smartlease-yellow' : 'text-gray-700 hover:text-smartlease-yellow'}`}
                        >
                          {item.label}
                        </Link>
                        <button
                          onClick={() => setOpenDropdown(isOpen ? null : 'aanbod')}
                          className={`p-0.5 transition-colors ${isActive ? 'text-smartlease-yellow' : 'text-gray-700 hover:text-smartlease-yellow'}`}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      {isActive && <span className="absolute -bottom-[1.35rem] left-0 right-0 h-0.5 bg-smartlease-yellow rounded-full" />}
                      {isOpen && (
                        <div className="drop-in absolute top-[calc(100%+1.35rem)] left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-3 bg-smartlease-yellow/5 border-b border-gray-100">
                            <span className="font-bold text-smartlease-yellow text-sm">Ons aanbod</span>
                          </div>
                          <div className="py-2">
                            {AANBOD_SUB.map((sub) => {
                              const Icon = sub.icon;
                              const currentFull = location.pathname + location.search;
                              const isSubActive = currentFull === sub.to || (sub.to === '/aanbod' && location.pathname === '/aanbod' && !location.search);
                              return (
                                <button
                                  key={sub.to}
                                  onClick={() => handleAanbodLink(sub.to)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                                    isSubActive
                                      ? 'bg-smartlease-yellow/10 text-smartlease-yellow font-semibold'
                                      : 'text-gray-700 hover:bg-gray-50 hover:text-smartlease-yellow'
                                  }`}
                                >
                                  <Icon className="h-4 w-4 flex-shrink-0 opacity-60" />
                                  {sub.label}
                                  {isSubActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-smartlease-yellow" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.hasDropdown && item.parentSlug) {
                  const isActive = location.pathname.startsWith(item.to);
                  const subPages = subPageMap[item.parentSlug] || [];
                  return (
                    <div key={item.to} className="relative">
                      <button
                        onClick={() => setOpenDropdown(isOpen ? null : item.dropdownKey!)}
                        className={`flex items-center gap-1 font-semibold transition-colors ${isActive ? 'text-smartlease-yellow' : 'text-gray-700 hover:text-smartlease-yellow'}`}
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        {isActive && <span className="absolute -bottom-[1.35rem] left-0 right-0 h-0.5 bg-smartlease-yellow rounded-full" />}
                      </button>
                      {isOpen && (
                        <div className="drop-in absolute top-[calc(100%+1.35rem)] left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-3 bg-smartlease-yellow/5 border-b border-gray-100">
                            <Link to={item.to} onClick={() => setOpenDropdown(null)} className="font-bold text-smartlease-yellow text-sm hover:underline">
                              Alle {item.label.toLowerCase()} →
                            </Link>
                          </div>
                          <div className="py-2">
                            {subPages.map((p) => {
                              const resolvedTo = resolveSubSlug(p.slug);
                              const isSub = (location.pathname + location.search) === resolvedTo || location.pathname === resolvedTo;
                              return (
                                <Link key={p.slug} to={resolvedTo} onClick={() => setOpenDropdown(null)}
                                  className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${isSub ? 'bg-smartlease-yellow/10 text-smartlease-yellow font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-smartlease-yellow'}`}
                                >
                                  {p.menu_label}
                                  {isSub && <ChevronRight className="h-3.5 w-3.5 text-smartlease-yellow" />}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Vergelijker — met teal badge accent
                if (item.to === '/offerte-vergelijker') {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative font-semibold transition-colors flex items-center gap-1.5 ${isActive ? 'text-smartlease-yellow' : 'text-gray-700 hover:text-smartlease-yellow'}`}
                    >
                      {item.label}
                      <span className="bg-smartlease-yellow text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        Nieuw
                      </span>
                      {isActive && <span className="absolute -bottom-[1.35rem] left-0 right-0 h-0.5 bg-smartlease-yellow rounded-full" />}
                    </Link>
                  );
                }

                const isActive = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}
                    className={`relative font-semibold transition-colors ${isActive ? 'text-smartlease-yellow' : 'text-gray-700 hover:text-smartlease-yellow'}`}>
                    {item.label}
                    {isActive && <span className="absolute -bottom-[1.35rem] left-0 right-0 h-0.5 bg-smartlease-yellow rounded-full" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* USP bar */}
      <div className="bg-smartlease-blue">
        <div className="hidden md:flex items-center justify-center space-x-8 py-2">
          {USP_ITEMS.map((usp, i) => (
            <span key={i} className="inline-flex items-center text-white text-sm font-medium">
              <Check className="h-3.5 w-3.5 mr-1.5 text-smartlease-yellow flex-shrink-0" />{usp}
            </span>
          ))}
        </div>
        <div className="md:hidden overflow-hidden">
          <div className="usp-marquee flex whitespace-nowrap py-2">
            {[...USP_ITEMS, ...USP_ITEMS, ...USP_ITEMS, ...USP_ITEMS].map((usp, i) => (
              <span key={i} className="inline-flex items-center mx-6 text-white text-xs font-medium">
                <Check className="h-3.5 w-3.5 mr-1.5 text-smartlease-yellow flex-shrink-0" />{usp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-[55] transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: `${HEADER_HEIGHT}px` }}
      >
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`absolute inset-x-0 bottom-0 bg-white overflow-y-auto overscroll-contain transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-4'
          }`}
          style={{ top: 0 }}
        >
          <nav className="px-4 pt-6 pb-4">
            {NAV_ITEMS.map((item, idx) => {
              const Icon       = item.icon;
              const isExpanded = mobileExpanded === item.to;

              if (item.dropdownKey === 'aanbod') {
                const isActive = location.pathname === '/aanbod';
                return (
                  <div key={item.to}>
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : item.to)}
                      className={`w-full group flex items-center space-x-4 px-4 py-4 rounded-2xl mb-1 transition-all duration-200 ${isActive ? 'bg-smartlease-yellow/10' : 'hover:bg-gray-50'}`}
                      style={{
                        opacity: mobileMenuOpen ? 1 : 0,
                        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                        transition: `opacity .3s ease ${idx * .06}s, transform .3s ease ${idx * .06}s`,
                      }}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-bold text-base ${isActive ? 'text-smartlease-yellow' : 'text-gray-900'}`}>{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="ml-[3.75rem] mb-2 flex flex-col gap-0.5">
                        {AANBOD_SUB.map((sub) => {
                          const SubIcon = sub.icon;
                          const currentFull = location.pathname + location.search;
                          const isSub = currentFull === sub.to || (sub.to === '/aanbod' && location.pathname === '/aanbod' && !location.search);
                          return (
                            <button
                              key={sub.to}
                              onClick={() => { setMobileMenuOpen(false); navigate(sub.to); }}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-left ${isSub ? 'bg-smartlease-yellow/10 text-smartlease-yellow font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-smartlease-yellow'}`}
                            >
                              <SubIcon className="h-4 w-4 opacity-60 flex-shrink-0" />
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.hasDropdown && item.parentSlug) {
                const isActive = location.pathname.startsWith(item.to);
                const subPages = subPageMap[item.parentSlug] || [];
                return (
                  <div key={item.to}>
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : item.to)}
                      className={`w-full group flex items-center space-x-4 px-4 py-4 rounded-2xl mb-1 transition-all duration-200 ${isActive ? 'bg-smartlease-yellow/10' : 'hover:bg-gray-50'}`}
                      style={{
                        opacity: mobileMenuOpen ? 1 : 0,
                        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                        transition: `opacity .3s ease ${idx * .06}s, transform .3s ease ${idx * .06}s`,
                      }}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-bold text-base ${isActive ? 'text-smartlease-yellow' : 'text-gray-900'}`}>{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="ml-[3.75rem] mb-2 flex flex-col gap-0.5">
                        <Link to={item.to} onClick={() => setMobileMenuOpen(false)}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-smartlease-yellow hover:bg-smartlease-yellow/10 transition-colors">
                          Overzichtspagina →
                        </Link>
                        {subPages.map((p) => {
                          const resolvedTo = resolveSubSlug(p.slug);
                          const isSub = location.pathname === resolvedTo;
                          return (
                            <Link key={p.slug} to={resolvedTo} onClick={() => setMobileMenuOpen(false)}
                              className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${isSub ? 'bg-smartlease-yellow/10 text-smartlease-yellow font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-smartlease-yellow'}`}>
                              {p.menu_label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.to;
              const isVergelijker = item.to === '/offerte-vergelijker';
              return (
                <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center space-x-4 px-4 py-4 rounded-2xl mb-2 transition-all duration-200 ${isActive ? 'bg-smartlease-yellow/10' : 'hover:bg-gray-50 active:bg-gray-100'}`}
                  style={{
                    opacity: mobileMenuOpen ? 1 : 0,
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity .3s ease ${idx * .06}s, transform .3s ease ${idx * .06}s`,
                  }}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-smartlease-yellow/10 group-hover:text-smartlease-yellow'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base flex items-center gap-2 ${isActive ? 'text-smartlease-yellow' : 'text-gray-900'}`}>
                      {item.label}
                      {isVergelijker && (
                        <span className="bg-smartlease-yellow text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          Nieuw
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-smartlease-yellow' : 'text-gray-300 group-hover:text-smartlease-yellow'}`} />
                </Link>
              );
            })}
          </nav>

          <div className="mx-8 h-px bg-gray-200" />

          <div className="px-4 py-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-3">Contact</p>
            <a href="tel:0858008777" className="flex items-center space-x-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition mb-2">
              <div className="w-11 h-11 rounded-xl bg-smartlease-yellow/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-smartlease-yellow" />
              </div>
              <div>
                <p className="font-bold text-gray-900">085 - 80 08 600</p>
                <p className="text-xs text-gray-400">Ma-Vr 9:00 - 18:00</p>
              </div>
            </a>
            <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer"
              className="flex items-center space-x-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition mb-2">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-400">Direct antwoord</p>
              </div>
            </a>
          </div>

          <div className="mx-8 mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center space-x-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">4,9 uit 5</p>
                <p className="text-xs text-gray-400">Klantbeoordeling</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}