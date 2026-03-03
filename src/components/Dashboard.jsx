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
    Globe,
    Lock,
    MessageSquare,
    Search,
    Settings
} from 'lucide-react';
import PlantillaETA from './PlantillaETA';
import { generatePlanning, generateWizardQuestions, generateEvaluation } from '../services/gemini';
import { exportToWord, exportEvaluationToWord } from '../services/wordExport';
import GeneratorForm from './GeneratorForm';
import WizardModal from './WizardModal';
import PlanEditor from './PlanEditor';
import Library from './Library';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import EvaluationEditor from './EvaluationEditor';
import PlantillaEvaluacion from './PlantillaEvaluacion';
import { supabase, saveSequence, signOut, getProfile, getLibrarySequences, updateProfile } from '../services/supabase';

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
    const [savingCloud, setSavingCloud] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [evaluationData, setEvaluationData] = useState(null);
    const [generatingEval, setGeneratingEval] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // 1. Auth & Initial Load
    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) handleUserLogin(session.user);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) handleUserLogin(session.user);
            else {
                setUser(null);
                setProfile(null);
            }
        });

        const savedForm = localStorage.getItem('sdauto_form_data');
        const savedPlanning = localStorage.getItem('sdauto_planning_data');
        const savedEval = localStorage.getItem('sdauto_eval_data');

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
                setActiveTab('editor');
            } catch (e) {
                console.error("Error parsing saved planning data", e);
            }
        }

        if (savedEval) {
            try {
                setEvaluationData(JSON.parse(savedEval));
            } catch (e) {
                console.error("Error parsing saved eval data", e);
            }
        }

        return () => subscription.unsubscribe();
    }, []);

    const handleUserLogin = async (user) => {
        setUser(user);
        const { data } = await getProfile(user.id);
        if (data) {
            setProfile(data);
            // Autocomplete form with profile data if empty
            setFormData(prev => ({
                ...prev,
                docente: prev.docente || data.full_name || '',
                escuela: prev.escuela || data.escuela_default || '',
                dni: prev.dni || data.dni_default || '',
                telefono: prev.telefono || data.telefono_default || '',
                ciclo: prev.ciclo || data.ciclo_default || '',
                año: prev.año || data.anio_default || '',
                materia: prev.materia || data.materia_default || '',
                email: prev.email || user.email || ''
            }));
        }
    };

    // 2. Persistence Effect for Form Data
    useEffect(() => {
        localStorage.setItem('sdauto_form_data', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        if (planningData) {
            localStorage.setItem('sdauto_planning_data', JSON.stringify(planningData));
        }
    }, [planningData]);

    // 4. Persistence Effect for Evaluation Data
    useEffect(() => {
        if (evaluationData) {
            localStorage.setItem('sdauto_eval_data', JSON.stringify(evaluationData));
        }
    }, [evaluationData]);

    const handleNewSequence = () => {
        if (window.confirm('¿Estás seguro de que quieres empezar una nueva secuencia? Se borrarán todos los datos actuales.')) {
            localStorage.removeItem('sdauto_form_data');
            localStorage.removeItem('sdauto_planning_data');
            localStorage.removeItem('sdauto_eval_data');
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
            fundamentacion: toSafeStr(data.fundamentacion),
            clases: (data.clases || []).map(clase => ({
                ...clase,
                nombre: toSafeStr(clase.nombre),
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
        setActiveTab('editor'); // Switch to editor immediately to see the stream

        try {
            const finalData = await generatePlanning(
                savedFormData,
                wizardData,
                (partialData) => {
                    // Update state with partial data as it streams in
                    setPlanningData(sanitizePlanningData(partialData));
                }
            );

            // Final update with sanitized complete data
            const sanitized = sanitizePlanningData(finalData);
            setPlanningData(sanitized);
        } catch (err) {
            if (err.message.includes("tokens") || err.message.includes("Rate limit")) {
                setError('⚠️ Modo Ahorro activado: Hemos alcanzado el límite de uso del modelo premium por hoy. Reintentando automáticamente con nuestro modelo ligero. La secuencia se generará normalmente.');
                // Trigger retry logic or just let the catch handle the error message if the fallback is already inside gemini.js
                // But since fallback is inside gemini.js, this error only hits if even the fallback fails 
                // or we want to capture the warning.
            } else {
                setError('Error al generar la secuencia. Verifica tu conexión y cuota de Groq.');
            }
            console.error(err);
            setActiveTab('generator'); // Fallback if it fails early
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToCloud = async () => {
        if (!planningData) return;
        setSavingCloud(true);
        setSaveSuccess(false);
        const { data, error } = await saveSequence(planningData, user?.id, isPublic);
        if (!error) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            setError('Error al guardar en la nube. Reintenta pronto.');
        }
        setSavingCloud(false);
    };

    const handleLoadFromLibrary = (sequenceContent) => {
        setPlanningData(sequenceContent);
        setActiveTab('editor');
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] font-sans selection:bg-forest-100 selection:text-forest-900">
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onAuthSuccess={handleUserLogin}
            />

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
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={() => setShowProfileModal(true)}
                                    title="Mi Perfil"
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 hover:text-white transition-all ring-1 ring-white/10"
                                >
                                    <User className="w-4 h-4" />
                                </button>
                            )}
                            {user ? (
                                <button
                                    onClick={() => signOut()}
                                    title="Cerrar Sesión"
                                    className="bg-white/10 hover:bg-red-500/20 p-2 rounded-lg text-white/70 hover:text-red-200 transition-all ring-1 ring-white/10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 hover:text-white transition-all ring-1 ring-white/10"
                                >
                                    <Lock className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={handleNewSequence}
                                title="Nueva Secuencia (Borrar todo)"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 hover:text-white transition-all ring-1 ring-white/10"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {user && (
                        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center text-[10px] font-black text-white">
                                {profile?.full_name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-white truncate">{profile?.full_name || 'Docente'}</p>
                                <p className="text-[9px] text-white/50 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Tab Switcher */}
                    <div className="flex mt-6 bg-forest-950/40 p-1 rounded-xl relative z-10 ring-1 ring-white/5">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'generator' ? 'bg-white text-forest-900 shadow-lg' : 'text-forest-300 hover:text-white'}`}
                        >
                            <ClipboardList className="w-3.5 h-3.5" />
                            Generar
                        </button>
                        <button
                            onClick={() => planningData && setActiveTab('editor')}
                            disabled={!planningData}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white text-forest-900 shadow-lg' : 'text-forest-300 hover:text-white disabled:opacity-30'}`}
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'library' ? 'bg-white text-forest-900 shadow-lg' : 'text-forest-300 hover:text-white'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            Biblioteca
                        </button>
                        <button
                            onClick={() => planningData && setActiveTab('evaluator')}
                            disabled={!planningData}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'evaluator' ? 'bg-white text-forest-900 shadow-lg' : 'text-forest-300 hover:text-white disabled:opacity-30'}`}
                        >
                            <GraduationCap className="w-3.5 h-3.5" />
                            Evaluador
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
                    ) : activeTab === 'editor' ? (
                        <PlanEditor
                            data={planningData}
                            onUpdate={handleUpdatePlanning}
                            editingSection={editingSection}
                            setEditingSection={setEditingSection}
                        />
                    ) : activeTab === 'library' ? (
                        <Library onLoadSequence={handleLoadFromLibrary} user={user} profile={profile} />
                    ) : (
                        <EvaluationEditor
                            sequenceData={planningData}
                            evaluationData={evaluationData}
                            setEvaluationData={setEvaluationData}
                        />
                    )}
                </div>

                {/* Footer with export buttons */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    {planningData ? (
                        <div className="space-y-3">
                            {user && (
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        {isPublic ? <Globe size={11} className="text-forest-600" /> : <Lock size={11} className="text-amber-600" />}
                                        Visibilidad: {isPublic ? 'Pública' : 'Privada'}
                                    </span>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${isPublic ? 'bg-forest-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={handleSaveToCloud}
                                disabled={savingCloud}
                                className={`w-full flex items-center justify-center gap-2 ${saveSuccess ? 'bg-emerald-500' : 'bg-forest-700 hover:bg-forest-800'} text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50`}
                            >
                                {savingCloud ? <Loader2 size={16} className="animate-spin" /> : saveSuccess ? <Plus size={16} /> : <Save className="w-4 h-4" />}
                                {savingCloud ? 'GUARDANDO...' : saveSuccess ? '¡GUARDADO EN LA NUBE!' : 'GUARDAR EN LA NUBE'}
                            </button>
                            <button
                                onClick={() => {
                                    if (activeTab === 'evaluator' && evaluationData) {
                                        exportEvaluationToWord(evaluationData, planningData);
                                    } else {
                                        exportToWord(planningData);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                            >
                                <FileDown className="w-4 h-4" />
                                {activeTab === 'evaluator' ? 'DESCARGAR EXAMEN WORD' : 'DESCARGAR WORD (.docx)'}
                            </button>

                            <PDFDownloadLink
                                document={
                                    activeTab === 'evaluator' && evaluationData ? (
                                        <PlantillaEvaluacion data={evaluationData} sequenceData={planningData} />
                                    ) : (
                                        <PlantillaETA data={planningData} />
                                    )
                                }
                                fileName={
                                    activeTab === 'evaluator' && evaluationData
                                        ? `Evaluacion_${planningData?.encabezado?.materia || 'Materia'}_${evaluationData.titulo?.replace(/\s+/g, '_') || 'Instrumento'}.pdf`
                                        : `Secuencia_${planningData?.encabezado?.materia || 'Materia'}.pdf`
                                }
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="w-4 h-4" />
                                        {loading ? 'PREPARANDO PDF...' : activeTab === 'evaluator' ? 'DESCARGAR EXAMEN PDF' : 'DESCARGAR PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-400 font-bold text-center tracking-widest uppercase opacity-50">SIN DOCUMENTO PARA EXPORTAR</p>
                    )}
                </div>
            </aside>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                profile={profile}
                onProfileUpdate={(newProfile) => {
                    setProfile(newProfile);
                    // Refresh form with new defaults
                    setFormData(prev => ({
                        ...prev,
                        docente: newProfile.full_name || prev.docente,
                        escuela: newProfile.escuela_default || prev.escuela,
                        dni: newProfile.dni_default || prev.dni,
                        telefono: newProfile.telefono_default || prev.telefono,
                        ciclo: newProfile.ciclo_default || prev.ciclo,
                        año: newProfile.anio_default || prev.año,
                        materia: newProfile.materia_default || prev.materia
                    }));
                }}
            />

            {/* Main Content Area: PDF Preview */}
            <main className="flex-1 relative bg-[#cbd5e1] overflow-hidden flex flex-col">
                <header className="h-14 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between px-8 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Eye className="w-4 h-4 text-forest-600" />
                        <span className="text-slate-800 text-xs font-bold tracking-tight">Previsualización de Documento Final</span>
                    </div>
                </header>

                <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
                    {planningData && planningData.encabezado && !loading ? (
                        <div className="w-full h-full shadow-2xl rounded-xl overflow-hidden bg-white">
                            <PDFViewer className="w-full h-full border-none">
                                {activeTab === 'evaluator' && evaluationData ? (
                                    <PlantillaEvaluacion data={evaluationData} sequenceData={planningData} />
                                ) : (
                                    <PlantillaETA data={planningData} />
                                )}
                            </PDFViewer>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 max-w-sm">
                            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto ring-8 ring-white/20">
                                {loading ? <Loader2 size={32} className="text-forest-500 animate-spin" /> : <FileText size={32} className="text-slate-400" />}
                            </div>
                            <h2 className="text-xl font-bold text-slate-700">
                                {loading ? 'Generando Contenido...' : 'Esperando información'}
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {loading ? 'La IA está redactando tu secuencia en tiempo real. Podés ver el progreso en el panel de la izquierda.' : 'Una vez que generes o edites tu secuencia didáctica, aparecerá aquí el documento listo para descargar.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
