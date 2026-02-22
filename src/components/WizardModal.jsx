import React from 'react';
import { Sparkles } from 'lucide-react';

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

const WizardModal = ({ show, questions, data, setData, onClose, onSubmit, loading }) => {
    if (!show) return null;

    return (
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
                    {questions.map((q, idx) => (
                        <div key={q.id}>
                            {q.tipo === 'select' ? (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-forest-100 text-forest-700 rounded-full text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                                        <label className="text-xs font-bold text-slate-600">{q.label}</label>
                                    </div>
                                    <select
                                        value={data[q.id] || ''}
                                        onChange={(e) => setData({ ...data, [q.id]: e.target.value })}
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
                                    value={data[q.id] || ''}
                                    onChange={(v) => setData({ ...data, [q.id]: v })}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Wizard Footer */}
                <div className="p-5 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                        Volver al formulario
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-forest-300" />
                        Generar secuencia
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WizardModal;
