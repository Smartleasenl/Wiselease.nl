import { useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('Ongeldig e-mailadres of wachtwoord.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Als "Onthoud mij" UIT staat, sessie opruimen bij browser sluiten
        if (!rememberMe) {
          // Sla een flag op zodat we bij page load de sessie kunnen checken
          sessionStorage.setItem('smartlease_temp_session', 'true');
        } else {
          sessionStorage.removeItem('smartlease_temp_session');
        }
        navigate('/admin');
      }
    } catch (err) {
      setError('Er ging iets mis. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/smart-lease-logo.gif"
            alt="Smartlease.nl"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-1">Log in om je website te beheren</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
          {/*
            BELANGRIJK: We gebruiken een gewoon <form> met name="login" en
            autocomplete attributen. Dit zorgt ervoor dat Chrome/Firefox/Safari
            aanbiedt om het wachtwoord op te slaan.
          */}
          <form name="login" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mailadres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartlease.nl"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal 
                  transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal 
                    transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-smartlease-teal focus:ring-smartlease-teal/30 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Onthoud mij</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                bg-smartlease-teal text-white font-semibold 
                hover:bg-smartlease-teal/90 active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Smartlease.nl — Admin Panel
        </p>
      </div>
    </div>
  );
}
