// src/hooks/useFooterSettings.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FooterSettings {
  [key: string]: string;
}

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .like('key', 'footer%');
      
      const map: FooterSettings = {};
      (data || []).forEach(row => { map[row.key] = row.value; });
      setSettings(map);
      setLoading(false);
    }
    load();
  }, []);

  return { settings, loading };
}