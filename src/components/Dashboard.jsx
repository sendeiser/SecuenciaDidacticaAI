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
    ExternalLink,
    Moon,
    Sun,
    Palette
} from 'lucide-react';
import PlantillaETA from './PlantillaETA';
import { generatePlanning, analyzeDocumentStructure } from '../services/gemini';
import { exportToWord } from '../services/wordExport';
import { parseDocument } from '../services/documentParser';

const Dashboard = () => {
    const [formData, setFormData] = useState({
        escuela: '',
        zona: '',
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

    const [isWizardMode, setIsWizardMode] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    const wizardSteps = [
        {
            title: "Institución",
            question: "¿En qué institución trabajarás?",
            fields: ['escuela', 'zona'],
            icons: { escuela: <School size={16} />, zona: <MapPin size={16} /> }
        },
        {
            title: "Identidad",
            question: "¿Cuáles son tus datos profesionales?",
            fields: ['docente', 'dni', 'email', 'telefono'],
            icons: { docente: <User size={16} />, dni: <IdCard size={16} />, email: <Mail size={16} />, telefono: <Phone size={16} /> }
        },
        {
            title: "Contexto",
            question: "¿A qué curso y materia va dirigida?",
            fields: ['ciclo', 'año', 'materia', 'anioLectivo'],
            icons: { ciclo: <GraduationCap size={16} />, año: <GraduationCap size={16} />, materia: <ClipboardList size={16} />, anioLectivo: <Sparkles size={16} /> }
        },
        {
            title: "Contenido",
            question: "¿Qué temática vas a desarrollar?",
            fields: ['tematica', 'titulo'],
            icons: { tematica: <BookOpen size={16} />, titulo: <Sparkles size={16} /> }
        },
        {
            title: "Estructura",
            question: "¿Cómo será la estructura de la secuencia?",
            fields: ['numClases', 'variedadActividades'],
            icons: { numClases: <ClipboardList size={16} />, variedadActividades: <Palette size={16} /> }
        }
    ];

    const [loading, setLoading] = useState(false);
    const [planningData, setPlanningData] = useState(null);
    const [activeTab, setActiveTab] = useState('generator'); // 'generator' or 'editor'
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);

    // New states for Custom Templates
    const [customTemplate, setCustomTemplate] = useState(null);
    const [templateType, setTemplateType] = useState('standard');
    const [analyzingDoc, setAnalyzingDoc] = useState(false);

    // Theme state
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Apply theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Load template from localStorage
    useEffect(() => {
        const savedTemplate = localStorage.getItem('customTemplate');
        if (savedTemplate) {
            try {
                const parsed = JSON.parse(savedTemplate);
                setCustomTemplate(parsed);
                setTemplateType('custom');
            } catch (e) {
                console.error("Error loading template from localStorage", e);
            }
        }
    }, []);

    // Save template to localStorage
    useEffect(() => {
        if (customTemplate) {
            localStorage.setItem('customTemplate', JSON.stringify(customTemplate));
        } else {
            localStorage.removeItem('customTemplate');
        }
    }, [customTemplate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingDoc(true);
        setError(null);
        try {
            const text = await parseDocument(file);
            const structure = await analyzeDocumentStructure(text);

            // Initialize dynamic fields
            const templateFields = {};
            structure.datos_encabezado.forEach(field => {
                templateFields[field] = '';
            });

            setCustomTemplate({
                ...structure,
                fileName: file.name,
                rawText: text,
                fields: { ...templateFields, ...(structure.initial_data || {}) }
            });
            setTemplateType('custom');
            setError(`¡Plantilla "${structure.nombre_plantilla}" detectada con éxito!`);
        } catch (err) {
            console.error(err);
            setError('No se pudo analizar el documento. Intenta con otro archivo.');
        } finally {
            setAnalyzingDoc(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await generatePlanning({
                ...formData,
                template: templateType === 'custom' ? customTemplate : null
            });
            setPlanningData(data);
            setActiveTab('editor');
        } catch (err) {
            setError('Error al generar la secuencia. Verifica tu conexión y cuota de Groq.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-forest-100 selection:text-forest-900 transition-colors">
            {/* Sidebar: Generator or Editor */}
            <aside className="w-full lg:w-[500px] lg:h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] shadow-[var(--card-shadow)] z-20 flex flex-col overflow-hidden transition-colors">
                {/* Header Section */}
                <div className="p-6 pb-4 border-b border-black/10 bg-[var(--accent-primary)] relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <GraduationCap size={80} className="text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-1 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl ring-1 ring-white/20">
                            <Palette className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold text-white tracking-tight uppercase">Maestro de Secuencias</h1>
                    </div>

                    <div className="flex mt-6 bg-black/20 p-1 rounded-xl relative z-10 ring-1 ring-white/5">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'generator' ? 'bg-white text-[var(--accent-primary)] shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            <ClipboardList className="w-3.5 h-3.5" />
                            Generador
                        </button>
                        <button
                            onClick={() => planningData && setActiveTab('editor')}
                            disabled={!planningData}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white text-[var(--accent-primary)] shadow-lg' : 'text-white/60 hover:text-white disabled:opacity-30'}`}
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Editor Real
                        </button>
                    </div>
                </div>

                {/* Dynamic Column */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
                    {activeTab === 'generator' ? (
                        <div className="space-y-6 animate-fade-in">
                            {/* Template Type Switcher */}
                            <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-2xl border border-[var(--border-color)]">
                                <button
                                    onClick={() => setTemplateType('standard')}
                                    className={`flex-1 py-4 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${templateType === 'standard'
                                        ? 'bg-[var(--accent-primary)] text-white shadow-lg scale-[1.02]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Sparkles size={16} />
                                    Secuencia Maestra
                                </button>
                                <button
                                    onClick={() => setTemplateType('custom')}
                                    className={`flex-1 py-4 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${templateType === 'custom'
                                        ? 'bg-[var(--accent-primary)] text-white shadow-lg scale-[1.02]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <FileText size={16} />
                                    Personalizada
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Modo Asistido</span>
                                <button
                                    onClick={() => setIsWizardMode(!isWizardMode)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${isWizardMode ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)]'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isWizardMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Template System (Only if Custom or to Upload) */}
                            {templateType === 'custom' && (
                                <div className="p-5 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="text-[var(--accent-primary)] w-4 h-4" />
                                        <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Sistema de Plantillas</h3>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">Sube un documento base para que la IA aprenda su estructura.</p>
                                    <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${analyzingDoc ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5'}`}>
                                        {analyzingDoc ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 text-forest-600 animate-spin" />
                                                <span className="text-[10px] font-bold text-forest-700 animate-pulse">ANALIZANDO...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-forest-600">
                                                <Plus className="w-5 h-5" />
                                                <span className="text-[10px] font-bold uppercase">Subir Documento Base</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileUpload} disabled={analyzingDoc} />
                                    </label>
                                    {customTemplate && (
                                        <div className="p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] shadow-sm animate-slide-up">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[150px]">{customTemplate.fileName}</span>
                                                <button onClick={() => { setCustomTemplate(null); setTemplateType('standard'); }}><X size={14} className="text-[var(--text-secondary)] hover:text-red-500" /></button>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[8px] font-black text-[var(--accent-primary)] uppercase px-2 py-0.5 bg-[var(--accent-primary)]/10 rounded-md">Secciones: {customTemplate.secciones?.length}</span>
                                                <span className="text-[8px] font-black text-blue-500 uppercase px-2 py-0.5 bg-blue-500/10 rounded-md">Campos: {customTemplate.datos_encabezado?.length}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {templateType === 'custom' && customTemplate ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info className="text-[var(--accent-primary)] w-3.5 h-3.5" />
                                                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Datos de la Plantilla</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {customTemplate.datos_encabezado.map((field, idx) => (
                                                    <FormField
                                                        key={idx}
                                                        label={field}
                                                        name={field}
                                                        icon={<Edit3 className="w-3.5 h-3.5" />}
                                                        value={customTemplate.fields[field] || ''}
                                                        onChange={(e) => {
                                                            const newFields = { ...customTemplate.fields, [field]: e.target.value };
                                                            setCustomTemplate({ ...customTemplate, fields: newFields });
                                                        }}
                                                        placeholder={`Ingresa ${field.toLowerCase()}...`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Optional: Add common controls that AI might need regardless of header */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Configuración Adicional</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">N° de Clases / Unidades</label>
                                                    <select name="numClases" value={formData.numClases} onChange={handleChange} className="w-full px-3 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] transition-all focus:border-[var(--accent-primary)] outline-none">
                                                        {[1, 2, 3, 4, 5, 10, 20].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Unidad/Clase' : 'Unidades/Clases'}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Variedad</label>
                                                    <select name="variedadActividades" value={formData.variedadActividades} onChange={handleChange} className="w-full px-3 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] transition-all focus:border-[var(--accent-primary)] outline-none">
                                                        {['Baja', 'Media', 'Alta'].map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : isWizardMode ? (
                                    <div className="animate-slide-up space-y-6">
                                        {/* Wizard Progress */}
                                        <div className="flex gap-1.5 px-1">
                                            {wizardSteps.map((_, idx) => (
                                                <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'}`} />
                                            ))}
                                        </div>

                                        {/* Current Step Content */}
                                        <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-sm space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded">PASO {currentStep + 1}</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{wizardSteps[currentStep].title}</span>
                                                </div>
                                                <h2 className="text-sm font-bold text-[var(--text-primary)]">{wizardSteps[currentStep].question}</h2>
                                            </div>

                                            <div className="space-y-4">
                                                {wizardSteps[currentStep].fields.map(field => (
                                                    field === 'numClases' || field === 'variedadActividades' ? (
                                                        <div key={field} className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                                                {field === 'numClases' ? 'N° de Clases' : 'Variedad de Actividades'}
                                                            </label>
                                                            <select
                                                                name={field}
                                                                value={formData[field]}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] outline-none"
                                                            >
                                                                {field === 'numClases'
                                                                    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} Clases</option>)
                                                                    : ['Baja', 'Media', 'Alta'].map(v => <option key={v} value={v}>{v}</option>)
                                                                }
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <FormField
                                                            key={field}
                                                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                                                            name={field}
                                                            icon={wizardSteps[currentStep].icons[field]}
                                                            value={formData[field]}
                                                            onChange={handleChange}
                                                            placeholder={`Ingresa ${field}...`}
                                                        />
                                                    )
                                                ))}
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                {currentStep > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                                        className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl font-bold text-[10px] uppercase hover:bg-[var(--bg-tertiary)] transition-colors"
                                                    >
                                                        Anterior
                                                    </button>
                                                )}
                                                {currentStep < wizardSteps.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                                        className="flex-[2] py-3 bg-[var(--accent-primary)] text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg shadow-[var(--accent-primary)]/20 hover:scale-[1.02] transition-transform"
                                                    >
                                                        Siguiente
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex-[2] py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                                                    >
                                                        {loading ? <Loader2 className="animate-spin" /> : <Send size={14} />}
                                                        Generar Secuencia
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Institución" name="escuela" icon={<School className="w-3.5 h-3.5" />} value={formData.escuela} onChange={handleChange} placeholder="Ej. Colegio Nacional" />
                                            <FormField label="Zona" name="zona" icon={<MapPin className="w-3.5 h-3.5" />} value={formData.zona} onChange={handleChange} placeholder="Ej. Zona V" />
                                        </div>
                                        <div className="p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] space-y-4">
                                            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Datos del Docente</h3>
                                            <FormField label="Nombre y Apellido" name="docente" icon={<User className="w-3.5 h-3.5" />} value={formData.docente} onChange={handleChange} placeholder="Nombre completo" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField label="DNI" name="dni" icon={<IdCard className="w-3.5 h-3.5" />} value={formData.dni} onChange={handleChange} placeholder="8.888.888" />
                                                <FormField label="Teléfono" name="telefono" icon={<Phone className="w-3.5 h-3.5" />} value={formData.telefono} onChange={handleChange} placeholder="3826..." />
                                            </div>
                                            <FormField label="Email" name="email" icon={<Mail className="w-3.5 h-3.5" />} value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Detalles Académicos</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField label="Ciclo" name="ciclo" icon={<GraduationCap className="w-3.5 h-3.5" />} value={formData.ciclo} onChange={handleChange} placeholder="Ej. Ciclo Básico" />
                                                <FormField label="Año" name="año" icon={<GraduationCap className="w-3.5 h-3.5" />} value={formData.año} onChange={handleChange} placeholder="Ej. 1er Año" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField label="Materia" name="materia" icon={<ClipboardList className="w-3.5 h-3.5" />} value={formData.materia} onChange={handleChange} placeholder="Ej. Física" />
                                                <FormField label="Año Lectivo" name="anioLectivo" icon={<Sparkles className="w-3.5 h-3.5" />} value={formData.anioLectivo} onChange={handleChange} placeholder="Ej. 2024" />
                                            </div>
                                            <FormField label="Eje Temático" name="tematica" icon={<BookOpen className="w-3.5 h-3.5" />} value={formData.tematica} onChange={handleChange} />
                                            <FormField label="Título" name="titulo" icon={<Sparkles className="w-3.5 h-3.5" />} value={formData.titulo} onChange={handleChange} />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">N° de Clases</label>
                                                    <select name="numClases" value={formData.numClases} onChange={handleChange} className="w-full px-3 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] transition-all focus:border-[var(--accent-primary)] outline-none">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} Clases</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.98]">
                                    {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                    {loading ? 'GENERANDO SECUENCIA...' : 'GENERAR SECUENCIA DIDÁCTICA'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6">
                            {planningData && Object.entries(planningData).map(([key, value]) => {
                                // Skip "tipo" and internal metadata
                                if (key === 'tipo') return null;

                                // Handle "encabezado" or similar objects (flat fields)
                                if (typeof value === 'object' && !Array.isArray(value) && value !== null && key.toLowerCase().includes('encabezado')) {
                                    return (
                                        <Accordion
                                            key={key}
                                            title={key.toUpperCase()}
                                            isOpen={editingSection === key}
                                            onClick={() => setEditingSection(editingSection === key ? null : key)}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                {Object.entries(value).map(([fieldKey, fieldValue]) => (
                                                    <FormField
                                                        key={fieldKey}
                                                        label={fieldKey}
                                                        value={fieldValue || ''}
                                                        onChange={(e) => handleUpdatePlanning(`${key}.${fieldKey}`, e.target.value)}
                                                    />
                                                ))}
                                            </div>
                                        </Accordion>
                                    );
                                }

                                // Handle "clases" or similar arrays
                                // Handle "clases" or similar arrays
                                if (Array.isArray(value)) {
                                    // Detect if it's a table (array of similar objects)
                                    const isTable = value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0]) && value[0] !== null;

                                    return (
                                        <Accordion
                                            key={key}
                                            title={key.toUpperCase()}
                                            isOpen={editingSection === key}
                                            onClick={() => setEditingSection(editingSection === key ? null : key)}
                                        >
                                            <div className="space-y-4 pt-2">
                                                {isTable ? (
                                                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                                        <table className="w-full text-[10px] text-left">
                                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                                <tr>
                                                                    {Object.keys(value[0]).map(col => (
                                                                        <th key={col} className="px-3 py-2 font-black text-forest-700 uppercase">{col}</th>
                                                                    ))}
                                                                    <th className="px-3 py-2 w-10"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {value.map((row, rIdx) => (
                                                                    <tr key={rIdx} className="bg-white">
                                                                        {Object.entries(row).map(([col, val], cIdx) => (
                                                                            <td key={cIdx} className="px-2 py-1">
                                                                                <textarea
                                                                                    className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-[var(--accent-primary)] rounded text-xs text-[var(--text-primary)] min-h-[40px] resize-y"
                                                                                    value={val || ''}
                                                                                    onChange={(e) => {
                                                                                        const newList = [...value];
                                                                                        newList[rIdx] = { ...row, [col]: e.target.value };
                                                                                        handleUpdatePlanning(key, newList);
                                                                                    }}
                                                                                />
                                                                            </td>
                                                                        ))}
                                                                        <td className="px-2 py-1 text-center">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newList = value.filter((_, i) => i !== rIdx);
                                                                                    handleUpdatePlanning(key, newList);
                                                                                }}
                                                                                className="text-red-400 hover:text-red-600 p-1"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        <button
                                                            onClick={() => {
                                                                const newRow = {};
                                                                Object.keys(value[0]).forEach(k => newRow[k] = '');
                                                                handleUpdatePlanning(key, [...value, newRow]);
                                                            }}
                                                            className="w-full py-2 bg-slate-50 text-forest-600 text-[10px] font-bold hover:bg-forest-50 border-t border-slate-200 flex items-center justify-center gap-1"
                                                        >
                                                            <Plus size={12} /> AGREGAR FILA
                                                        </button>
                                                    </div>
                                                ) : value.map((item, idx) => (
                                                    <div key={idx} className="flex gap-2 group">
                                                        <textarea
                                                            className="flex-1 p-3 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:bg-[var(--bg-secondary)] transition-colors outline-none focus:border-[var(--accent-primary)]"
                                                            value={item}
                                                            onChange={(e) => {
                                                                const newList = [...value];
                                                                newList[idx] = e.target.value;
                                                                handleUpdatePlanning(key, newList);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newList = value.filter((_, i) => i !== idx);
                                                                handleUpdatePlanning(key, newList);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {!isTable && (
                                                    <button
                                                        onClick={() => handleUpdatePlanning(key, [...value, ""])}
                                                        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-[10px] font-bold hover:border-forest-300 hover:text-forest-600 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Plus size={14} /> AGREGAR ELEMENTO
                                                    </button>
                                                )}
                                            </div>
                                        </Accordion>
                                    );
                                }

                                // Default for large text blocks
                                return (
                                    <Accordion
                                        key={key}
                                        title={key.toUpperCase()}
                                        isOpen={editingSection === key}
                                        onClick={() => setEditingSection(editingSection === key ? null : key)}
                                    >
                                        <textarea
                                            className="w-full h-48 p-3 text-xs border border-slate-100 rounded-xl"
                                            value={typeof value === 'string' ? value : JSON.stringify(value)}
                                            onChange={(e) => handleUpdatePlanning(key, e.target.value)}
                                        />
                                    </Accordion>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                    {planningData && (
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => exportToWord(planningData)} className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-700 text-white text-[10px] font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                                <FileDown size={14} /> WORD
                            </button>
                            <PDFDownloadLink document={<PlantillaETA data={planningData} />} fileName="Secuencia.pdf" className="flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold py-3 rounded-xl shadow-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
                                <Download size={14} /> PDF
                            </PDFDownloadLink>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 lg:h-full bg-[var(--bg-tertiary)] p-4 lg:p-6 min-h-[500px] transition-colors">
                {planningData ? (
                    <div className="w-full h-full bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-color)] transition-colors">
                        <PDFViewer className="w-full h-full border-none"><PlantillaETA data={planningData} /></PDFViewer>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-4 animate-fade-in">
                        <FileText size={64} className="opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">Esperando información organizada...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const FormField = ({ label, name, icon, value, onChange, placeholder }) => (
    <div className="space-y-1.5 w-full">
        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{label}</label>
        <div className="relative group flex items-center">
            {icon && <div className="absolute left-3 text-[var(--text-secondary)]">{icon}</div>}
            <input
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-9' : 'px-3'} py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl shadow-sm text-xs text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)]/50`}
            />
        </div>
    </div>
);

const Accordion = ({ title, children, isOpen, onClick }) => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm transition-colors">
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{title}</span>
            <div className="text-[var(--text-secondary)]">
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
        </button>
        {isOpen && <div className="p-4 pt-0 border-t border-[var(--border-color)] animate-fade-in">{children}</div>}
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
                <textarea key={idx} className="w-full p-2 text-xs border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg outline-none focus:border-[var(--accent-primary)]" value={item} onChange={(e) => handleItemChange(idx, e.target.value)} />
            ))}
        </div>
    );
};

export default Dashboard;
