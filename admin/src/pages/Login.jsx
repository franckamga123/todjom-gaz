import { useState, useEffect } from 'react';
import { HiOutlineFire, HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    
    if (token && userParam) {
      handleAutoLogin(token, userParam);
    }
  }, []);

  const handleAutoLogin = async (urlToken, urlUser) => {
    setLoading(true);
    try {
      const decodedUser = JSON.parse(decodeURIComponent(urlUser));
      if (decodedUser?.role === 'admin') {
        localStorage.setItem('token', urlToken);
        toast.success('Connexion reussie');
        onLogin(decodedUser, { accessToken: urlToken });
      }
    } catch (err) {
      console.error('Auto-login failed', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ login, password });
      if (res.data?.user?.role !== 'admin') {
        toast.error('Acces reserve aux admins');
        setLoading(false);
        return;
      }
      toast.success('Bienvenue');
      onLogin(res.data.user, res.data.tokens);
    } catch (err) {
      toast.error(err.message || 'Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 font-outfit">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="relative inline-block w-24 h-24 rounded-3xl bg-brand-500 flex items-center justify-center shadow-2xl mb-6 mx-auto">
             <HiOutlineFire className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            TODJOM <span className="text-brand-500">GAZ</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Administration</p>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-[40px] p-8 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                <HiOutlineUser className="w-3.5 h-3.5" /> Identifiant
              </label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="Login"
                className="w-full bg-gray-800 border border-white/5 text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>

            <div className="space-y-2">
               <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                <HiOutlineLockClosed className="w-3.5 h-3.5" /> Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-white/5 text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                >
                  {showPwd ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest transition-colors">
              {loading ? 'Chargement...' : 'Connexion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
