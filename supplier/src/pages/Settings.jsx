import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { HiOutlineBuildingOffice2, HiOutlineCamera, HiOutlineUser, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setUser(res.data);
      const uploadBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');
      if (res.data.supplier?.logo_url) {
        setLogoPreview(`${uploadBase}${res.data.supplier.logo_url}`);
      }
    } catch (err) {
      toast.error('Erreur de chargement du profil');
    }
    setLoading(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (logoFile) formData.append('logo', logoFile);
      
      // On pourrait ajouter d'autres champs ici
      await userAPI.updateSupplierProfile(formData);
      toast.success('Profil mis à jour !');
      loadProfile();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <HiOutlineBuildingOffice2 className="w-8 h-8 text-brand-500" />
        <h2 className="text-2xl font-black text-white">PARAMÈTRES DE L'ENTREPRISE</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="card text-center p-8">
          <div className="relative inline-block group cursor-pointer" onClick={() => document.getElementById('logo-upload').click()}>
            <div className="w-32 h-32 rounded-3xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-500">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-gray-500 flex flex-col items-center gap-2">
                  <HiOutlineCamera className="w-8 h-8" />
                  <span className="text-[10px] uppercase font-bold">Votre Logo</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-2 rounded-xl shadow-lg border border-gray-900 scale-0 group-hover:scale-100 transition-transform">
              <HiOutlineCamera className="w-5 h-5" />
            </div>
            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoChange} />
          </div>
          <p className="text-xs text-gray-500 mt-4 uppercase font-bold tracking-widest">Cliquez pour modifier votre logo institutionnel</p>
        </div>

        {/* Info Section */}
        <div className="card space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Propriétaire</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <HiOutlineUser className="text-brand-500" />
                <span className="text-white font-medium">{user?.full_name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Téléphone</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <HiOutlinePhone className="text-brand-500" />
                <span className="text-white font-medium">{user?.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Adresse Physique</label>
            <div className="flex items-start gap-3 px-4 py-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <HiOutlineMapPin className="mt-1 text-brand-500" />
              <span className="text-white font-medium">{user?.address || 'Non spécifiée'}</span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving || !logoFile}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        >
          {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER LES MODIFICATIONS'}
        </button>
      </form>
    </div>
  );
}
