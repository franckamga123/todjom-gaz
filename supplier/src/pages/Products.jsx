import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const gasTypes = ['Bouteille 6 kg', 'Bouteille 12 kg', 'Bouteille 15 kg'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product (edit)
  const [form, setForm] = useState({ gas_type: '', weight_kg: '', price_cfa: '', stock_quantity: '', min_stock_alert: 5, description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await productAPI.getMyProducts();
      setProducts(res.data?.products || []);
    } catch {
      setProducts(getDemoProducts());
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

  const openCreate = () => {
    setForm({ gas_type: gasTypes[0], weight_kg: 6, price_cfa: '', stock_quantity: '', min_stock_alert: 5, description: '' });
    setImageFile(null);
    setImagePreview(null);
    setModal('create');
  };

  const openEdit = (p) => {
    setForm({
      gas_type: p.gas_type, weight_kg: p.weight_kg,
      price_cfa: p.price_cfa, stock_quantity: p.stock_quantity,
      min_stock_alert: p.min_stock_alert || 5, description: p.description || ''
    });
    setImageFile(null);
    const uploadBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');
    setImagePreview(p.image_url ? `${uploadBase}${p.image_url}` : null);
    setModal(p);
  };

  const handleGasTypeChange = (type) => {
    const weights = { 'Bouteille 6 kg': 6, 'Bouteille 12 kg': 12, 'Bouteille 15 kg': 15 };
    setForm(prev => ({ ...prev, gas_type: type, weight_kg: weights[type] || 6 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (modal === 'create') {
        await productAPI.create(formData);
        toast.success('Produit créé !');
      } else {
        await productAPI.update(modal.id, formData);
        toast.success('Produit mis à jour !');
      }
      setModal(null);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Produit supprimé');
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{products.length} produit(s) dans votre catalogue</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> Ajouter un produit
        </button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.map((p, i) => {
          const isLow = (p.stock_quantity || 0) <= (p.min_stock_alert || 5);
          const uploadBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');
          const imgUrl = p.image_url ? `${uploadBase}${p.image_url}` : null;
          
          return (
            <div key={p.id || i} className={`card-hover animate-fade-in ${isLow ? 'border-red-500/30' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}>
              {/* Gas type header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.gas_type} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">⛽</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg leading-tight">{p.gas_type}</h3>
                    <p className="text-xs text-gray-500 border-l-2 border-brand-500 pl-2 mt-1">{p.weight_kg} kg</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-gray-400 hover:text-brand-400 hover:bg-brand-500/10">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">{formatCFA(p.price_cfa)}</p>
                <p className="text-xs text-gray-500">Prix unitaire</p>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40">
                <div>
                  <p className="text-xs text-gray-400">Stock</p>
                  <p className={`text-lg font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                    {p.stock_quantity} unités
                  </p>
                </div>
                {isLow && (
                  <div className="flex items-center gap-1 text-red-400">
                    <HiOutlineExclamationTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase">Critique</span>
                  </div>
                )}
                <span className={p.is_available !== false ? 'badge-success' : 'badge-danger'}>
                  {p.is_available !== false ? 'Disponible' : 'Indisponible'}
                </span>
              </div>

              {/* Description */}
              {p.description && (
                <p className="text-xs text-gray-500 mt-3 line-clamp-2">{p.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {!loading && products.length === 0 && (
        <div className="card text-center py-12">
          <span className="text-4xl mb-3 block">⛽</span>
          <p className="text-gray-400">Aucun produit dans votre catalogue</p>
          <button onClick={openCreate} className="btn-primary mt-4 text-sm">Ajouter votre premier produit</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="card max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-white">
                {modal === 'create' ? '➕ Nouveau produit' : '✏️ Modifier le produit'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Logo / Image du produit</label>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">📸</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="product-image" />
                    <label htmlFor="product-image" className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                      {imageFile ? 'Changer l\'image' : 'Sélectionner une image'}
                    </label>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG jusqu'à 2 Mo</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Type de gaz</label>
                <div className="flex gap-2">
                  {gasTypes.map(type => (
                    <button key={type} type="button" onClick={() => handleGasTypeChange(type)}
                      className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                        form.gas_type === type
                          ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Prix (CFA)</label>
                  <input type="number" value={form.price_cfa} onChange={e => setForm(f => ({ ...f, price_cfa: e.target.value }))}
                    placeholder="3500" className="input w-full" required min="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock</label>
                  <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                    placeholder="50" className="input w-full" required min="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Seuil d'alerte stock</label>
                <input type="number" value={form.min_stock_alert} onChange={e => setForm(f => ({ ...f, min_stock_alert: e.target.value }))}
                  className="input w-full" min="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (optionnel)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description du produit..." className="input w-full h-20 resize-none" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                    modal === 'create' ? 'Créer le produit' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary text-sm">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getDemoProducts() {
  return [
    { id: '1', gas_type: 'Bouteille 6 kg', weight_kg: 6, price_cfa: 3500, stock_quantity: 45, min_stock_alert: 5, is_available: true, description: 'Gaz butane domestique certifié' },
    { id: '2', gas_type: 'Bouteille 12 kg', weight_kg: 12, price_cfa: 6500, stock_quantity: 3, min_stock_alert: 5, is_available: true, description: 'Gaz butane domestique certifié' },
    { id: '3', gas_type: 'Bouteille 15 kg', weight_kg: 15, price_cfa: 8500, stock_quantity: 22, min_stock_alert: 5, is_available: true, description: 'Gaz butane domestique certifié' },
  ];
}
