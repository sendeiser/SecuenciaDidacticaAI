import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { signUp, signIn } from '../services/supabase';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result;
            if (isLogin) {
                result = await signIn(formData.email, formData.password);
            } else {
                result = await signUp(formData.email, formData.password, formData.fullName);
            }

            if (result.error) throw result.error;

            onAuthSuccess(result.data.user);
            onClose();
        } catch (err) {
            setError(err.message || 'Error en la autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-forest-100">
                            <Lock className="text-forest-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-2">
                            {isLogin ? 'Ingresa para guardar tus secuencias en la nube.' : 'Únete a la comunidad de docentes innovadores.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                            <AlertCircle size={18} shrink={0} />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1">NOMBRE COMPLETO</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                                        placeholder="Ej: Juan Pérez"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 ml-1">EMAIL</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                                    placeholder="docente@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 ml-1">CONTRASEÑA</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-forest-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? 'INGRESAR' : 'REGISTRARME'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium text-slate-500 hover:text-forest-600 transition-colors"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
