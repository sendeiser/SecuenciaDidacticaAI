import React, { useState } from 'react';
import { Search, X, ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { searchImages } from '../services/tavily';

const ImageSearchModal = ({ isOpen, onClose, onSelect, initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        const results = await searchImages(query);
        setImages(results);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center text-forest-600">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 leading-tight">Buscador de Imágenes IA</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Encuentra recursos visuales educativos en segundos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ej: mapa de argentina, celula vegetal, revolucion francesa..."
                            className="w-full pl-12 pr-24 py-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-forest-600 text-white text-xs font-bold rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            Buscar
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="px-6 pb-6 min-h-[300px] max-h-[450px] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <Loader2 size={40} className="text-forest-400 animate-spin mb-4" />
                            <p className="text-slate-400 text-sm font-medium">Explorando la web en busca de imágenes...</p>
                        </div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {images.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(url)}
                                    className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 hover:border-forest-500 transition-all shadow-sm hover:shadow-md"
                                >
                                    <img
                                        src={url}
                                        alt={`Result ${idx}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.parentNode.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-forest-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-forest-600 px-3 py-1.5 rounded-lg">Seleccionar</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : hasSearched ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No encontramos imágenes para esa búsqueda.</p>
                            <p className="text-slate-400 text-xs mt-1">Intenta con términos más simples o en inglés.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Ingresa un tema para ver resultados</p>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                        <strong>Tip:</strong> Las imágenes provienen de fuentes educativas y bancos gratuitos.
                        Algunas URLs externas pueden tardar un momento en cargar en el PDF.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImageSearchModal;
