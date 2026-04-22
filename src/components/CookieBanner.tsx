import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1e3a5f', color: '#fff', padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
      borderTop: '3px solid #f0b429',
    }}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, flex: 1, minWidth: 260 }}>
        🍪 Wij gebruiken cookies voor analytics en een betere gebruikerservaring.{' '}
        <a href="/cookiebeleid" style={{ color: '#f0b429', textDecoration: 'underline' }}>Meer info</a>
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
          background: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontSize: 13,
        }}>
          Weigeren
        </button>
        <button onClick={accept} style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#f0b429', color: '#1e3a5f', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        }}>
          Accepteren
        </button>
      </div>
    </div>
  );
}
