export const generatePlanning = async (formData) => {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL = "llama-3.3-70b-versatile";

  const prompt = `
    Actúa como un experto pedagogo para nivel secundario. Tu tarea es generar una "Secuencia Didáctica" completa basada en la siguiente información del docente:
    - Institución: ${formData.escuela}
    - Zona: ${formData.zona}
    - Docente: ${formData.docente}
    - DNI: ${formData.dni}
    - Email: ${formData.email}
    - Teléfono: ${formData.telefono}
    - Materia: ${formData.materia}
    - Año Lectivo: ${formData.anioLectivo}
    - Eje Temático / Contenidos: ${formData.tematica}
    - Título de la Secuencia: ${formData.titulo}
    - Cantidad de Clases a generar: ${formData.numClases}
    - Enfoque Metodológico: ${formData.tipoActividades}
    - Cantidad de actividades/ejercicios por clase: ${formData.cantActividades}
    - Variedad y Diversidad de la práctica: ${formData.variedadActividades}
    - OPCIONAL - Incluir sugerencias de YouTube: ${formData.incluirVideos ? 'SÍ' : 'NO'}
    - OPCIONAL - Incluir sugerencias de imágenes ilustrativas: ${formData.incluirImagenes ? 'SÍ' : 'NO'}

    DEBES responder ÚNICAMENTE con un objeto JSON válido que siga esta jerarquía exacta:
    {
      "encabezado": {
        "institucion": "${formData.escuela}",
        "zona": "${formData.zona}",
        "docente": "${formData.docente}",
        "dni": "${formData.dni}",
        "email": "${formData.email}",
        "telefono": "${formData.telefono}",
        "ciclo": "${formData.ciclo}",
        "año": "${formData.año}",
        "anio_lectivo": "${formData.anioLectivo}",
        "materia": "${formData.materia}",
        "eje_tematico": "${formData.tematica}",
        "titulo_secuencia": "${formData.titulo}"
      },
      "puntos_partida": [
        "lista de 5 puntos vinculares y pedagógicos de inicio"
      ],
      "fundamentacion": "Texto extenso y profesional sobre la importancia de la secuencia en la materia seleccionada",
      "estructura": {
        "propositos": ["lista de 3-4 propósitos formativos"],
        "saberes": ["lista de ejes, saberes y contenidos a desarrollar"],
        "objetivos": ["lista de 4-5 objetivos específicos de aprendizaje"]
      },
      "clases": [
        {
          "nombre": "Clase 1: Título",
          "inicio": "Descripción detallada paso a paso del inicio (15-20 min). Incluye la pregunta disparadora y cómo se recuperan saberes previos.",
          "desarrollo": "Desarrollo profundo y extenso (40-60 min). Describe actividades prácticas, consignas claras para los alumnos, ejemplos y el rol del docente en la mediación.",
          "cierre": "Descripción del cierre (15-20 min) con síntesis de conceptos y puesta en común.",
          "metacognicion": "Consignas de reflexión profunda para que el alumno analice su proceso de aprendizaje.",
          "errores_intervenciones": "Análisis de posibles obstáculos cognitivos e intervenciones docentes sugeridas.",
          "diferenciacion": "Adaptaciones específicas para diversidad de ritmos y estilos de aprendizaje.",
          "recursos_audiovisuales": {
            "youtube": [
              { "titulo": "Título del video recomendado", "url_sugerida": "https://www.youtube.com/results?search_query=..." }
            ]
          }
        }
      ],
      "evaluacion": {
        "rubrica": [
          { "criterio": "Criterio 1", "inicial": "...", "basico": "...", "satisfactorio": "...", "destacado": "..." }
        ],
        "instrumentos": ["lista de 4 instrumentos de evaluación"]
      },
      "bibliografia": ["Lista de 3-4 referencias bibliográficas actuales"]
    }

    Recomendaciones Críticas de Calidad:
    1. CANTIDAD DE CLASES: DEBES generar exactamente ${formData.numClases} clases en el array "clases". 
    2. PROFUNDIDAD DE PRÁCTICA: En cada clase DEBES incluir exactamente ${formData.cantActividades} actividades o bloques de ejercicios diferenciados.
    3. VARIEDAD: El nivel de variedad debe ser ${formData.variedadActividades}. Esto significa que los ejercicios no deben ser repetitivos; integra análisis de casos, resolución de problemas, debates, y ejercicios técnicos.
    4. METODOLOGÍA: Todas las actividades deben tener un enfoque predominantemente ${formData.tipoActividades}.
    3. DESARROLLO Y EJERCICIOS: No uses generalidades como "El docente dará ejercicios". DEBES redactar los ejercicios, problemas o consignas textuales para que el alumno los resuelva. Si es Matemática, pon el problema; si es Lengua, pon el texto y las preguntas. Las actividades deben estar "listas para usar".
    4. ESPECIFICIDAD: Usa términos técnicos, leyes y bibliografía coherente con el eje temático.
    3. MEDIA INTEGRADO (SI ESTÁ ACTIVADO): 
       - Si se solicitan videos, inserta en el JSON recomendaciones específicas.
       - Si se solicitan imágenes, describe brevemente qué imagen o esquema debería ir en cada parte (ej: "Esquema del ciclo del agua").
    4. TONO PROFESIONAL: El lenguaje debe ser académico, técnico y pedagógicamente sólido, digno de una institución técnica.
    
    RESPONDE SOLO EL JSON PURO. No incluyas explicaciones ni bloques de código markdown.
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Eres un generador de secuencias didácticas que solo responde en formato JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error en la API de Groq");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating generic planning:", error);
    throw error;
  }
};
