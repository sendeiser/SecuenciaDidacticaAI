import React, { useState, useEffect } from 'react';
import { X, User, School, IdCard, Phone, BookOpen, GraduationCap, Sprout, Loader2, CheckCircle, Save } from 'lucide-react';
import { updateProfile } from '../services/supabase';

const ProfileModal = ({ isOpen, onClose, user, profile, onProfileUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        escuela_default: '',
        dni_default: '',
        telefono_default: '',
        ciclo_default: '',
        anio_default: '',
        materia_default: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                escuela_default: profile.escuela_default || '',
                dni_default: profile.dni_default || '',
                telefono_default: profile.telefono_default || '',
                ciclo_default: profile.ciclo_default || '',
                anio_default: profile.anio_default || '',
                materia_default: profile.materia_default || ''
            });
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const { data, error } = await updateProfile(user.id, formData);
            if (error) throw error;

            if (data) {
                onProfileUpdate(data[0]);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            alert('Error al actualizar el perfil: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-forest-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl ring-1 ring-white/20">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">Mi Perfil Docente</h2>
                            <p className="text-forest-300 text-[10px] uppercase font-bold tracking-widest mt-0.5">Datos Predeterminados</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                    {/* Sección Personal */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <User size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Información Personal</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 italic">Nombre Completo</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Ej: Martin Gonzalez"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 italic">DNI</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm"
                                    value={formData.dni_default}
                                    onChange={(e) => setFormData({ ...formData, dni_default: e.target.value })}
                                    placeholder="Ej: 37.187.050"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 italic">Teléfono / Celular</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm"
                                        value={formData.telefono_default}
                                        onChange={(e) => setFormData({ ...formData, telefono_default: e.target.value })}
                                        placeholder="Ej: 3826432180"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección Profesional */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400">
                            <GraduationCap size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Información Profesional</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 italic">Institución / Escuela</label>
                                <div className="relative">
                                    <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm"
                                        value={formData.escuela_default}
                                        onChange={(e) => setFormData({ ...formData, escuela_default: e.target.value })}
                                        placeholder="Ej: Escuela de Comercio"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 ml-1 italic">Materia Principal</label>
                                    <div className="relative">
                                        <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm"
                                            value={formData.materia_default}
                                            onChange={(e) => setFormData({ ...formData, materia_default: e.target.value })}
                                            placeholder="Ej: Matemática I"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 ml-1 italic">Ciclo</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm appearance-none"
                                        value={formData.ciclo_default}
                                        onChange={(e) => setFormData({ ...formData, ciclo_default: e.target.value })}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Basico">Ciclo Básico</option>
                                        <option value="Orientado">Ciclo Orientado</option>
                                        <option value="Superior">Nivel Superior</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 italic">Año / Curso Predeterminado</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none text-sm"
                                    value={formData.anio_default}
                                    onChange={(e) => setFormData({ ...formData, anio_default: e.target.value })}
                                    placeholder="Ej: 1er Año"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className={`w-full py-4 rounded-2xl font-black tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${success
                            ? 'bg-emerald-500 text-white'
                            : 'bg-forest-900 text-white hover:bg-forest-800'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : success ? (
                            <>
                                <CheckCircle size={18} />
                                ¡GUARDADO CON ÉXITO!
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                GUARDAR PRECONFIGURACIÓN
                            </>
                        )}
                    </button>
                    <p className="text-center text-[9px] text-slate-400 mt-3 font-semibold uppercase tracking-wider">
                        Tus datos se autocompletarán automáticamente al iniciar una nueva secuencia
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
