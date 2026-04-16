import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineXMark, HiOutlinePhoto } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', link_url: '', position: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    try {
      const res = await adminAPI.getBanners();
      setBanners(res.data.banners);
    } catch {
      toast.error('Erreur chargement bannières');
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('L\'image est requise');

    setSaving(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('link_url', form.link_url);
    formData.append('position', form.position);
    formData.append('image', imageFile);

    try {
      await adminAPI.createBanner(formData);
      toast.success('Bannière ajoutée');
      setShowModal(false);
      resetForm();
      loadBanners();
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const deleteBanner = async (id) => {
    if (!confirm('Supprimer cette bannière ?')) return;
    try {
      await adminAPI.deleteBanner(id);
      toast.success('Bannière supprimée');
      loadBanners();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const resetForm = () => {
    setForm({ title: '', link_url: '', position: 0 });
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Bannières Marketing</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Gestion des publicités écran d'accueil</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Nouvelle Bannière
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
             <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full card text-center py-20">
             <HiOutlinePhoto className="w-12 h-12 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500">Aucune bannière active</p>
          </div>
        ) : banners.map(b => (
          <div key={b.id} className="card group overflow-hidden p-0 border-gray-800/50 hover:border-brand-500/30 transition-all">
             <div className="relative h-40 bg-gray-900">
                <img src={`${uploadBase}${b.image_url}`} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <button onClick={() => deleteBanner(b.id)} className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                      <HiOutlineTrash className="w-5 h-5" />
                   </button>
                </div>
             </div>
             <div className="p-4">
                <h3 className="font-bold text-gray-100 truncate">{b.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1 truncate">{b.link_url || 'Pas de lien'}</p>
                <div className="mt-3 flex items-center justify-between">
                   <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Pos: {b.position}</span>
                   <span className={`w-2 h-2 rounded-full ${b.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500'}`} />
                </div>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/50">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Ajouter une bannière</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Titre Publicitaire</label>
                <input required type="text" placeholder="Ex: Promo Gaz Ramadan" className="input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Visuel (Bannière)</label>
                <div className="relative group cursor-pointer border-2 border-dashed border-gray-800 hover:border-brand-500/50 rounded-3xl overflow-hidden transition-all bg-gray-900/30">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-600 group-hover:text-brand-400">
                      <HiOutlinePhoto className="w-12 h-12 mb-2" />
                      <span className="text-xs font-bold">Cliquer ou glisser l'image</span>
                      <span className="text-[9px] uppercase tracking-tighter mt-1 opacity-50">Format large recommandé (16:9)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Lien de redirection</label>
                   <input type="text" placeholder="Ex: /products/123" className="input w-full" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Position</label>
                   <input type="number" className="input w-full" value={form.position} onChange={e => setForm({ ...form, position: parseInt(e.target.value) })} />
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-all active:scale-95">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl shadow-brand-500/20 active:scale-95 disabled:opacity-50">
                   {saving ? 'Chargement...' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
