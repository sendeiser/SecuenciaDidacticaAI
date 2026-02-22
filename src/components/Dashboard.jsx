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
import GeneratorForm from './GeneratorForm';
import WizardModal from './WizardModal';
import PlanEditor from './PlanEditor';

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

    // 1. Initial Load from LocalStorage
    useEffect(() => {
        const savedForm = localStorage.getItem('sdauto_form_data');
        const savedPlanning = localStorage.getItem('sdauto_planning_data');

        if (savedForm) {
            try {
                setFormData(JSON.parse(savedForm));
            } catch (e) {
                console.error("Error parsing saved form data", e);
            }
        }

        if (savedPlanning) {
            try {
                const parsedPlanning = JSON.parse(savedPlanning);
                setPlanningData(parsedPlanning);
                setActiveTab('editor'); // If there's saved data, show the editor
            } catch (e) {
                console.error("Error parsing saved planning data", e);
            }
        }
    }, []);

    // 2. Persistence Effect for Form Data
    useEffect(() => {
        localStorage.setItem('sdauto_form_data', JSON.stringify(formData));
    }, [formData]);

    // 3. Persistence Effect for Planning Data
    useEffect(() => {
        if (planningData) {
            localStorage.setItem('sdauto_planning_data', JSON.stringify(planningData));
        }
    }, [planningData]);

    const handleNewSequence = () => {
        if (window.confirm('¿Estás seguro de que quieres empezar una nueva secuencia? Se borrarán todos los datos actuales.')) {
            localStorage.removeItem('sdauto_form_data');
            localStorage.removeItem('sdauto_planning_data');
            window.location.reload(); // Quickest way to reset all states
        }
    };

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

            {/* ── WIZARD MODAL ── */}
            <WizardModal
                show={showWizard}
                questions={aiQuestions}
                data={wizardData}
                setData={setWizardData}
                onClose={() => setShowWizard(false)}
                onSubmit={handleWizardSubmit}
                loading={loading}
            />

            {/* Sidebar: Generator or Editor */}
            <aside className="w-[500px] h-full bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-20 flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="p-6 pb-4 border-b border-slate-100 bg-forest-900 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sprout size={80} className="text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-1 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl ring-1 ring-white/20">
                                <LayoutDashboard className="text-white w-5 h-5" />
                            </div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Maestro de Secuencias</h1>
                        </div>
                        <button
                            onClick={handleNewSequence}
                            title="Nueva Secuencia (Borrar todo)"
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 hover:text-white transition-all ring-1 ring-white/10"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
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
                        <GeneratorForm
                            formData={formData}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                            error={error}
                        />
                    ) : (
                        <PlanEditor
                            data={planningData}
                            onUpdate={handleUpdatePlanning}
                            editingSection={editingSection}
                            setEditingSection={setEditingSection}
                        />
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

export default Dashboard;
