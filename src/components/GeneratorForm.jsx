import React from 'react';
import {
    School,
    User,
    IdCard,
    Phone,
    Mail,
    GraduationCap,
    Sparkles,
    BookOpen,
    ClipboardList,
    Loader2
} from 'lucide-react';

const FormField = ({ label, name, icon, value, onChange, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-forest-600 transition-colors">{icon}</div>
            <input
                required
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs focus:ring-2 focus:ring-forest-500/10 focus:border-forest-600 outline-none transition-all"
            />
        </div>
    </div>
);

const GeneratorForm = ({ formData, onChange, onSubmit, loading, error }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 gap-4">
                <FormField label="Institución" name="escuela" icon={<School className="w-3.5 h-3.5" />} value={formData.escuela} onChange={onChange} placeholder="Ej. Colegio Nacional" />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datos del Docente</h3>
                <FormField label="Nombre y Apellido" name="docente" icon={<User className="w-3.5 h-3.5" />} value={formData.docente} onChange={onChange} placeholder="Nombre completo" />
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="DNI" name="dni" icon={<IdCard className="w-3.5 h-3.5" />} value={formData.dni} onChange={onChange} placeholder="8.888.888" />
                    <FormField label="Teléfono" name="telefono" icon={<Phone className="w-3.5 h-3.5" />} value={formData.telefono} onChange={onChange} placeholder="3826..." />
                </div>
                <FormField label="Email" name="email" icon={<Mail className="w-3.5 h-3.5" />} value={formData.email} onChange={onChange} placeholder="correo@ejemplo.com" />
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalles Académicos</h3>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Ciclo" name="ciclo" icon={<GraduationCap className="w-3.5 h-3.5" />} value={formData.ciclo} onChange={onChange} placeholder="Ej. Ciclo Básico" />
                    <FormField label="Año" name="año" icon={<GraduationCap className="w-3.5 h-3.5" />} value={formData.año} onChange={onChange} placeholder="Ej. 1er Año" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Materia" name="materia" icon={<ClipboardList className="w-3.5 h-3.5" />} value={formData.materia} onChange={onChange} placeholder="Ej. Física" />
                    <FormField label="Año Lectivo" name="anioLectivo" icon={<Sparkles className="w-3.5 h-3.5" />} value={formData.anioLectivo} onChange={onChange} placeholder="Ej. 2024" />
                </div>
                <FormField label="Eje Temático / Contenidos" name="tematica" icon={<BookOpen className="w-3.5 h-3.5" />} value={formData.tematica} onChange={onChange} placeholder="Ej. Leyes de Newton, Energía..." />
                <FormField label="Título" name="titulo" icon={<Sparkles className="w-3.5 h-3.5" />} value={formData.titulo} onChange={onChange} placeholder="Título de la secuencia" />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N° de Clases</label>
                        <select
                            name="numClases"
                            value={formData.numClases}
                            onChange={onChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs focus:ring-2 focus:ring-forest-500/10 focus:border-forest-600 outline-none transition-all"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Clase' : 'Clases'}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metodología</label>
                        <select
                            name="tipoActividades"
                            value={formData.tipoActividades}
                            onChange={onChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs focus:ring-2 focus:ring-forest-500/10 focus:border-forest-600 outline-none transition-all"
                        >
                            {['Mixtas', 'Teóricas', 'Prácticas', 'Laboratorio', 'Salida de Campo', 'Evaluación'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividades por Clase</label>
                        <select
                            name="cantActividades"
                            value={formData.cantActividades}
                            onChange={onChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs focus:ring-2 focus:ring-forest-500/10 focus:border-forest-600 outline-none transition-all"
                        >
                            {['2', '3', '4', '5', '6'].map(n => <option key={n} value={n}>{n} Actividades</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variedad Práctica</label>
                        <select
                            name="variedadActividades"
                            value={formData.variedadActividades}
                            onChange={onChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs focus:ring-2 focus:ring-forest-500/10 focus:border-forest-600 outline-none transition-all"
                        >
                            {['Baja', 'Media', 'Alta', 'Extrema'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.incluirVideos ? 'bg-forest-600 border-forest-600' : 'bg-white border-slate-300'}`}>
                        {formData.incluirVideos && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.incluirVideos} onChange={() => onChange({ target: { name: 'incluirVideos', value: !formData.incluirVideos } })} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Incluir Videos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.incluirImagenes ? 'bg-forest-600 border-forest-600' : 'bg-white border-slate-300'}`}>
                        {formData.incluirImagenes && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.incluirImagenes} onChange={() => onChange({ target: { name: 'incluirImagenes', value: !formData.incluirImagenes } })} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Sugerir Imágenes</span>
                </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-forest-300" />}
                {loading ? 'Redactando...' : 'Generar planificación'}
            </button>

            {error && <p className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        </form>
    );
};

export default GeneratorForm;
