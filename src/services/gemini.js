const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

/**
 * Genera una planificación completa basada en los datos del formulario 
 * y opcionalmente en una plantilla personalizada.
 */
export const generatePlanning = async (formData) => {
  const customTemplateInfo = formData.template ? `
    ESTRUCTURA PERSONALIZADA (OBLIGATORIA):
    El usuario ha subido una plantilla base ("${formData.template.nombre_plantilla}"). DEBES seguir estrictamente esta estructura:
    - Secciones Requeridas: ${formData.template.secciones.join(', ')}
    - Momentos de Clase/Unidades: ${formData.template.estructura_clase.join(', ')}
    
    DATOS DEL ENCABEZADO PROPORCIONADOS:
    ${Object.entries(formData.template.fields).map(([k, v]) => `- ${k}: ${v}`).join('\n    ')}
    
    INSTRUCCIÓN DE FORMATO:
    Genera el contenido para cada una de las secciones mencionadas. El JSON de respuesta debe tener llaves (keys) que coincidan con los nombres de estas secciones de la forma más natural posible.
  ` : '';

  const prompt = `
    Actúa como un experto pedagogo para nivel secundario. Tu tarea es generar un documento educativo completo (Planificación/Secuencia) basado en la siguiente información:
    ${customTemplateInfo}
    ${!formData.template ? `
    - Institución: ${formData.escuela}
    - Zona: ${formData.zona}
    - Docente: ${formData.docente}
    - DNI: ${formData.dni}
    - Email: ${formData.email}
    - Teléfono: ${formData.telefono}
    - Materia: ${formData.materia}
    - Año Lectivo: ${formData.anioLectivo}
    - Eje Temático / Contenidos: ${formData.tematica}
    - Título: ${formData.titulo}
    ` : ''}
    - Cantidad de Clases/Unidades/Ejes a generar: ${formData.numClases}
    - Variedad y Diversidad de la práctica: ${formData.variedadActividades}
    - OPCIONAL - Incluir sugerencias de YouTube: ${formData.incluirVideos ? 'SÍ' : 'NO'}
    - OPCIONAL - Incluir sugerencias de imágenes ilustrativas: ${formData.incluirImagenes ? 'SÍ' : 'NO'}

    DEBES responder ÚNICAMENTE con un objeto JSON válido.
    
    Si NO hay plantilla personalizada, usa esta estructura estándar:
    {
      "encabezado": { "institucion": "...", "materia": "...", "docente": "...", ... },
      "fundamentacion": "...",
      "estructura": { "propositos": [], "saberes": [], "objetivos": [] },
      "clases": [ { "nombre": "...", "inicio": "...", "desarrollo": "...", "cierre": "...", "metacognicion": "...", "recursos_audiovisuales": { "youtube": [] } } ],
      "evaluacion": { "criterios": [], "rubrica": [], "instrumentos": [] },
      "bibliografia": []
    }

    Si HAY plantilla personalizada, adapta las llaves del JSON a las secciones detectadas, pero mantén un formato similar para el contenido pedagógico interno.

    Recomendaciones Críticas:
    1. Redacta los ejercicios COMPLETOS y listos para usar.
    2. Usa Normas APA 7ma Edición para la bibliografía.
    3. Asegura solidez pedagógica y lenguaje académico.
    
    RESPONDE SOLO EL JSON PURO.
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
            content: "Eres un experto pedagogo que genera documentos educativos en formato JSON."
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
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error generating planning:", error);
    throw error;
  }
};

/**
 * Analiza el texto de un documento para extraer sus secciones y campos lógicos.
 */
export const analyzeDocumentStructure = async (docText) => {
  if (!docText || docText.trim().length === 0) {
    throw new Error("El documento está vacío o no se pudo leer.");
  }

  const systemPrompt = `
    Eres un analista experto en documentos pedagógicos. 
    Tu tarea es extraer la ESTRUCTURA (secciones y campos) de un documento para usarlo como plantilla.
    
    RESPONDE EXCLUSIVAMENTE UN JSON con este formato:
    {
      "secciones": ["Nombre Seccion 1", "Nombre Seccion 2"],
      "datos_encabezado": ["Campo de Encabezado 1", "Campo 2"],
      "estructura_clase": ["Etapa 1 de la clase/unidad", "Etapa 2"],
      "nombre_plantilla": "Nombre descriptivo"
    }
    `;

  const userPrompt = `Analiza la estructura de este documento:\n\n${docText.substring(0, 10000)}`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Error al analizar documento");
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing structure:", error);
    throw error;
  }
};
