const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

/**
 * Utility to extract and parse JSON even if surrounded by text.
 */
const extractAndParseJSON = (str) => {
  try {
    // Try direct parse first
    return JSON.parse(str);
  } catch (e) {
    // Try to find the first '{' and last '}'
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');

    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = str.substring(start, end + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (innerError) {
        console.error("Failed to parse extracted JSON substring:", jsonStr);
        throw innerError;
      }
    }
    throw new Error("No valid JSON object found in response");
  }
};

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
    Actúa como un experto pedagogo. Tu tarea es generar un documento educativo completo basado en la siguiente información:
    
    TIPO DE DOCUMENTO: ${formData.template ? formData.template.tipo_documento : 'Secuencia Didáctica Estándar'}
    
    ${customTemplateInfo}
    ${!formData.template ? `
    DATOS BÁSICOS:
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
    - Parámetro de extensión (Clases/Unidades/Ejes): ${formData.numClases}
    - Variedad y Diversidad de la práctica: ${formData.variedadActividades}
    - OPCIONAL - Incluir sugerencias de YouTube: ${formData.incluirVideos ? 'SÍ' : 'NO'}
    - OPCIONAL - Incluir sugerencias de imágenes ilustrativas: ${formData.incluirImagenes ? 'SÍ' : 'NO'}

    DEBES responder ÚNICAMENTE con un objeto JSON válido.
    
    Si NO hay plantilla personalizada, usa esta estructura estándar:
    {
      "tipo": "Secuencia Didáctica",
      "encabezado": { "institucion": "...", "materia": "...", "docente": "...", "dni": "...", "email": "...", "telefono": "...", "año_lectivo": "...", "titulo": "..." },
      "fundamentacion": "...",
      "estructura": { "propositos": [], "saberes": [], "objetivos": [] },
      "clases": [ { "nombre": "...", "inicio": "...", "desarrollo": "...", "cierre": "...", "metacognicion": "...", "recursos_audiovisuales": { "youtube": [] } } ],
      "evaluacion": { "criterios": [], "rubrica": [], "instrumentos": [] },
      "bibliografia": []
    }

    Si HAY plantilla personalizada, el JSON resultante DEBE tener como llaves principales los nombres de las secciones detectadas en la plantilla. 
    Dentro de cada sección, genera el contenido pedagógico apropiado. Si la sección es el encabezado, complétalo con los datos proporcionados.

    Recomendaciones Críticas:
    1. Redacta el contenido de forma extensiva y profesional.
    2. Usa Normas APA 7ma Edición para las referencias si aplica.
    3. Asegura solidez pedagógica adaptada al contexto.
    
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
            content: "Eres un experto pedagogo que genera documentos educativos en formato JSON. Tu respuesta debe ser EXCLUSIVAMENTE el objeto JSON, sin texto explicativo antes ni después."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error en la API de Groq");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return extractAndParseJSON(content);
    } catch (parseError) {
      console.error("Final parse error in generatePlanning. Raw content:", content);
      throw new Error("La IA generó una respuesta que no pudimos procesar. Intenta simplificar el pedido o reducir el número de clases.");
    }
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
      "tipo_documento": "Ej: Planificación Anual, Proyecto Institucional, etc.",
      "secciones": ["Nombre Seccion 1", "Nombre Seccion 2"],
      "datos_encabezado": ["Campo de Encabezado 1", "Campo 2"],
      "initial_data": {
         "Campo de Encabezado 1": "Valor encontrado en el texto (si existe)",
         "Campo 2": "Valor encontrado..."
      },
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
          { role: "system", content: systemPrompt + " IMPORTANTE: Tu respuesta debe ser un JSON válido." },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Error al analizar documento");
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    try {
      return extractAndParseJSON(content);
    } catch (parseError) {
      console.error("Final parse error in analyzeDocumentStructure. Raw content:", content);
      throw new Error("No se pudo analizar la estructura del documento. Asegúrate de que el texto sea legible.");
    }
  } catch (error) {
    console.error("Error analyzing structure:", error);
    throw error;
  }
};
