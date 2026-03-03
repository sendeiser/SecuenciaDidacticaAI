import { processAIStream } from './streaming';
import { searchEducationalResources } from './tavily';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL_PREMIUM = "llama-3.3-70b-versatile";
const MODEL_ECONOMY = "llama-3.1-8b-instant";

export const generatePlanning = async (formData, wizardAnswers = null, onProgress = null) => {
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
    - Ciclo: ${formData.ciclo}
    - Año: ${formData.año}
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

    DEBES responder ÚNICAMENTE con un objeto JSON válido que siga esta estructura exacta:
    {
      "encabezado": {
        "institucion": "nombre",
        "zona": "zona",
        "docente": "nombre",
        "dni": "dni",
        "email": "email",
        "telefono": "tel",
        "ciclo": "ciclo",
        "año": "año",
        "anio_lectivo": "202x",
        "materia": "materia",
        "eje_tematico": "tema",
        "titulo_secuencia": "título"
      },
      "puntos_partida": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
      "fundamentacion": "Texto extenso con citas...",
      "estructura": {
        "propositos": ["prop 1", "prop 2", "prop 3", "prop 4"],
        "saberes": ["saber 1", "saber 2", "saber 3"],
        "objetivos": ["obj 1", "obj 2", "obj 3", "obj 4", "obj 5"]
      },
      "clases": [
        {
          "nombre": "Clase 1",
          "inicio": "Breve introducción. Usa formato HTML (<b>, <ul>, <li>) para listar los pasos o momentos iniciales con prolijidad.",
          "desarrollo": "Desarrollo pedagógico completo. NO uses la palabra 'Bloque'. Escribe las consignas literales para el alumno de forma secuencial. Es OBLIGATORIO estructurar el contenido separando las actividades y consignas en ÍTEMS utilizando etiquetas HTML (<ul>, <ol>, <li>, <b>, <br>) para garantizar la máxima legibilidad y prolijidad visual. Incluye todos los ejercicios, problemas y explicaciones necesarias como si fuera la hoja de trabajo final. Integra activamente los recursos encontrados en la web para crear problemas reales.",
          "cierre": "Cierre o síntesis. Estructurado también en viñetas HTML (<ul><li>...</li></ul>) para mayor claridad.",
          "metacognicion": ["preg 1", "preg 2", "preg 3"],
          "errores_intervenciones": ["error 1", "error 2", "error 3"],
          "diferenciacion": "...",
          "recursos_audiovisuales": {
            "youtube": [{ "titulo": "...", "url_sugerida": "..." }]
          }
        }
      ],
      "evaluacion": {
        "criterios": ["crit 1", "crit 2"],
        "rubrica": [{ "criterio": "...", "inicial": "...", "basico": "...", "satisfactorio": "...", "destacado": "..." }],
        "instrumentos": ["inst 1", "inst 2"]
      },
      "bibliografia": ["cita 1", "cita 2"]
    }

    ═══════════════════════════════════
    NORMAS DE CALIDAD Y ESTILO (CRÍTICO):
    ═══════════════════════════════════
    1. ESPECIFICIDAD RADICAL: Prohibido usar prosa narrativa genérica. Escribe las ACTIVIDADES Y PROBLEMAS COMPLETOS.
    2. INTEGRACIÓN WEB: Extrae ejercicios de 'searchContext' y adáptalos. No solo los menciones, ESCRÍBELOS en el desarrollo.
    3. SIN ESTRUCTURAS TÉCNICAS: NO uses la palabra 'Bloque', ni 'Sección', ni encabezados h1/h2 dentro de las clases. El desarrollo debe leerse como una secuencia de trabajo fluida para el alumno.
    4. DENSIDAD Y FORMATO (!!): El desarrollo debe ser un banco de ejercicios listo para imprimir y usar. DEBES USAR HTML (<ul>, <ol>, <li>, <b>) para separar cada actividad en ítems listados. Esto es para que la visualización sea extremadamente prolija y ordenada.
    5. CANTIDAD: Generar EXACTAMENTE ${formData.numClases} clases y una gran variedad de ejercicios por clase.

    ${searchContext}

    RESPONDE SOLO EL JSON PURO.
  `;

  try {
    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_PREMIUM,
        messages: [
          {
            role: "system",
            content: "Eres un experto pedagogo que genera secuencias didácticas en formato JSON ESTRICTO. Nunca incluyas texto fuera del JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
        stream: !!onProgress
      })
    });

    // Fallback if rate limited
    if (response.status === 429) {
      console.warn("Rate limit on 70b, falling back to 8b...");
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL_ECONOMY,
          messages: [
            {
              role: "system",
              content: "Eres un experto pedagogo que genera secuencias didácticas en formato JSON ESTRICTO. Nunca incluyas texto fuera del JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          response_format: { type: "json_object" },
          stream: !!onProgress
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error en la API de Groq");
    }

    if (onProgress) {
      return await processAIStream(response, onProgress);
    } else {
      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error in generatePlanning:", error);
    throw error;
  }
};

export const generateWizardQuestions = async (formData) => {
  const prompt = `
    Sos un experto pedagogo con 20 años de experiencia en educación secundaria técnica.
    Un docente de ${formData.materia} para ${formData.ciclo} ${formData.año}, va a crear una secuencia didáctica sobre:
    "${formData.titulo}" (Eje: ${formData.tematica}).

    Tu tarea es generar EXACTAMENTE 5 preguntas de sondeo MUY ESPECÍFICAS Y RELEVANTES para este docente,
    antes de que genere la secuencia. Las preguntas deben ayudar a:
    - Diagnosticar el punto de partida de los alumnos con ESTE TEMA CONCRETO.
    - Descubrir qué tipo de actividades o problemas reales son más útiles para ESTA MATERIA.
    - Identificar dificultades conocidas en ${formData.materia} para ${formData.ciclo}.
 
    MUY IMPORTANTE: Las preguntas deben ser CONCRETAS y referenciar directamente la materia, el eje temático y el nivel.
    Responde ÚNICAMENTE con un JSON válido, sin texto extra:
    {
      "preguntas": [
        {
          "id": "q1",
          "label": "Text",
          "placeholder": "Placeholder",
          "tipo": "textarea"
        }
      ]
    }
  `;

  try {
    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_PREMIUM,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (response.status === 429) {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL_ECONOMY,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });
    }

    if (!response.ok) throw new Error("Error in Wizard Questions");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content).preguntas;
  } catch (error) {
    console.error("Wizard error:", error);
    throw error;
  }
};

export const generateEvaluation = async (sequenceData, instructions = "") => {
  const prompt = `Genera una evaluación para esta secuencia: ${JSON.stringify(sequenceData.encabezado)}. Instrucciones: ${instructions}`;

  try {
    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_PREMIUM,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    if (response.status === 429) {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL_ECONOMY,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          response_format: { type: "json_object" }
        })
      });
    }

    if (!response.ok) throw new Error("Error in Evaluation");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Evaluation error:", error);
    throw error;
  }
};
