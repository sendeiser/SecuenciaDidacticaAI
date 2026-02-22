import React, { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import {
    Send,
    FileText,
    Loader2,
    User,
    BookOpen,
    GraduationCap,
    IdCard,
    Sprout,
    LayoutDashboard,
    Sparkles,
    Info,
    Mail,
    Phone,
    School,
    MapPin,
    ClipboardList,
    Edit3,
    Download,
    FileDown,
    Eye,
    ChevronDown,
    ChevronUp,
    Save,
    Youtube,
    Image as ImageIcon,
    Plus,
    X,
    ExternalLink
} from 'lucide-react';
import PlantillaETA from './PlantillaETA';
import { generatePlanning, generateWizardQuestions } from '../services/gemini';
import { exportToWord } from '../services/wordExport';

const Dashboard = () => {
    const [formData, setFormData] = useState({
        escuela: '',
        docente: '',
        dni: '',
        email: '',
        telefono: '',
        ciclo: '',
        año: '',
        materia: '',
        tematica: '',
        titulo: '',
        incluirVideos: true,
        incluirImagenes: true,
        numClases: 3,
        tipoActividades: 'Mixtas',
        anioLectivo: new Date().getFullYear().toString(),
        cantActividades: '3',
        variedadActividades: 'Media'
    });

    const [loading, setLoading] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [planningData, setPlanningData] = useState(null);
    const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'questions', 'editor'
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [wizardData, setWizardData] = useState({});
    const [aiQuestions, setAiQuestions] = useState([]);
    const [showWizard, setShowWizard] = useState(false);
    const [savedFormData, setSavedFormData] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Safely converts any value (object, array, etc.) to a plain string
    const toSafeStr = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) return val.join('\n');
        if (typeof val === 'object') {
            return Object.entries(val)
                .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                .join('\n\n');
        }
        return String(val);
    };

    // Sanitize all class text fields before storing (AI may return objects)
    const sanitizePlanningData = (data) => {
        if (!data) return data;
        return {
            ...data,
            clases: (data.clases || []).map(clase => ({
                ...clase,
                inicio: toSafeStr(clase.inicio),
                desarrollo: toSafeStr(clase.desarrollo),
                cierre: toSafeStr(clase.cierre),
                diferenciacion: toSafeStr(clase.diferenciacion),
                metacognicion: toSafeStr(clase.metacognicion),
                errores_intervenciones: toSafeStr(clase.errores_intervenciones),
            }))
        };
    };

    const handleUpdatePlanning = (path, value) => {
        const newData = JSON.parse(JSON.stringify(planningData));
        const keys = path.split('.');
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setPlanningData(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingQuestions(true);
        setError(null);
        try {
            const questions = await generateWizardQuestions(formData);
            setAiQuestions(questions);

            // Initialize wizardData with question IDs
            const initialWizardData = {};
            questions.forEach(q => {
                initialWizardData[q.id] = q.tipo === 'select' ? (q.opciones?.[0] || '') : '';
            });
            setWizardData(initialWizardData);

            setSavedFormData(formData);
            setShowWizard(true);
        } catch (err) {
            setError('Error al conectar con la IA para las preguntas. Reintenta.');
            console.error(err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleWizardSubmit = async () => {
        setLoading(true);
        setError(null);
        setShowWizard(false);
        try {
            const data = await generatePlanning(savedFormData, wizardData);
            setPlanningData(sanitizePlanningData(data));
            setActiveTab('editor');
        } catch (err) {
            setError('Error al generar la secuencia. Verifica tu conexión y cuota de Groq.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] font-sans selection:bg-forest-100 selection:text-forest-900">

            {/* ── LOADING QUESTIONS OVERLAY ── */}
            {loadingQuestions && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-forest-900/90 backdrop-blur-md animate-fade-in text-white p-6 text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 border-4 border-white/20 border-t-forest-300 rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-forest-300 animate-pulse" size={30} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Personalizando tu experiencia...</h2>
                    <p className="text-forest-300 text-sm max-w-sm">La IA está analizando tu tema para generarte preguntas específicas de tu materia.</p>
                </div>
            )}

            {/* ── WIZARD MODAL OVERLAY ── */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        {/* Wizard Header */}
                        <div className="bg-forest-900 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={60} className="text-white" /></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="bg-white/10 p-2 rounded-xl"><Sparkles className="text-forest-300 w-5 h-5" /></div>
                                <div>
                                    <h2 className="text-white font-bold text-base">Preguntas de personalización</h2>
                                    <p className="text-forest-300 text-xs">Estas respuestas harán tu secuencia única y precisa</p>
                                </div>
                            </div>
                        </div>

                        {/* Wizard Questions */}
                        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                            {aiQuestions.map((q, idx) => (
                                <div key={q.id}>
                                    {q.tipo === 'select' ? (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 bg-forest-100 text-forest-700 rounded-full text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                                                <label className="text-xs font-bold text-slate-600">{q.label}</label>
                                            </div>
                                            <select
                                                value={wizardData[q.id] || ''}
                                                onChange={(e) => setWizardData({ ...wizardData, [q.id]: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 outline-none"
                                            >
                                                {(q.opciones || []).map(o => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <WizardQuestion
                                            number={idx + 1}
                                            label={q.label}
                                            placeholder={q.placeholder}
                                            type={q.tipo}
                                            value={wizardData[q.id] || ''}
                                            onChange={(v) => setWizardData({ ...wizardData, [q.id]: v })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Wizard Footer */}
                        <div className="p-5 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowWizard(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
                            >
                                Volver al formulario
                            </button>
                            <button
                                onClick={handleWizardSubmit}
                                className="flex-1 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-forest-300" />
                                Generar secuencia
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar: Generator or Editor */}
            <aside className="w-[500px] h-full bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-20 flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="p-6 pb-4 border-b border-slate-100 bg-forest-900 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sprout size={80} className="text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-1 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl ring-1 ring-white/20">
                            <LayoutDashboard className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Maestro de Secuencias</h1>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex mt-6 bg-forest-950/40 p-1 rounded-xl relative z-10 ring-1 ring-white/5">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'generator' ? 'bg-white text-forest-900 shadow-lg' : 'text-forest-300 hover:text-white'}`}
                        >
                            <ClipboardList className="w-3.5 h-3.5" />
                            Generador
                        </button>
                        <button
                            onClick={() => planningData && setActiveTab('editor')}
                            disabled={!planningData}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white text-forest-900 shadow-lg' : 'text-forest-300 hover:text-white disabled:opacity-30'}`}
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Editor Real
                        </button>
                    </div>
                </div>

                {/* Dynamic Column */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
                    {activeTab === 'generator' ? (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 gap-4">
                                <FormField label="Institución" name="escuela" icon={<School className="w-3.5 h-3.5" />} value={formData.escuela} onChange={handleChange} placeholder="Ej. Colegio Nacional" />
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datos del Docente</h3>
                                <FormField label="Nombre y Apellido" name="docente" icon={<User className="w-3.5 h-3.5" />} value={formData.docente} onChange={handleChange} placeholder="Nombre completo" />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="DNI" name="dni" icon={<IdCard className="w-3.5 h-3.5" />} value={formData.dni} onChange={handleChange} placeholder="8.888.888" />
                                    <FormField label="Teléfono" name="telefono" icon={<Phone className="w-3.5 h-3.5" />} value={formData.telefono} onChange={handleChange} placeholder="3826..." />
                                </div>
                                <FormField label="Email" name="email" icon={<Mail className="w-3.5 h-3.5" />} value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalles Académicos</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Ciclo" name="ciclo" icon={<GraduationCap className="w-3.5 h-3.5" />} value={formData.ciclo} onChange={handleChange} placeholder="Ej. Ciclo Básico" />
                                    <FormField label="Año" name="año" icon={<GraduationCap className="w-3.5 h-3.5" />} value={formData.año} onChange={handleChange} placeholder="Ej. 1er Año" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Materia" name="materia" icon={<ClipboardList className="w-3.5 h-3.5" />} value={formData.materia} onChange={handleChange} placeholder="Ej. Física" />
                                    <FormField label="Año Lectivo" name="anioLectivo" icon={<Sparkles className="w-3.5 h-3.5" />} value={formData.anioLectivo} onChange={handleChange} placeholder="Ej. 2024" />
                                </div>
                                <FormField label="Eje Temático / Contenidos" name="tematica" icon={<BookOpen className="w-3.5 h-3.5" />} value={formData.tematica} onChange={handleChange} placeholder="Ej. Leyes de Newton, Energía..." />
                                <FormField label="Título" name="titulo" icon={<Sparkles className="w-3.5 h-3.5" />} value={formData.titulo} onChange={handleChange} placeholder="Título de la secuencia" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N° de Clases</label>
                                        <select
                                            name="numClases"
                                            value={formData.numClases}
                                            onChange={handleChange}
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
                                            onChange={handleChange}
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
                                            onChange={handleChange}
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
                                            onChange={handleChange}
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
                                    <input type="checkbox" className="hidden" checked={formData.incluirVideos} onChange={() => setFormData({ ...formData, incluirVideos: !formData.incluirVideos })} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Incluir Videos</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.incluirImagenes ? 'bg-forest-600 border-forest-600' : 'bg-white border-slate-300'}`}>
                                        {formData.incluirImagenes && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.incluirImagenes} onChange={() => setFormData({ ...formData, incluirImagenes: !formData.incluirImagenes })} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Sugerir Imágenes</span>
                                </label>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-forest-300" />}
                                {loading ? 'Redactando...' : 'Generar planificación'}
                            </button>

                            {error && <p className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                        </form>
                    ) : (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-700">Edición en tiempo real</h2>
                                <span className="text-[10px] text-forest-600 font-bold bg-forest-50 px-2 py-1 rounded-md">CAMBIOS SE GUARDAN AL PDF</span>
                            </div>

                            <Accordion
                                title="1. Fundamentación"
                                isOpen={editingSection === 'fund'}
                                onClick={() => setEditingSection(editingSection === 'fund' ? null : 'fund')}
                            >
                                <textarea
                                    className="w-full h-40 p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none"
                                    value={planningData.fundamentacion}
                                    onChange={(e) => handleUpdatePlanning('fundamentacion', e.target.value)}
                                />
                            </Accordion>

                            <Accordion
                                title="2. Propósitos y Objetivos"
                                isOpen={editingSection === 'goals'}
                                onClick={() => setEditingSection(editingSection === 'goals' ? null : 'goals')}
                            >
                                <div className="space-y-4">
                                    <ListEditor label="Propósitos" items={planningData.estructura.propositos} onUpdate={(val) => handleUpdatePlanning('estructura.propositos', val)} />
                                    <ListEditor label="Objetivos" items={planningData.estructura.objetivos} onUpdate={(val) => handleUpdatePlanning('estructura.objetivos', val)} />
                                </div>
                            </Accordion>

                            <Accordion
                                title="3. Secuencia de Clases"
                                isOpen={editingSection === 'classes'}
                                onClick={() => setEditingSection(editingSection === 'classes' ? null : 'classes')}
                            >
                                {planningData.clases.map((clase, idx) => (
                                    <div key={idx} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-forest-700 uppercase tracking-widest">Clase {idx + 1}</h4>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Título de la Clase</label>
                                            <input
                                                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none"
                                                value={clase.nombre}
                                                onChange={(e) => {
                                                    const newClases = [...planningData.clases];
                                                    newClases[idx].nombre = e.target.value;
                                                    handleUpdatePlanning('clases', newClases);
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Inicio / Apertura</label>
                                                <textarea
                                                    className="w-full h-24 p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none resize-none"
                                                    value={clase.inicio}
                                                    onChange={(e) => {
                                                        const newClases = [...planningData.clases];
                                                        newClases[idx].inicio = e.target.value;
                                                        handleUpdatePlanning('clases', newClases);
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Desarrollo de Actividades</label>
                                                <textarea
                                                    className="w-full h-48 p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none resize-none"
                                                    value={clase.desarrollo}
                                                    onChange={(e) => {
                                                        const newClases = [...planningData.clases];
                                                        newClases[idx].desarrollo = e.target.value;
                                                        handleUpdatePlanning('clases', newClases);
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Cierre / Síntesis</label>
                                                <textarea
                                                    className="w-full h-24 p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none resize-none"
                                                    value={clase.cierre}
                                                    onChange={(e) => {
                                                        const newClases = [...planningData.clases];
                                                        newClases[idx].cierre = e.target.value;
                                                        handleUpdatePlanning('clases', newClases);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Multimedia Section */}
                                        <div className="pt-4 border-t border-slate-200 mt-4 space-y-4">
                                            <div className="flex items-center gap-2 text-forest-700">
                                                <Youtube size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Recursos Multimedia</span>
                                            </div>

                                            {/* YouTube Link */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        placeholder="URL de Video de YouTube"
                                                        className="flex-1 p-2 text-[10px] border border-slate-200 rounded-lg"
                                                        value={clase.youtube_url || ''}
                                                        onChange={(e) => {
                                                            const newClases = [...planningData.clases];
                                                            newClases[idx].youtube_url = e.target.value;
                                                            handleUpdatePlanning('clases', newClases);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Upload Simulation */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Imagen Ilustrativa</label>
                                                    {clase.imagen && (
                                                        <select
                                                            className="text-[9px] font-bold text-forest-700 bg-forest-50 border border-forest-200 rounded px-2 py-0.5 outline-none"
                                                            value={clase.imagen_posicion || 'desarrollo'}
                                                            onChange={(e) => {
                                                                const newClases = [...planningData.clases];
                                                                newClases[idx].imagen_posicion = e.target.value;
                                                                handleUpdatePlanning('clases', newClases);
                                                            }}
                                                        >
                                                            <option value="inicio">En Inicio</option>
                                                            <option value="desarrollo">En Desarrollo</option>
                                                            <option value="cierre">En Cierre</option>
                                                        </select>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {clase.imagen ? (
                                                        <div className="relative group">
                                                            <img src={clase.imagen} className="w-16 h-16 object-cover rounded-lg border border-slate-200" alt="Vista previa" />
                                                            <button
                                                                onClick={() => {
                                                                    const newClases = [...planningData.clases];
                                                                    delete newClases[idx].imagen;
                                                                    handleUpdatePlanning('clases', newClases);
                                                                }}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-forest-500 transition-colors">
                                                            <ImageIcon size={16} className="text-slate-400" />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            const newClases = [...planningData.clases];
                                                                            newClases[idx].imagen = reader.result;
                                                                            handleUpdatePlanning('clases', newClases);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            placeholder="O pega una URL de imagen aquí..."
                                                            className="w-full p-2 text-[10px] border border-slate-200 rounded-lg"
                                                            value={clase.imagen_url || ''}
                                                            onChange={(e) => {
                                                                const newClases = [...planningData.clases];
                                                                newClases[idx].imagen_url = e.target.value;
                                                                handleUpdatePlanning('clases', newClases);
                                                            }}
                                                        />
                                                        <p className="text-[9px] text-slate-400 leading-tight">Sube una imagen o pega un enlace directo. Se incluirá en el PDF final.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </div>

                {/* Footer with export buttons */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    {planningData ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => exportToWord(planningData)}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                            >
                                <FileDown className="w-4 h-4" />
                                DESCARGAR WORD (.docx)
                            </button>
                            <PDFDownloadLink
                                document={<PlantillaETA data={planningData} />}
                                fileName={`Secuencia_${planningData.encabezado.materia}.pdf`}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="w-4 h-4" />
                                        {loading ? 'PREPARANDO PDF...' : 'DESCARGAR PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-400 font-bold text-center tracking-widest uppercase opacity-50">SIN DOCUMENTO PARA EXPORTAR</p>
                    )}
                </div>
            </aside>

            {/* Main Content: PDF Preview */}
            <main className="flex-1 relative bg-[#cbd5e1] overflow-hidden flex flex-col">
                <header className="h-14 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between px-8 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Eye className="w-4 h-4 text-forest-600" />
                        <span className="text-slate-800 text-xs font-bold tracking-tight">Previsualización de Documento Final</span>
                    </div>
                </header>

                <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
                    {planningData ? (
                        <div className="w-full h-full shadow-2xl rounded-xl overflow-hidden bg-white">
                            <PDFViewer className="w-full h-full border-none">
                                <PlantillaETA data={planningData} />
                            </PDFViewer>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 max-w-sm">
                            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto ring-8 ring-white/20">
                                <FileText size={32} className="text-slate-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-700">Esperando información</h2>
                            <p className="text-xs text-slate-500 leading-relaxed">Una vez que generes o edites tu secuencia didáctica, aparecerá aquí el documento listo para descargar.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const FormField = ({ label, name, icon, value, onChange, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-forest-600 transition-colors">{icon}</div>
            <input required name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs focus:ring-2 focus:ring-forest-500/10 focus:border-forest-600 outline-none transition-all" />
        </div>
    </div>
);

const Accordion = ({ title, children, isOpen, onClick }) => (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isOpen && <div className="p-4 pt-0 animate-slide-down">{children}</div>}
    </div>
);

const ListEditor = ({ label, items, onUpdate }) => {
    const handleItemChange = (idx, val) => {
        const newItems = [...items];
        newItems[idx] = val;
        onUpdate(newItems);
    };

    return (
        <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase">{label}</label>
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                    <span className="text-slate-300 pt-1 text-xs">•</span>
                    <textarea
                        className="w-full p-2 text-xs border border-slate-100 rounded-lg"
                        value={item}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
};

const WizardQuestion = ({ number, label, placeholder, type, value, onChange }) => (
    <div className="space-y-1.5">
        <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-forest-100 text-forest-700 rounded-full text-[10px] font-black flex items-center justify-center shrink-0">{number}</span>
            <label className="text-xs font-bold text-slate-600">{label}</label>
        </div>
        {type === 'textarea' ? (
            <textarea
                rows={2}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 outline-none resize-none transition-all"
            />
        ) : (
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 outline-none transition-all"
            />
        )}
    </div>
);

export default Dashboard;
