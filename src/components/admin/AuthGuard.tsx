import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check huidige sessie
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Als "onthoud mij" UIT was en browser herstart, log uit
      if (session && !sessionStorage.getItem('smartlease_temp_session')) {
        // Normale sessie — bewaar
      } else if (session && sessionStorage.getItem('smartlease_temp_session')) {
        // Tijdelijke sessie — geldig zolang tab open is
      }

      setAuthenticated(!!session);
      setLoading(false);
    };

    checkSession();

    // Luister naar auth veranderingen
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-smartlease-yellow mx-auto mb-3" />
          <p className="text-sm text-gray-500">Laden...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
