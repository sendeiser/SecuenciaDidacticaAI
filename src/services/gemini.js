export const generatePlanning = async (formData, wizardAnswers = null) => {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL = "llama-3.3-70b-versatile";

  const prompt = `
    Actúa como un EXPERTO PEDAGOGO y PLANIFICADOR CURRICULAR para nivel secundario técnico, con más de 20 años de experiencia. Tu tarea es generar una "Secuencia Didáctica" COMPLETA, EXTENSA y ALTAMENTE DESARROLLADA basada en la siguiente información:
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
        "Lista de exactamente 5 puntos de partida pedagógicamente sólidos y específicos al eje temático"
      ],
      "fundamentacion": "Texto extenso (mínimo 200 palabras) y académicamente riguroso sobre la importancia de la secuencia. Debe incluir al menos 2 citas en texto (Apellido, Año) de autores pedagógicos reconocidos.",
      "estructura": {
        "propositos": ["Lista de 4 propósitos formativos amplios"],
        "saberes": ["Lista de ejes, saberes y contenidos a desarrollar, incluyendo conceptos, procedimientos y actitudes"],
        "objetivos": ["Lista de 5 objetivos específicos de aprendizaje, redactados con verbos de acción (Bloom)"]
      },
      "clases": [
        {
          "nombre": "Clase 1: Título Específico y Descriptivo",
          "inicio": "PASO A PASO DETALLADO (mínimo 100 palabras): 1. El docente saluda... 2. Formula la siguiente pregunta disparadora al grupo: '...' 3. Registra las respuestas en el pizarrón en un mapa conceptual preliminar... 4. Distribuye la siguiente ficha de diagnóstico: FICHA DE SABERES PREVIOS - Responde con tus propias palabras: a) ¿Qué entendés por...? b) ¿Alguna vez viste...? c) ¿Cómo relacionarías...?",
          "desarrollo": "DESARROLLO EXTENSO Y COMPLETO (mínimo 250 palabras) con EXACTAMENTE ${formData.cantActividades} ACTIVIDADES NUMERADAS. CADA ACTIVIDAD debe tener: ACTIVIDAD 1 - [Nombre de la actividad]: Descripción del objetivo de la actividad... CONSIGNA PARA EL ALUMNO: [Texto literal y completo del ejercicio con todos los datos, enunciados, fragmentos de texto, ecuaciones, o diagramas necesarios. Listo para ser fotocopiado]. ACTIVIDAD 2 - [Nombre]... y así sucesivamente.",
          "cierre": "CIERRE ESTRUCTURADO (mínimo 80 palabras): Describe cómo el docente realiza una síntesis... Incluye la siguiente consigna de cierre: 'Para la próxima clase, investigá...' o 'Redactá en tu carpeta...'.",
          "metacognicion": "Al menos 3 preguntas metacognitivas específicas: 1. ¿Qué fue lo más difícil de hoy y por qué? 2. ¿Cómo relacionás lo visto hoy con...? 3. ¿Qué estrategia usaste para resolver...?",
          "errores_intervenciones": "Lista de exactamente 3 errores conceptuales frecuentes con su intervención docente específica. Ej: ERROR: Los alumnos confunden X con Y. INTERVENCIÓN: El docente presenta el siguiente contraejemplo...",
          "diferenciacion": "Estrategia de diferenciación concreta para: a) Alumnos con nivel avanzado: Se les propone la siguiente actividad extensión... b) Alumnos con dificultades: Se simplifica el ejercicio de la siguiente manera...",
          "recursos_audiovisuales": {
            "youtube": [
              { "titulo": "Título descriptivo del video", "url_sugerida": "https://www.youtube.com/results?search_query=..." }
            ]
          }
        }
      ],
      "evaluacion": {
        "criterios": ["Criterio 1 detallado...", "Criterio 2 detallado..."],
        "rubrica": [
          { "criterio": "Criterio 1", "inicial": "Descripción del nivel inicial (1-4)", "basico": "Descripción del nivel básico (5-6)", "satisfactorio": "Descripción del nivel satisfactorio (7-8)", "destacado": "Descripción del nivel destacado (9-10)" }
        ],
        "instrumentos": ["Instrumento 1 con descripción...", "Instrumento 2 con descripción..."]
      },
      "bibliografia": ["Apellido, N. (Año). Título del libro en cursiva. Editorial.", "Otro en formato APA 7..."]
    }

    ═══════════════════════════════════
    REGLAS CRÍTICAS E INAPELABLES:
    ═══════════════════════════════════

    ❌ PROHIBICIONES ABSOLUTAS (si las incumplís, el resultado es inválido):
    - PROHIBIDO escribir "El docente realizará actividades de..." → DEBES ESCRIBIR LA ACTIVIDAD COMPLETA.
    - PROHIBIDO "Se trabajarán ejercicios de..." → DEBES PONER LOS EJERCICIOS LITERALES.
    - PROHIBIDO "Se pedirá a los alumnos que..." → DESCRIBE EXACTAMENTE QUÉ HARÁN Y CON QUÉ.
    - PROHIBIDO textos vagos o genéricos de menos de 3 oraciones en cualquier campo.

    ✅ OBLIGACIONES:
    1. EXTENSIÓN: Cada campo "desarrollo" debe tener MÍNIMO 400 PALABRAS.
    2. ACTIVIDADES COMPLETAS: Cada actividad numerada debe incluir SU CONSIGNA LITERAL, COMPLETA, con todos los datos.
       - Matemática: "Resuelve el siguiente sistema de ecuaciones usando el método de sustitución: 2x + 3y = 12 / x - y = 1"
       - Lengua: "Lee el siguiente fragmento de 'El aleph' de Borges: '[párrafo de ejemplo]'. Luego responde: 1. Identificá el narrador y justificá. 2. ¿Qué recursos retóricos identificás?"
       - Ciencias: "Analizá la siguiente tabla de datos: [tabla con 5 filas y 3 columnas de valores]. ¿Qué relación existe entre las variables X e Y?"
       - Técnica/Tecnología: "Diseñá el diagrama de un circuito en serie con: 1 batería de 12V, 3 resistencias (R1=100Ω, R2=220Ω, R3=470Ω). Calcular: a) Resistencia total, b) Corriente del circuito."
    3. ESTRUCTURA: Usa numeración 1., 2., 3. con doble salto de línea entre actividades.
    4. CLASES: DEBES generar EXACTAMENTE ${formData.numClases} clases. No más, no menos.
    5. ACTIVIDADES POR CLASE: EXACTAMENTE ${formData.cantActividades} actividades en el "desarrollo" de cada clase.
    6. METODOLOGÍA: Predominantemente ${formData.tipoActividades}.
    7. VARIEDAD (nivel ${formData.variedadActividades}): Combinar análisis de casos reales, problemas con datos concretos, comparaciones, producciones escritas, y trabajo en grupos.
    8. CITAS APA: Insertar citas en el texto (Autor, Año) en la fundamentación. Bibliografía en formato APA 7 completo.
    9. DIFERENCIACIÓN: Siempre incluir adaptación para alumnos avanzados Y para alumnos con dificultades.

    RESPONDE SOLO EL JSON PURO. Sin explicaciones, sin bloques markdown, sin texto fuera del JSON.

    ${wizardAnswers ? `
    ═══════════════════════════════════
    INFORMACIÓN ADICIONAL DEL DOCENTE (muy importante para personalizar):
    ═══════════════════════════════════
    - Punto de partida de los alumnos: ${wizardAnswers.puntoPart || 'No especificado'}
    - Tipo de problemas a priorizar: ${wizardAnswers.tipoProblemas || 'No especificado'}
    - Modalidad de trabajo: ${wizardAnswers.modalidadTrabajo || 'No especificado'}
    - Producto o proyecto final esperado: ${wizardAnswers.productoFinal || 'No especificado'}
    - Dificultades comunes de los alumnos: ${wizardAnswers.dificultades || 'No especificado'}
    Estas respuestas DEBEN influir directamente en el diseño de actividades, la diferenciación y el cierre de cada clase.
    ` : ''}
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
