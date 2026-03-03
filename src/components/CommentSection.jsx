import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, User, Trash2 } from 'lucide-react';
import { getComments, addComment } from '../services/supabase';

const CommentSection = ({ sequenceId, currentUser, profileName }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [sequenceId]);

    const fetchComments = async () => {
        setLoading(true);
        const { data } = await getComments(sequenceId);
        if (data) setComments(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setIsSubmitting(true);
        const { data, error } = await addComment(
            sequenceId,
            newComment,
            currentUser.id,
            profileName || 'Docente'
        );

        if (!error && data) {
            setComments([...comments, data]);
            setNewComment('');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <MessageSquare size={14} />
                <span>Comentarios ({comments.length})</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 size={20} className="animate-spin text-slate-300" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-2">Sin comentarios aún.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-[8px] font-black text-forest-700">
                                    {(comment.profile_name || 'D').substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-bold text-slate-700">{comment.profile_name}</span>
                                <span className="text-[8px] text-slate-400 ml-auto">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            {currentUser ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-forest-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-forest-600 text-white p-2 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            ) : (
                <p className="text-[9px] text-slate-400 text-center bg-slate-50 py-2 rounded-lg border border-dashed border-slate-200">
                    Inicia sesión para dejar un comentario.
                </p>
            )}
        </div>
    );
};

export default CommentSection;
