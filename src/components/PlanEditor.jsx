import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Youtube, Image as ImageIcon, X, Search, Sparkles } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageSearchModal from './ImageSearchModal';

const Accordion = ({ title, children, isOpen, onClick }) => (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isOpen && <div className="p-4 pt-0 animate-slide-down">{children}</div>}
    </div>
);

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
    ],
};

const quillFormats = [
    'bold', 'italic', 'underline', 'list', 'bullet'
];

const ListEditor = ({ label, items, onUpdate }) => {
    const handleItemChange = (idx, val) => {
        const newItems = [...items];
        newItems[idx] = val;
        onUpdate(newItems);
    };

    return (
        <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase">{label}</label>
            {(items || []).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                    <span className="text-slate-300 pt-1 text-xs">•</span>
                    <input
                        className="w-full p-2 text-xs border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-forest-500"
                        value={item}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
};

const PlanEditor = ({ data, onUpdate, editingSection, setEditingSection }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentClassIdx, setCurrentClassIdx] = useState(null);

    if (!data) return null;

    const handleOpenSearch = (idx) => {
        setCurrentClassIdx(idx);
        setIsSearchOpen(true);
    };

    const handleSelectImage = (url) => {
        if (currentClassIdx !== null) {
            const newClases = [...data.clases];
            newClases[currentClassIdx].imagen_url = url;
            // Clear local upload if exists
            delete newClases[currentClassIdx].imagen;
            onUpdate('clases', newClases);
        }
        setIsSearchOpen(false);
    };

    return (
        <div className="animate-fade-in space-y-4 quill-custom-editor">
            <style>{`
                .quill-custom-editor .ql-container {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 13px !important;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    background: white;
                }
                .quill-custom-editor .ql-toolbar {
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    background: #f8fafc;
                    border-color: #e2e8f0 !important;
                }
                .quill-custom-editor .ql-container.ql-snow {
                    border-color: #e2e8f0 !important;
                }
            `}</style>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700">Edición en tiempo real</h2>
                <span className="text-[10px] text-forest-600 font-bold bg-forest-50 px-2 py-1 rounded-md">CAMBIOS SE GUARDAN AL PDF</span>
            </div>

            <Accordion
                title="1. Fundamentación"
                isOpen={editingSection === 'fund'}
                onClick={() => setEditingSection(editingSection === 'fund' ? null : 'fund')}
            >
                <ReactQuill
                    theme="snow"
                    value={data.fundamentacion || ''}
                    onChange={(val) => onUpdate('fundamentacion', val)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-44 mb-12"
                />
            </Accordion>

            <Accordion
                title="2. Propósitos y Objetivos"
                isOpen={editingSection === 'goals'}
                onClick={() => setEditingSection(editingSection === 'goals' ? null : 'goals')}
            >
                <div className="space-y-4">
                    <ListEditor label="Propósitos" items={data.estructura?.propositos || []} onUpdate={(val) => onUpdate('estructura.propositos', val)} />
                    <ListEditor label="Objetivos" items={data.estructura?.objetivos || []} onUpdate={(val) => onUpdate('estructura.objetivos', val)} />
                </div>
            </Accordion>

            <Accordion
                title="3. Secuencia de Clases"
                isOpen={editingSection === 'classes'}
                onClick={() => setEditingSection(editingSection === 'classes' ? null : 'classes')}
            >
                {(data.clases || []).map((clase, idx) => (
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
                                    const newClases = data.clases.map((c, i) =>
                                        i === idx ? { ...c, nombre: e.target.value } : c
                                    );
                                    onUpdate('clases', newClases);
                                }}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Inicio / Apertura</label>
                                <ReactQuill
                                    theme="snow"
                                    value={clase.inicio || ''}
                                    onChange={(val) => {
                                        const newClases = data.clases.map((c, i) =>
                                            i === idx ? { ...c, inicio: val } : c
                                        );
                                        onUpdate('clases', newClases);
                                    }}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    className="bg-white rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Desarrollo de Actividades</label>
                                <ReactQuill
                                    theme="snow"
                                    value={clase.desarrollo || ''}
                                    onChange={(val) => {
                                        const newClases = data.clases.map((c, i) =>
                                            i === idx ? { ...c, desarrollo: val } : c
                                        );
                                        onUpdate('clases', newClases);
                                    }}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    className="bg-white rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Cierre / Síntesis</label>
                                <ReactQuill
                                    theme="snow"
                                    value={clase.cierre || ''}
                                    onChange={(val) => {
                                        const newClases = data.clases.map((c, i) =>
                                            i === idx ? { ...c, cierre: val } : c
                                        );
                                        onUpdate('clases', newClases);
                                    }}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    className="bg-white rounded-xl"
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
                                            const newClases = data.clases.map((c, i) =>
                                                i === idx ? { ...c, youtube_url: e.target.value } : c
                                            );
                                            onUpdate('clases', newClases);
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
                                                const newClases = data.clases.map((c, i) =>
                                                    i === idx ? { ...c, imagen_posicion: e.target.value } : c
                                                );
                                                onUpdate('clases', newClases);
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
                                                    const newClases = [...data.clases];
                                                    delete newClases[idx].imagen;
                                                    onUpdate('clases', newClases);
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
                                                            const newClases = [...data.clases];
                                                            newClases[idx].imagen = reader.result;
                                                            onUpdate('clases', newClases);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                placeholder="O pega una URL de imagen aquí..."
                                                className="flex-1 p-2 text-[10px] border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-forest-500"
                                                value={clase.imagen_url || ''}
                                                onChange={(e) => {
                                                    const newClases = [...data.clases];
                                                    newClases[idx].imagen_url = e.target.value;
                                                    onUpdate('clases', newClases);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleOpenSearch(idx)}
                                                className="bg-forest-50 text-forest-700 border border-forest-100 p-2 rounded-lg hover:bg-forest-100 transition-colors group relative"
                                                title="Buscar imagen con IA"
                                            >
                                                <div className="flex items-center gap-1.5 px-1">
                                                    <Sparkles size={12} className="animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase">Buscar con IA</span>
                                                </div>
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-slate-400 leading-tight">Sube una imagen, pega un enlace o usa nuestro buscador inteligente para encontrar recursos visuales.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Accordion>

            <ImageSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleSelectImage}
                initialQuery={currentClassIdx !== null && data.clases?.[currentClassIdx] ? data.clases[currentClassIdx].nombre : ''}
            />
        </div>
    );
};

export default PlanEditor;
