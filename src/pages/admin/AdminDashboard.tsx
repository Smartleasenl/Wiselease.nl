import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Car,
  Users,
  Settings,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';

interface Stats {
  totalVehicles: number;
  activeVehicles: number;
  totalLeads: number;
  newLeads: number;
  lastImport: string | null;
  lastImportStatus: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalLeads: 0,
    newLeads: 0,
    lastImport: null,
    lastImportStatus: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      const { count: activeVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'nieuw');

      const { data: lastImport } = await supabase
        .from('import_logs')
        .select('finished_at, status')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalVehicles: totalVehicles || 0,
        activeVehicles: activeVehicles || 0,
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        lastImport: lastImport?.finished_at || null,
        lastImportStatus: lastImport?.status || null,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Nog niet beschikbaar';
    return new Date(date).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statCards = [
    {
      label: 'Actieve voertuigen',
      value: loading ? '...' : stats.activeVehicles.toLocaleString('nl-NL'),
      sub: `${stats.totalVehicles.toLocaleString('nl-NL')} totaal`,
      icon: Car,
      color: 'text-smartlease-teal',
      bg: 'bg-smartlease-teal/10',
    },
    {
      label: 'Leads',
      value: loading ? '...' : stats.totalLeads.toLocaleString('nl-NL'),
      sub: `${stats.newLeads} nieuw`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Laatste import',
      value: loading ? '...' : (stats.lastImportStatus === 'completed' ? 'Succesvol' : stats.lastImportStatus || 'N/A'),
      sub: formatDate(stats.lastImport),
      icon: stats.lastImportStatus === 'completed' ? CheckCircle2 : AlertCircle,
      color: stats.lastImportStatus === 'completed' ? 'text-green-600' : 'text-amber-600',
      bg: stats.lastImportStatus === 'completed' ? 'bg-green-50' : 'bg-amber-50',
    },
  ];

  const quickActions = [
    {
      to: '/admin/site-instellingen',
      label: 'Site instellingen beheren',
      desc: 'Logo, contact, SEO, teksten en meer',
      icon: Settings,
    },
    {
      to: '/admin/footer-links',
      label: 'Footer links beheren',
      desc: 'Beheer welke paginalinks in de footer staan',
      icon: Link2,
    },
    {
      to: '/admin/leads',
      label: 'Leads bekijken',
      desc: 'Bekijk en beheer binnenkomende leads',
      icon: Users,
    },
    {
      to: '/admin/statistieken',
      label: 'Statistieken bekijken',
      desc: 'Bezoekers, voertuigen en import logs',
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welkom bij het Smartlease.nl admin panel</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Snelle acties</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-smartlease-teal/10 transition">
                  <Icon className="h-5 w-5 text-gray-500 group-hover:text-smartlease-teal transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{action.label}</p>
                  <p className="text-sm text-gray-400">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-smartlease-teal transition" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}