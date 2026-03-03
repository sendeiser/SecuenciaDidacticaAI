import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Auth Functions
 */
export const signUp = async (email, password, fullName) => {
    return await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    });
};

export const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
    return await supabase.auth.signOut();
};

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
};

export const updateProfile = async (userId, profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select();
    return { data, error };
};

/**
 * Saves a teaching sequence to the cloud.
 */
export const saveSequence = async (planningData, userId = null, isPublic = true) => {
    if (!planningData) return { error: "No data to save" };

    const { data, error } = await supabase
        .from('secuencias')
        .insert([
            {
                titulo: planningData.encabezado.titulo_secuencia,
                materia: planningData.encabezado.materia,
                escuela: planningData.encabezado.institucion,
                docente: planningData.encabezado.docente,
                contenido: planningData,
                es_publica: isPublic,
                user_id: userId
            }
        ])
        .select();

    if (error) {
        console.error("Error saving to Supabase:", error);
        return { error };
    }

    return { data: data[0] };
};

/**
 * Retrieves all public teaching sequences for the community library.
 */
export const getLibrarySequences = async () => {
    const { data, error } = await supabase
        .from('secuencias')
        .select('*')
        .eq('es_publica', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching library:", error);
        return { error, data: [] };
    }

    return { data };
};

/**
 * Retrieves sequences for a specific user.
 */
export const getUserSequences = async (userId) => {
    const { data, error } = await supabase
        .from('secuencias')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user sequences:", error);
        return { error, data: [] };
    }

    return { data };
};

/**
 * Deletes a sequence from the cloud.
 */
export const deleteSequence = async (sequenceId) => {
    const { error } = await supabase
        .from('secuencias')
        .delete()
        .eq('id', sequenceId);

    if (error) {
        console.error("Error deleting sequence:", error);
        return { error };
    }

    return { success: true };
};

/**
 * Comments Service
 */
export const getComments = async (sequenceId) => {
    const { data, error, count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('sequence_id', sequenceId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error);
        return { error, data: [] };
    }

    return { data, count };
};

export const addComment = async (sequenceId, content, userId, profileName) => {
    const { data, error } = await supabase
        .from('comments')
        .insert([
            {
                sequence_id: sequenceId,
                user_id: userId,
                content: content,
                profile_name: profileName
            }
        ])
        .select();

    if (error) {
        console.error("Error adding comment:", error);
        return { error };
    }

    return { data: data[0] };
};
