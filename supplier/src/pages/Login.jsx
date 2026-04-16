import { useState, useEffect } from 'react';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { BiGasPump } from 'react-icons/bi';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifier si un token est present dans l'URL (via le portail unifié)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      handleAutoLogin(token);
    }
  }, []);

  const handleAutoLogin = async (token) => {
    setLoading(true);
    try {
      localStorage.setItem('token', token);
      const res = await authAPI.getProfile();
      if (res.data?.role === 'supplier' || res.data?.role === 'distributor') {
        toast.success(`Connexion automatique : ${res.data.full_name}`);
        // Note: On recupere les infos supplier via un deuxieme appel si besoin, 
        // ou on laisse le dashboard s'en charger au montage
        onLogin(res.data, res.data.supplier || null, { accessToken: token });
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Auto-login failed', err);
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ login, password });
      if (res.data?.user?.role !== 'supplier' && res.data?.user?.role !== 'distributor') {
        toast.error('Accès réservé aux partenaires agréés');
        setLoading(false);
        return;
      }
      toast.success(`Bienvenue, ${res.data.user.full_name} !`);
      onLogin(res.data.user, res.data.supplier || null, res.data.tokens);
    } catch (err) {
      toast.error(err.message || 'Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/6 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/4 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/30 mb-4 animate-pulse-glow">
            <BiGasPump className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TODJOM GAZ</h1>
          <p className="text-gray-400 mt-1 text-sm">Espace Fournisseur</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email ou Téléphone</label>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)}
              placeholder="contact@nigergaz.ne" className="input w-full" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input w-full pr-11" required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">© 2026 Todjom — Distribution de gaz domestique</p>
      </div>
    </div>
  );
}
