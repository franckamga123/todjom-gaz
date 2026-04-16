import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2, Package, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBrand, setCurrentBrand] = useState({
        name: '',
        logo_url: '',
        price_3kg: 2000,
        price_6kg: 3500,
        price_12kg: 7500
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/brands');
            if (res.data.success) setBrands(res.data.data);
        } catch (error) {
            toast.error('Erreur chargement des marques');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (isEditing) {
                await axios.put(`http://localhost:3000/api/brands/${currentBrand.id}`, currentBrand, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Marque mise à jour');
            } else {
                await axios.post('http://localhost:3000/api/brands', currentBrand, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Nouvelle marque ajoutée');
            }
            setIsEditing(false);
            setCurrentBrand({ name: '', logo_url: '', price_3kg: 2000, price_6kg: 3500, price_12kg: 7500 });
            fetchBrands();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        }
    };

    const deleteBrand = async (id) => {
        if (!window.confirm('Supprimer cette marque et ses prix ?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3000/api/brands/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Marque supprimée');
            fetchBrands();
        } catch (error) {
            toast.error('Erreur suppression');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-12">
                <div>
                   <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                      <Tag className="text-brand-500 w-10 h-10" /> Catalogue des Marques
                   </h1>
                   <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 ml-1">Gestion des barèmes de prix TODJOM</p>
                </div>
                
                <button 
                    onClick={() => {
                        setIsEditing(false);
                        setCurrentBrand({ name: '', logo_url: '', price_3kg: 2000, price_6kg: 3500, price_12kg: 7500 });
                    }}
                    className="bg-brand-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl shadow-brand-500/20"
                >
                    + Nouvelle Marque
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Liste STITCH */}
                <div className="lg:col-span-2 space-y-4">
                    {brands.map((brand, index) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: index * 0.1 }}
                          key={brand.id} 
                          className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all group"
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-black rounded-3xl overflow-hidden flex items-center justify-center p-3 border border-white/10 shadow-2xl group-hover:rotate-6 transition-transform">
                                    {brand.logo_url ? <img src={brand.logo_url} className="w-full object-contain" alt="" /> : <Package className="text-gray-800 w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">{brand.name}</h3>
                                    <div className="flex gap-4 mt-3">
                                        <div className="px-3 py-1.5 bg-brand-500/10 rounded-xl border border-brand-500/20">
                                           <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">3kg: {brand.price_3kg} F</span>
                                        </div>
                                        <div className="px-3 py-1.5 bg-brand-500/10 rounded-xl border border-brand-500/20">
                                           <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">6kg: {brand.price_6kg} F</span>
                                        </div>
                                        <div className="px-3 py-1.5 bg-brand-500/10 rounded-xl border border-brand-500/20">
                                           <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">12kg: {brand.price_12kg} F</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setIsEditing(true); setCurrentBrand(brand); }} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center border border-white/5 transition-all"><Edit2 size={18}/></button>
                                <button onClick={() => deleteBrand(brand.id)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-red-500 rounded-2xl flex items-center justify-center border border-white/5 transition-all"><Trash2 size={18}/></button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Formulaire STITCH */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] h-fit sticky top-32">
                    <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase text-[12px] opacity-60 font-bold">{isEditing ? 'Édition' : 'Initialisation'} Marque</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Identité de la marque</label>
                            <input type="text" value={currentBrand.name} onChange={e => setCurrentBrand({...currentBrand, name: e.target.value})} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Asset Logo (URL)</label>
                            <input type="text" value={currentBrand.logo_url} onChange={e => setCurrentBrand({...currentBrand, logo_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                        </div>
                        
                        <div className="pt-6 grid grid-cols-1 gap-4">
                            {[
                                { k: '3kg', label: 'Tarif Sunkoutou (3KG)' },
                                { k: '6kg', label: 'Tarif Petit (6KG)' },
                                { k: '12kg', label: 'Tarif Standard (12KG)' }
                            ].map(p => (
                                <div key={p.k} className="p-5 bg-black/40 rounded-3xl border border-white/5">
                                    <label className="text-[9px] font-black text-brand-500 uppercase tracking-widest">{p.label}</label>
                                    <input type="number" value={currentBrand[`price_${p.k}`]} onChange={e => setCurrentBrand({...currentBrand, [`price_${p.k}`]: e.target.value})} className="w-full bg-transparent text-2xl font-black text-white outline-none mt-1"/>
                                </div>
                            ))}
                        </div>
                        
                        <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-[2rem] mt-6 tracking-widest text-[11px] uppercase shadow-2xl hover:bg-brand-500 transition-all">
                            Sauvegarder les Données
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Brands;
