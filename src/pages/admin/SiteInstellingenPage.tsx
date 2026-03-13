import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw, Image, Phone, Mail, Globe, Type, LayoutGrid as Layout, Star, Info, MessageSquare, Share2, Search, Bell, Settings, CheckCircle, ChevronDown, ChevronUp, Upload, Trash2, Loader2, Palette, FileText, Zap, AlertCircle } from 'lucide-react';

type SettingsMap = Record<string, string>;

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'color' | 'tel' | 'email' | 'number' | 'toggle' | 'image';
  placeholder?: string;
  hint?: string;
  span?: 2; // full width
}

interface SectionDef {
  id: string;
  label: string;
  description: string;
  icon: any;
  fields: FieldDef[];
}

const SECTIONS: SectionDef[] = [
  {
    id: 'header',
    label: 'Header & Branding',
    description: 'Logo, bedrijfsnaam en kleuren',
    icon: Palette,
    fields: [
      { key: 'site_name', label: 'Bedrijfsnaam', type: 'text', placeholder: 'Smartlease.nl' },
      { key: 'site_tagline', label: 'Tagline', type: 'text', placeholder: 'Ongekend Slim' },
      { key: 'site_logo_url', label: 'Logo', type: 'image', hint: 'Upload je logo (PNG, SVG of GIF)' },
      { key: 'site_logo_height', label: 'Logo hoogte (px)', type: 'number', placeholder: '48' },
      { key: 'primary_color', label: 'Primaire kleur (teal)', type: 'color', placeholder: '#00B8A9' },
      { key: 'secondary_color', label: 'Secundaire kleur (blauw)', type: 'color', placeholder: '#0F2B46' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Informatie',
    description: 'Telefoon, email, adres en openingstijden',
    icon: Phone,
    fields: [
      { key: 'contact_phone', label: 'Telefoonnummer (weergave)', type: 'tel', placeholder: '085 - 80 08 777' },
      { key: 'contact_phone_raw', label: 'Telefoonnummer (link)', type: 'tel', placeholder: '0858008777', hint: 'Zonder spaties, voor tel: link' },
      { key: 'contact_whatsapp', label: 'WhatsApp nummer', type: 'tel', placeholder: '31613669328', hint: 'Landcode + nummer zonder +' },
      { key: 'contact_email', label: 'E-mailadres', type: 'email', placeholder: 'info@smartlease.nl' },
      { key: 'contact_address', label: 'Adres', type: 'text', placeholder: 'Straatnaam 1' },
      { key: 'contact_postcode', label: 'Postcode', type: 'text', placeholder: '1234 AB' },
      { key: 'contact_city', label: 'Plaats', type: 'text', placeholder: 'Amsterdam' },
      { key: 'contact_kvk', label: 'KvK nummer', type: 'text', placeholder: '12345678' },
      { key: 'contact_btw', label: 'BTW nummer', type: 'text', placeholder: 'NL123456789B01' },
      { key: 'contact_opening_hours', label: 'Openingstijden', type: 'text', placeholder: 'Ma-Vr 9:00 - 18:00' },
    ],
  },
  {
    id: 'hero',
    label: 'Hero Sectie',
    description: 'Hoofdtekst en knoppen op de homepage',
    icon: Layout,
    fields: [
      { key: 'hero_title', label: 'Titel', type: 'text', placeholder: 'Slimmer leasen begint hier', span: 2 },
      { key: 'hero_subtitle', label: 'Subtitel', type: 'textarea', placeholder: 'Jouw partner voor betrouwbare...', span: 2 },
      { key: 'hero_button_primary_text', label: 'Knop 1 tekst', type: 'text', placeholder: 'Bekijk aanbod' },
      { key: 'hero_button_primary_url', label: 'Knop 1 URL', type: 'text', placeholder: '/aanbod' },
      { key: 'hero_button_secondary_text', label: 'Knop 2 tekst', type: 'text', placeholder: 'Bereken je maandbedrag' },
      { key: 'hero_button_secondary_url', label: 'Knop 2 URL', type: 'text', placeholder: '/calculator' },
      { key: 'hero_image_url', label: 'Hero afbeelding', type: 'image', span: 2 },
      { key: 'hero_background_color', label: 'Achtergrondkleur', type: 'color' },
    ],
  },
  {
    id: 'usps',
    label: 'USP Balk',
    description: 'De 3 voordelen onder de header',
    icon: Zap,
    fields: [
      { key: 'usp_1_text', label: 'USP 1', type: 'text', placeholder: 'Investeer in je eigen bedrijf' },
      { key: 'usp_2_text', label: 'USP 2', type: 'text', placeholder: 'Direct eigenaar van de auto' },
      { key: 'usp_3_text', label: 'USP 3', type: 'text', placeholder: 'Veel fiscale voordelen' },
    ],
  },
  {
    id: 'lease',
    label: 'Financial Lease',
    description: 'Calculator instellingen en lease pagina',
    icon: FileText,
    fields: [
      { key: 'lease_page_title', label: 'Pagina titel', type: 'text', placeholder: 'Financial Lease' },
      { key: 'lease_page_intro', label: 'Intro tekst', type: 'textarea', span: 2 },
      { key: 'lease_min_amount', label: 'Minimum bedrag (€)', type: 'number', placeholder: '5000' },
      { key: 'lease_max_amount', label: 'Maximum bedrag (€)', type: 'number', placeholder: '150000' },
      { key: 'lease_default_duration', label: 'Standaard looptijd (maanden)', type: 'number', placeholder: '60' },
      { key: 'lease_interest_rate', label: 'Rente percentage (%)', type: 'number', placeholder: '5.5' },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Beoordelingsscore en review platform',
    icon: Star,
    fields: [
      { key: 'review_score', label: 'Score', type: 'text', placeholder: '4,9' },
      { key: 'review_count', label: 'Aantal reviews', type: 'text', placeholder: '127' },
      { key: 'review_platform', label: 'Platform', type: 'text', placeholder: 'Google' },
      { key: 'review_url', label: 'Review pagina URL', type: 'url', placeholder: 'https://g.page/...' },
    ],
  },
  {
    id: 'about',
    label: 'Over Ons',
    description: 'Over ons sectie op de website',
    icon: Info,
    fields: [
      { key: 'about_title', label: 'Titel', type: 'text', placeholder: 'Waarom Smartlease?', span: 2 },
      { key: 'about_text', label: 'Tekst', type: 'textarea', placeholder: 'Beschrijf je bedrijf...', span: 2 },
      { key: 'about_mission', label: 'Missie', type: 'textarea', span: 2 },
      { key: 'about_vision', label: 'Visie', type: 'textarea', span: 2 },
      { key: 'about_image_url', label: 'Afbeelding', type: 'image', span: 2 },
    ],
  },
  {
    id: 'cta',
    label: 'Call-to-Action',
    description: 'CTA blok onderaan pagina\'s',
    icon: MessageSquare,
    fields: [
      { key: 'cta_title', label: 'Titel', type: 'text', placeholder: 'Klaar om te starten?', span: 2 },
      { key: 'cta_subtitle', label: 'Subtitel', type: 'textarea', placeholder: 'Vraag vandaag nog...', span: 2 },
      { key: 'cta_button_text', label: 'Knop tekst', type: 'text', placeholder: 'Gratis offerte aanvragen' },
      { key: 'cta_button_url', label: 'Knop URL', type: 'text', placeholder: '/offerte' },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    description: 'Footer teksten en kolommen',
    icon: Type,
    fields: [
      { key: 'footer_company_name', label: 'Bedrijfsnaam', type: 'text', placeholder: 'Smartlease.nl' },
      { key: 'footer_tagline', label: 'Tagline', type: 'textarea', span: 2 },
      { key: 'footer_copyright', label: 'Copyright tekst', type: 'text', placeholder: '© 2026 Smartlease.nl', span: 2 },
      { key: 'footer_col1_title', label: 'Kolom 1 titel', type: 'text', placeholder: 'Waarom Smartlease?' },
      { key: 'footer_col1_text', label: 'Kolom 1 tekst', type: 'textarea' },
      { key: 'footer_col2_title', label: 'Kolom 2 titel', type: 'text', placeholder: 'Snelle links' },
      { key: 'footer_col3_title', label: 'Kolom 3 titel', type: 'text', placeholder: 'Contact' },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    description: 'Links naar je social media profielen',
    icon: Share2,
    fields: [
      { key: 'social_facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
      { key: 'social_instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/company/...' },
      { key: 'social_youtube', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/@...' },
      { key: 'social_tiktok', label: 'TikTok', type: 'url', placeholder: 'https://tiktok.com/@...' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO & Analytics',
    description: 'Zoekmachine optimalisatie en tracking',
    icon: Search,
    fields: [
      { key: 'meta_title', label: 'Meta titel', type: 'text', placeholder: 'Smartlease.nl - Slimmer leasen begint hier', span: 2 },
      { key: 'meta_description', label: 'Meta beschrijving', type: 'textarea', placeholder: 'Jouw partner voor...', span: 2 },
      { key: 'meta_keywords', label: 'Meta keywords', type: 'text', placeholder: 'financial lease, auto lease, ...', span: 2 },
      { key: 'meta_og_image', label: 'OG Image (social share)', type: 'image', span: 2 },
      { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { key: 'google_tag_manager_id', label: 'Google Tag Manager ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notificaties & Email',
    description: 'Email notificaties voor leads en formulieren',
    icon: Bell,
    fields: [
      { key: 'notification_email', label: 'Notificatie e-mail', type: 'email', placeholder: 'info@smartlease.nl' },
      { key: 'notification_lead_subject', label: 'Lead email onderwerp', type: 'text', placeholder: 'Nieuwe lead via Smartlease.nl', span: 2 },
      { key: 'auto_reply_enabled', label: 'Automatisch antwoord', type: 'toggle', hint: 'Stuur automatisch een bevestiging naar de klant' },
      { key: 'auto_reply_message', label: 'Auto-reply bericht', type: 'textarea', placeholder: 'Bedankt voor uw aanvraag!...', span: 2 },
    ],
  },
  {
    id: 'api',
    label: 'API & Limieten',
    description: 'API instellingen en budget',
    icon: Settings,
    fields: [
      { key: 'api_daily_limit', label: 'Dagelijks API limiet', type: 'number', placeholder: '500' },
      { key: 'api_monthly_budget', label: 'Maandelijks budget (€)', type: 'number', placeholder: '50' },
    ],
  },
];

export default function SiteInstellingenPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [originalSettings, setOriginalSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ header: true });
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('key, value')
        .order('key');

      if (fetchError) throw fetchError;

      const map: SettingsMap = {};
      data?.forEach((row) => {
        map[row.key] = row.value;
      });
      setSettings(map);
      setOriginalSettings(map);
    } catch (err: any) {
      setError('Fout bij laden: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      // Alleen gewijzigde settings opslaan
      const changed = Object.entries(settings).filter(
        ([key, value]) => originalSettings[key] !== value
      );

      if (changed.length === 0) {
        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2000);
        return;
      }

      // Batch update via individuele rpc calls
      for (const [key, value] of changed) {
        const { error: rpcError } = await supabase.rpc('update_site_setting', {
          p_key: key,
          p_value: value,
        });
        if (rpcError) throw rpcError;
      }

      setOriginalSettings({ ...settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError('Fout bij opslaan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `${key}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(path);

      handleChange(key, urlData.publicUrl);
    } catch (err: any) {
      setError('Upload fout: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-smartlease-yellow" />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Instellingen</h1>
          <p className="text-gray-500 mt-1">Beheer alle website instellingen op één plek</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Ververs
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              saved
                ? 'bg-green-500 text-white'
                : hasChanges
                ? 'bg-smartlease-yellow text-white hover:bg-smartlease-yellow/90 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Opslaan...' : saved ? 'Opgeslagen!' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && !saved && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Je hebt niet-opgeslagen wijzigingen.
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isOpen = openSections[section.id] || false;

          return (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-smartlease-yellow/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4.5 w-4.5 text-smartlease-yellow" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{section.label}</p>
                    <p className="text-xs text-gray-400">{section.description}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <div
                        key={field.key}
                        className={field.span === 2 ? 'md:col-span-2' : ''}
                      >
                        <SettingField
                          field={field}
                          value={settings[field.key] || ''}
                          onChange={(val) => handleChange(field.key, val)}
                          onUpload={(file) => handleImageUpload(field.key, file)}
                          uploading={uploading === field.key}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Individual field component ────────────────────────────────────── */
function SettingField({
  field,
  value,
  onChange,
  onUpload,
  uploading,
}: {
  field: FieldDef;
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const baseInputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition';

  // Toggle
  if (field.type === 'toggle') {
    const isOn = value === 'true';
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            {field.hint && <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>}
          </div>
          <button
            type="button"
            onClick={() => onChange(isOn ? 'false' : 'true')}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              isOn ? 'bg-smartlease-yellow' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                isOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    );
  }

  // Image upload
  if (field.type === 'image') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
        {field.hint && <p className="text-xs text-gray-400 mb-2">{field.hint}</p>}

        {/* Preview */}
        {value && (
          <div className="mb-3 relative inline-block">
            <img
              src={value}
              alt={field.label}
              className="h-16 max-w-xs object-contain rounded-lg border border-gray-200 bg-gray-50 p-1"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploaden...' : 'Upload'}
          </button>
          <span className="text-xs text-gray-400">of</span>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition"
          />
        </div>
      </div>
    );
  }

  // Color picker
  if (field.type === 'color') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || field.placeholder || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition font-mono"
          />
        </div>
      </div>
    );
  }

  // Textarea
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
        {field.hint && <p className="text-xs text-gray-400 mb-1">{field.hint}</p>}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseInputClass} resize-y`}
        />
      </div>
    );
  }

  // Default: text, email, tel, url, number
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
      {field.hint && <p className="text-xs text-gray-400 mb-1">{field.hint}</p>}
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={baseInputClass}
      />
    </div>
  );
}
