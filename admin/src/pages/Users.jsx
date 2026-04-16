import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, User as UserIcon, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:3000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setUsers(res.data.data);
        } catch (error) {
            toast.error('Échec du chargement du terminal');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:3000/api/users/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Statut mis à jour');
            fetchUsers();
        } catch (error) {
            toast.error('Mutation impossible');
        }
    };

    const filteredUsers = users.filter(u => 
        (roleFilter === 'all' || u.role === roleFilter) &&
        (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone?.includes(searchTerm))
    );

    return (
        <div className="animate-fade-in font-outfit">
            {/* Header STITCH */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                <div>
                   <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                      <ShieldCheck className="text-brand-500 w-10 h-10" /> Contrôle des Identités
                   </h1>
                   <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 ml-1">Administration des terminaux utilisateurs</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                   <div className="relative flex-1 md:w-80 group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-brand-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Rechercher (Nom, Mobile)..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-brand-500 transition-all font-bold"
                      />
                   </div>
                   <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2 flex gap-1">
                      {['all', 'client', 'delivery', 'distributor'].map(r => (
                         <button 
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-brand-500 text-black shadow-lg shadow-brand-500/20' : 'text-gray-500 hover:text-white'}`}
                         >
                            {r}
                         </button>
                      ))}
                   </div>
                </div>
            </div>

            {/* Grid des Utilisateurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <AnimatePresence>
                {filteredUsers.map((user, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        key={user.id} 
                        className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-8 rounded-[4rem] flex flex-col items-center text-center relative overflow-hidden group hover:border-brand-500/30 transition-all"
                    >
                        {/* Status Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 ${user.approval_status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`} />

                        <div className="relative">
                            <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center border border-white/10 mb-6 shadow-2xl relative">
                                {user.photo_url ? (
                                    <img src={user.photo_url} className="w-full h-full object-cover rounded-[2.5rem]" />
                                ) : (
                                    <UserIcon size={40} className="text-gray-700" />
                                )}
                                <div className={`absolute -right-2 -bottom-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#050508] ${user.approval_status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                                    {user.approval_status === 'approved' ? <CheckCircle className="text-black" size={20} /> : <Clock className="text-black" size={20} />}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-white tracking-tight leading-none mb-2">{user.full_name}</h3>
                        <p className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-4">{user.role}</p>
                        
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-[11px] mb-8 bg-black/40 px-5 py-2 rounded-full border border-white/5">
                            <span>{user.phone}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-800" />
                            <span className="truncate max-w-[100px]">{user.neighborhood || 'Niamey'}</span>
                        </div>

                        {/* Actions Matrix */}
                        <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                            {user.approval_status !== 'approved' && (
                                <button onClick={() => toggleStatus(user.id, 'approved')} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                                    Valider
                                </button>
                            )}
                            {user.is_active ? (
                                <button onClick={() => toggleStatus(user.id, 'inactive')} className="bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                    Désactiver
                                </button>
                            ) : (
                                <button onClick={() => toggleStatus(user.id, 'active')} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                                    Réactiver
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
               </AnimatePresence>
            </div>
        </div>
    );
};

export default Users;
