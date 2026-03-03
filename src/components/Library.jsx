import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Download, Edit3, Loader2, Calendar, User, School, Trash2, Globe, Lock, Archive, MessageSquare } from 'lucide-react';
import { getLibrarySequences, getUserSequences, deleteSequence } from '../services/supabase';
import { generateWordBlob } from '../services/wordExport';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import CommentSection from './CommentSection';

const Library = ({ onLoadSequence, user, profile }) => {
    const [sequences, setSequences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('global'); // 'global' or 'personal'
    const [expandedComments, setExpandedComments] = useState({}); // sequenceId -> boolean

    useEffect(() => {
        fetchSequences();
    }, [viewMode]);

    const fetchSequences = async () => {
        setLoading(true);
        let result;
        if (viewMode === 'global') {
            result = await getLibrarySequences();
        } else {
            result = await getUserSequences(user?.id);
        }

        if (!result.error) {
            setSequences(result.data);
        }
        setLoading(false);
    };

    const toggleComments = (id) => {
        setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta secuencia? Esta acción no se puede deshacer.')) {
            const { error } = await deleteSequence(id);
            if (!error) {
                setSequences(sequences.filter(s => s.id !== id));
            }
        }
    };

    const handleExportAll = async () => {
        if (sequences.length === 0) return;
        setExporting(true);

        try {
            const zip = new JSZip();
            const folder = zip.folder("Mis_Secuencias_ETA");

            for (const seq of sequences) {
                const blob = await generateWordBlob(seq.contenido);
                const fileName = `${seq.materia}_${seq.titulo.replace(/[/\\?%*:|"<>]/g, '-')}.docx`;
                folder.file(fileName, blob);
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "Todas_Mis_Secuencias_ETA.zip");
        } catch (error) {
            console.error("Error exporting sequences:", error);
            alert("Hubo un error al generar el ZIP. Por favor intenta de nuevo.");
        } finally {
            setExporting(false);
        }
    };

    const filteredSequences = sequences.filter(s =>
        s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.docente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-forest-50 rounded-2xl flex items-center justify-center border border-forest-100">
                        <BookOpen className="text-forest-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {viewMode === 'global' ? 'Explora la Comunidad' : 'Mis Secuencias Guardadas'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {viewMode === 'global' ? 'Recursos compartidos por otros docentes innovadores.' : 'Gestiona y accede a tus planificaciones personales.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => setViewMode('global')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'global' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Globe size={14} />
                        Global
                    </button>
                    {user && (
                        <button
                            onClick={() => setViewMode('personal')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Lock size={14} />
                            Mis Secuencias
                        </button>
                    )}
                </div>

                {viewMode === 'personal' && sequences.length > 0 && (
                    <button
                        onClick={handleExportAll}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-forest-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exporting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Comprimiendo...
                            </>
                        ) : (
                            <>
                                <Archive size={14} />
                                Exportar Todo (.zip)
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por título, materia o docente..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-forest-500 outline-none text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <Loader2 size={40} className="text-forest-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Cargando biblioteca...</p>
                </div>
            ) : filteredSequences.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <p className="text-slate-400 font-medium">
                        {viewMode === 'global' ? 'No se encontraron secuencias en la comunidad.' : 'Aún no has guardado secuencias privadas.'}
                    </p>
                    <button onClick={fetchSequences} className="mt-4 text-forest-600 text-sm font-bold hover:underline">Actualizar</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSequences.map((seq) => (
                        <div key={seq.id} className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black text-forest-600 bg-forest-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                    {seq.materia}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(seq.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 mb-2 group-hover:text-forest-700 transition-colors line-clamp-2">
                                {seq.titulo}
                            </h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <User size={14} className="text-slate-400" />
                                    <span className="truncate">{seq.docente}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <School size={14} className="text-slate-400" />
                                    <span className="truncate">{seq.escuela}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                                <button
                                    onClick={() => onLoadSequence(seq.contenido)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-forest-600 transition-all shadow-lg active:scale-95"
                                >
                                    <Edit3 size={14} />
                                    Cargar
                                </button>
                                <button
                                    onClick={() => toggleComments(seq.id)}
                                    className={`p-2.5 rounded-xl border transition-all active:scale-95 ${expandedComments[seq.id] ? 'bg-forest-600 text-white border-forest-600' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-forest-200'}`}
                                    title="Ver Comentarios"
                                >
                                    <MessageSquare size={16} />
                                </button>
                                {viewMode === 'personal' && (
                                    <button
                                        onClick={() => handleDelete(seq.id)}
                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                        title="Eliminar Secuencia"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {expandedComments[seq.id] && (
                                <CommentSection
                                    sequenceId={seq.id}
                                    currentUser={user}
                                    profileName={profile?.full_name}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;
