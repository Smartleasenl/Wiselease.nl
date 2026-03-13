import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Settings, LayoutDashboard, Users, FileText, BarChart3, Building2, LogOut, Menu, X, ChevronRight, Globe, LayoutGrid as Layout, PanelBottom, Star, HelpCircle, BookOpen, Link2 } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { to: '/admin',                   label: 'Dashboard',          icon: LayoutDashboard, exact: true },
  { to: '/admin/site-instellingen', label: 'Site Instellingen',  icon: Settings },
  { to: '/admin/leads',             label: 'Leads',              icon: Users },
  { to: '/admin/dealers',           label: 'Dealers',            icon: Building2 },
  { to: '/admin/pagina-beheer',     label: 'Pagina beheer',      icon: Layout },
  { to: '/admin/footer-beheer',     label: 'Footer beheer',      icon: PanelBottom },
  { to: '/admin/footer-links',      label: 'Footer links',       icon: Link2 },   // ← nieuw
  { to: '/admin/reviews',           label: 'Reviews',            icon: Star },
  { to: '/admin/faq-beheer',        label: 'FAQ beheer',         icon: HelpCircle },
  { to: '/admin/blog-beheer',       label: 'Blog beheer',        icon: BookOpen },
  { to: '/admin/statistieken',      label: 'Statistieken',       icon: BarChart3 },
  { to: '/admin/paginas',           label: "Pagina's (oud)",     icon: FileText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('smartlease_temp_session');
    navigate('/admin/login');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition">
          <Menu className="h-6 w-6" />
        </button>
        <img src="/Wiselease_Logo.png" alt="Wiselease" className="h-7" />
        <div className="w-10" />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} onLogout={handleLogout} isActive={isActive} />
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <SidebarContent onLogout={handleLogout} isActive={isActive} />
        </aside>
        <main className="flex-1 lg:pl-64">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onClose, onLogout, isActive }: {
  onClose?: () => void;
  onLogout: () => void;
  isActive: (path: string, exact?: boolean) => boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/Wiselease_Logo.png" alt="Wiselease" className="h-8" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon  = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link key={item.to} to={item.to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active ? 'bg-smartlease-yellow/10 text-smartlease-yellow' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-smartlease-yellow' : 'text-gray-400'}`} />
              {item.label}
              {active && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
          <Globe className="h-5 w-5 text-gray-400" />
          Bekijk website
        </a>
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition w-full text-left">
          <LogOut className="h-5 w-5" />
          Uitloggen
        </button>
      </div>
    </div>
  );
}