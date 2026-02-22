import { searchEducationalResources } from './tavily';

export const generatePlanning = async (formData, wizardAnswers = null) => {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL = "llama-3.3-70b-versatile";

  // 1. Pre-generation: Search for real educational resources (Argentina)
  let searchContext = "";
  try {
    const searchResults = await searchEducationalResources(`${formData.materia} ${formData.tematica}`);
    if (searchResults && searchResults.length > 0) {
      searchContext = `
    ═══════════════════════════════════
    RECURSOS REALES ENCONTRADOS EN LA WEB (Argentina/Educ.ar):
    ═══════════════════════════════════
    ${searchResults.map(r => `- ${r.title}: ${r.content} (Fuente: ${r.url})`).join('\n')}
    
    USA ESTOS RECURSOS PARA:
    - Incluir links reales en la bibliografía o recursos.
    - Basar tus ejercicios en las propuestas reales encontradas si son de calidad.
    `;
    }
  } catch (err) {
    console.warn("Search failed, proceeding without web context", err);
  }

  const prompt = `
    Actúa como un EXPERTO PEDAGOGO y PLANIFICADOR CURRICULAR para nivel secundario técnico, con más de 20 años de experiencia. Tu tarea es generar una "Secuencia Didáctica" COMPLETA, EXTENSA y ALTAMENTE DESARROLLADA basada en la siguiente información:
    - Institución: ${formData.escuela}
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
        "zona": "${formData.zona || ''}",
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
        "Lista de 5 puntos de partida específicos al eje temático"
      ],
      "fundamentacion": "Texto extenso (mínimo 200 palabras) y riguroso. Incluir 2 citas (Autor, Año).",
      "estructura": {
        "propositos": ["4 propósitos formativos"],
        "saberes": ["Contenidos conceptuales, procedimentales y aptitudinales"],
        "objetivos": ["5 objetivos específicos con verbos de acción"]
      },
      "clases": [
        {
          "nombre": "Título de la Clase",
          "inicio": "Inicio (mínimo 100 palabras). Recuperación de saberes y motivación.",
          "desarrollo": "BLOQUE DE ACTIVIDADES PRÁCTICAS. Mínimo 400 palabras dedicadas EXCLUSIVAMENTE a las actividades. Generar EXACTAMENTE ${formData.cantActividades} actividades numeradas. CADA ACTIVIDAD debe tener: 1) NOMBRE, 2) OBJETIVO, 3) CONSIGNA LITERAL (ejercicios, problemas, textos), 4) TIEMPO ESTIMADO. Prohibido usar prosa narrativa o descripciones de lo que el docente hace.",
          "cierre": "Cierre con síntesis y consigna para la próxima clase.",
          "metacognicion": ["3 preguntas de reflexión"],
          "errores_intervenciones": ["3 errores comunes y cómo intervenirlos"],
          "diferenciacion": "Estrategia para niveles avanzados y alumnos con dificultades.",
          "recursos_audiovisuales": {
            "youtube": [{ "titulo": "...", "url_sugerida": "..." }]
          }
        }
      ],
      "evaluacion": {
        "criterios": ["Lista de criterios..."],
        "rubrica": [{ "criterio": "...", "inicial": "...", "basico": "...", "satisfactorio": "...", "destacado": "..." }],
        "instrumentos": ["Instrumentos de evaluación..."]
      },
      "bibliografia": ["Lista en formato APA 7"]
    }

    ═══════════════════════════════════
    NORMAS DE CALIDAD Y ESTILO:
    ═══════════════════════════════════
    1. FOCO EN LA ACTIVIDAD: El apartado "desarrollo" NO es una descripción de la clase, es un BANCO DE ACTIVIDADES.
       - Prohibido: "El docente explica y luego los alumnos hacen un ejercicio..."
       - Obligatorio: "Actividad 1: [Consigna detallada con todos sus datos]. Actividad 2: [Problema complejo]..."
    2. ESPECIFICIDAD TOTAL: Prohibido usar frases como "Se debatirán los contenidos" o "Se realizarán ejercicios de práctica". 
       DEBES escribir el TEXTO EXACTO que el alumno tendrá en su hoja: problemas, cálculos, fragmentos de lectura, consignas de escritura.
    3. DENSIDAD DE CONTENIDO: Cada actividad debe ser lo suficientemente extensa para que el alumno trabaje de forma autónoma.
    4. CITAS: Fundamentación con citas (Autor, Año). Bibliografía APA 7.
    5. CANTIDAD: Generar EXACTAMENTE ${formData.numClases} clases y ${formData.cantActividades} actividades por clase.
    6. WIZARD CONTEXT: Usa las respuestas del docente como guía prioritaria:
       ${wizardAnswers ? Object.entries(wizardAnswers).map(([id, answer]) => `- ${id}: ${answer}`).join('\n') : 'No se proveyeron respuestas adicionales.'}

    ${searchContext}

    RESPONDE SOLO EL JSON PURO. Sin bloques markdown, sin texto adicional.
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
        temperature: 0.75,
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

/**
 * Generates 5 personalized wizard questions based on form data using AI.
 * Questions are contextual to the subject, topic, and cycle.
 */
export const generateWizardQuestions = async (formData) => {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL = "llama-3.3-70b-versatile";

  const prompt = `
    Sos un experto pedagogo con 20 años de experiencia en educación secundaria técnica.
    Un docente de ${formData.materia} para ${formData.ciclo} ${formData.año}, va a crear una secuencia didáctica sobre:
    "${formData.titulo}" (Eje: ${formData.tematica}).

    Tu tarea es generar EXACTAMENTE 5 preguntas de sondeo MUY ESPECÍFICAS Y RELEVANTES para este docente,
    antes de que genere la secuencia. Las preguntas deben ayudar a:
    - Diagnosticar el punto de partida de los alumnos con ESTE TEMA CONCRETO.
    - Descubrir qué tipo de actividades o problemas reales son más útiles para ESTA MATERIA.
    - Identificar dificultades conocidas en ${formData.materia} para ${formData.ciclo}.
    - Entender si hay un producto final o proyecto.
    - Conocer la modalidad de trabajo preferida.

    MUY IMPORTANTE: Las preguntas deben ser CONCRETAS y referenciar directamente la materia, el eje temático y el nivel.
    NO hagas preguntas genéricas como "¿Cuál es tu metodología?"
    SÍ haz preguntas como "¿Tus alumnos ya trabajaron con [concepto específico de la materia]?" o
    "¿Qué tipo de errores cometen más al resolver [tipo de problema concreto]?"

    Responde ÚNICAMENTE con un JSON válido, sin texto extra:
    {
      "preguntas": [
        {
          "id": "q1",
          "label": "Texto completo de la pregunta (que mencione el tema o materia específica)",
          "placeholder": "Ejemplo de respuesta esperada muy concreta y útil para el generador",
          "tipo": "textarea"
        },
        {
          "id": "q2",
          "label": "...",
          "placeholder": "...",
          "tipo": "texto"
        },
        {
          "id": "q3",
          "label": "...",
          "placeholder": "...",
          "tipo": "select",
          "opciones": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"]
        },
        { "id": "q4", "label": "...", "placeholder": "...", "tipo": "textarea" },
        { "id": "q5", "label": "...", "placeholder": "...", "tipo": "textarea" }
      ]
    }
    Los tipos posibles son: "textarea", "texto", "select" (solo para pregunta 3).
    Para las de tipo "select", agregá un array "opciones" con 4-5 valores contextuales a la materia.
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
          { role: "system", content: "Eres un generador de preguntas pedagógicas que solo responde en formato JSON puro." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al generar preguntas");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.preguntas || [];
  } catch (error) {
    console.error("Error generating wizard questions:", error);
    // Return fallback questions if AI fails
    return [
      { id: 'q1', label: `¿Cuál es el punto de partida de tus alumnos con "${formData.tematica}"?`, placeholder: 'Ej: Ya conocen los conceptos básicos, pero no la aplicación práctica...', tipo: 'textarea' },
      { id: 'q2', label: '¿Qué tipo de problemas o situaciones querés priorizar?', placeholder: 'Ej: Problemas de la vida real, ejercicios de cálculo, análisis de textos...', tipo: 'textarea' },
      { id: 'q3', label: 'Modalidad de trabajo en clase', placeholder: '', tipo: 'select', opciones: ['Individual', 'Grupal (parejas)', 'Grupal (equipos de 3-4)', 'Mixta (individual y grupal)', 'Plenaria / Clase colectiva'] },
      { id: 'q4', label: '¿Hay un proyecto o producto final al terminar la secuencia?', placeholder: 'Ej: Una maqueta, un informe escrito, una exposición oral...', tipo: 'textarea' },
      { id: 'q5', label: `¿Qué dificultades comunes tienen tus alumnos con "${formData.tematica}"?`, placeholder: 'Ej: Confunden X con Y, no recuerdan las fórmulas...', tipo: 'textarea' },
    ];
  }
};
