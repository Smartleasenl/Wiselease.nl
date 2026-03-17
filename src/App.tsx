import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { OccasionsPage } from './pages/OccasionsPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { KeuzehulpPage } from './pages/KeuzehulpPage';
import { ContactPage } from './pages/ContactPage';
import { OffertePage } from './pages/OffertePage';
import { BelMijPage } from './pages/BelMijPage';
import { OfferteVergelijkerPage } from './pages/OfferteVergelijkerPage';
import InfoPage from './pages/InfoPage';
import ReviewsPage from './pages/ReviewsPage';
import VeelgesteldeVragenPage from './pages/VeelgesteldeVragenPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import MerkModelPage from './pages/MerkModelPage';

// Admin imports
import LoginPage from './pages/admin/LoginPage';
import AuthGuard from './components/admin/AuthGuard';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SiteInstellingenPage from './pages/admin/SiteInstellingenPage';
import LeadsPage from './pages/admin/LeadsPage';
import LeadDetailPage from './pages/admin/LeadDetailPage';
import { PaginasPage, StatistiekenPage } from './pages/admin/PlaceholderPages';
import DealersPage from './pages/admin/DealersPage';
import PaginaBeheer from './pages/admin/PaginaBeheer';
import FooterBeheer from './pages/admin/FooterBeheer';
import FooterLinksAdmin from './pages/admin/FooterLinksAdmin';
import ReviewsBeheer from './pages/admin/ReviewsBeheer';
import FaqBeheer from './pages/admin/FaqBeheer';
import BlogBeheer from './pages/admin/BlogBeheer';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const INFO_SLUGS = [
  'wat-is-financial-lease',
  'voor-ondernemers',
  'zzp-lease',
  'starter-lease',
  'operational-lease',
  'occasion-lease',
  'equipment-lease',
  'motor-leasen',
  'import-lease',
  'elektrisch-leasen',
  'goedkoop-leasen',
  'voor-het-eerst-leasen',
];

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">Deze pagina is binnenkort beschikbaar.</p>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* Admin login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AuthGuard><AdminLayout /></AuthGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="site-instellingen" element={<SiteInstellingenPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="paginas" element={<PaginasPage />} />
          <Route path="pagina-beheer" element={<PaginaBeheer />} />
          <Route path="footer-beheer" element={<FooterBeheer />} />
          <Route path="footer-links" element={<FooterLinksAdmin />} />
          <Route path="reviews" element={<ReviewsBeheer />} />
          <Route path="faq-beheer" element={<FaqBeheer />} />
          <Route path="blog-beheer" element={<BlogBeheer />} />
          <Route path="statistieken" element={<StatistiekenPage />} />
          <Route path="dealers" element={<DealersPage />} />
        </Route>

        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/aanbod" element={<OccasionsPage />} />
          <Route path="/occasions" element={<Navigate to="/aanbod" replace />} />
          <Route path="/auto/:id/:slug" element={<VehicleDetailPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/keuzehulp" element={<KeuzehulpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/offerte" element={<OffertePage />} />
          <Route path="/bel-mij" element={<BelMijPage />} />
          <Route path="/offerte-vergelijker" element={<OfferteVergelijkerPage />} />

          {INFO_SLUGS.map((slug) => (
            <Route
              key={slug}
              path={'/financial-lease/' + slug}
              element={<InfoPage />}
            />
          ))}

          <Route path="/financial-lease/:merk/:model" element={<MerkModelPage />} />
          <Route path="/financial-lease/:merk" element={<MerkModelPage />} />
          <Route path="/financial-lease/*" element={<InfoPage />} />

          <Route path="/meer-informatie/veelgestelde-vragen" element={<Navigate to="/veelgestelde-vragen" replace />} />
          <Route path="/meer-informatie/reviews" element={<Navigate to="/reviews" replace />} />
          <Route path="/meer-informatie/financial-lease-blog" element={<Navigate to="/blog" replace />} />
          <Route path="/meer-informatie/*" element={<InfoPage />} />

          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/veelgestelde-vragen" element={<VeelgesteldeVragenPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />

          <Route path="*" element={<PlaceholderPage title="Pagina niet gevonden" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;