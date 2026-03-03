import React, { useState } from 'react';
import { GraduationCap, Sparkles, Loader2, Save, FileDown, Download } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { generateEvaluation } from '../services/gemini';

const EvaluationEditor = ({ sequenceData, evaluationData, setEvaluationData }) => {
    const [evalType, setEvalType] = useState('Examen Escrito');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!sequenceData) return;
        setLoading(true);
        try {
            const result = await generateEvaluation(sequenceData, evalType);
            setEvaluationData(result);
        } catch (error) {
            console.error("Error generating evaluation:", error);
            alert("Error al generar la evaluación. Reintenta.");
        } finally {
            setLoading(false);
        }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    if (!sequenceData) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center px-6">
                <GraduationCap size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium text-sm">Primero genera o carga una secuencia didáctica para poder crear su evaluación.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-forest-50 rounded-2xl flex items-center justify-center border border-forest-100 text-forest-600">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Generador de Evaluaciones</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Crea exámenes y rúbricas basados en tu secuencia actual.</p>
                    </div>
                </div>

                {!evaluationData && (
                    <div className="grid grid-cols-1 gap-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Instrumento</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Examen Escrito', 'Cuestionario', 'Rúbrica Detallada'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setEvalType(t)}
                                        className={`py-3 px-2 rounded-xl text-[10px] font-bold transition-all border ${evalType === t ? 'bg-forest-900 text-white border-forest-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-forest-200'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full py-4 bg-forest-600 hover:bg-forest-700 text-white rounded-2xl font-bold shadow-xl shadow-forest-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            {loading ? 'GENERANDO EVALUACIÓN...' : 'GENERAR EVALUACIÓN CON IA'}
                        </button>
                    </div>
                )}
            </div>

            {evaluationData && (
                <div className="space-y-4 animate-slide-up quill-custom-editor">
                    <style>{`
                        .quill-custom-editor .ql-container {
                            font-family: 'Inter', sans-serif !important;
                            font-size: 13px !important;
                            border-bottom-left-radius: 20px;
                            border-bottom-right-radius: 20px;
                            background: white;
                            min-height: 400px;
                        }
                        .quill-custom-editor .ql-toolbar {
                            border-top-left-radius: 20px;
                            border-top-right-radius: 20px;
                            background: #f8fafc;
                            border-color: #f1f5f9 !important;
                            padding: 12px !important;
                        }
                        .quill-custom-editor .ql-container.ql-snow {
                            border-color: #f1f5f9 !important;
                        }
                    `}</style>

                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Save size={14} />
                            Documento Generado
                        </h3>
                        <button
                            onClick={() => setEvaluationData(null)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                        >
                            Reiniciar Evaluación
                        </button>
                    </div>

                    <ReactQuill
                        theme="snow"
                        value={evaluationData.contenido_html || ''}
                        onChange={(val) => setEvaluationData({ ...evaluationData, contenido_html: val })}
                        modules={quillModules}
                        className="bg-white rounded-3xl"
                    />

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                        <Sparkles size={18} className="text-amber-600 shrink-0" />
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                            <strong>Consejo:</strong> Podés editar cualquier parte del examen antes de exportarlo.
                            Agregá puntos extra, modificá consignas o ajustá el sistema de puntaje a tu gusto.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationEditor;
