import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Branding = () => {
    const [config, setConfig] = useState({
        platform_name: 'TODJOM GAZ',
        primary_color: '#ff8c00',
        secondary_color: '#050507',
        platform_logo_url: '',
        background_image_url: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/config');
            if (res.data.success && res.data.data) {
                setConfig(res.data.data);
            }
        } catch (error) {
            toast.error('Erreur lors du chargement de la config');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:3000/api/config', config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Branding mis à jour avec succès !');
                // Optionnel: Recharger la page pour appliquer les couleurs
                window.location.reload();
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-black mb-8 text-white">Personnalisation Plateforme</h1>
            
            <form onSubmit={handleSave} className="space-y-6 bg-gray-900 p-8 rounded-3xl border border-white/5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nom de la Plateforme</label>
                    <input 
                        type="text" 
                        value={config.platform_name} 
                        onChange={(e) => setConfig({...config, platform_name: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-brand-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Couleur Principale</label>
                        <div className="flex gap-4">
                            <input 
                                type="color" 
                                value={config.primary_color} 
                                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                                className="h-14 w-14 bg-transparent border-none outline-none cursor-pointer"
                            />
                            <input 
                                type="text" 
                                value={config.primary_color}
                                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">URL du Logo</label>
                    <input 
                        type="text" 
                        value={config.platform_logo_url} 
                        onChange={(e) => setConfig({...config, platform_logo_url: e.target.value})}
                        placeholder="https://exemple.com/logo.png"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-brand-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">URL Image de Fond</label>
                    <input 
                        type="text" 
                        value={config.background_image_url} 
                        onChange={(e) => setConfig({...config, background_image_url: e.target.value})}
                        placeholder="https://exemple.com/bg.jpg"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-brand-500 outline-none"
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-brand-500 text-black font-black py-4 rounded-xl hover:bg-brand-400 transition-all uppercase tracking-widest mt-4"
                >
                    Appliquer le Branding
                </button>
            </form>
        </div>
    );
};

export default Branding;
