import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType,
    VerticalAlign
} from "docx";
import { saveAs } from "file-saver";

const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Generates a Word document Blob for a given sequence data.
 */
export const generateWordBlob = async (data) => {
    if (!data) return null;

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children: [
                    // --- HEADER ---
                    new Paragraph({
                        text: "Secuencia Didáctica Institucional",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        text: data.encabezado.materia,
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 300 },
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({ text: "Institución: ", bold: true }),
                            new TextRun(data.encabezado.institucion),
                            new TextRun({ text: "    Zona: ", bold: true }),
                            new TextRun(data.encabezado.zona),
                        ],
                        spacing: { after: 120 },
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "DOCENTE:", bold: true }), new TextRun(` ${data.encabezado.docente} `)] })],
                                        borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "DNI:", bold: true }), new TextRun(` ${data.encabezado.dni} `)] })],
                                        borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } }
                                    }),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "TELÉFONO:", bold: true }), new TextRun(` ${data.encabezado.telefono} `)] })],
                                        borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "EMAIL:", bold: true }), new TextRun(` ${data.encabezado.email} `)] })],
                                        borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } }
                                    }),
                                ]
                            }),
                        ]
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({ text: "Ciclo: ", bold: true }), new TextRun(data.encabezado.ciclo),
                            new TextRun({ text: "   Año: ", bold: true }), new TextRun(data.encabezado.año),
                            new TextRun({ text: "   Año Lectivo: ", bold: true }), new TextRun(data.encabezado.anio_lectivo),
                        ],
                        spacing: { before: 200, after: 120 },
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({ text: "Eje Temático: ", bold: true }),
                            new TextRun(data.encabezado.eje_tematico),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Secuencia: ", bold: true }),
                            new TextRun(`"${data.encabezado.titulo_secuencia}"`),
                        ],
                        spacing: { after: 400 },
                    }),

                    // --- 1. PUNTOS DE PARTIDA ---
                    new Paragraph({ text: "1. Puntos de partida", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } }),
                    ...data.puntos_partida.map(punto => new Paragraph({
                        children: [new TextRun("• "), new TextRun(punto)],
                        indent: { left: 360 },
                    })),

                    // --- 2. FUNDAMENTACIÓN ---
                    new Paragraph({ text: "2. Fundamentación de la Secuencia Didáctica", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
                    new Paragraph({ text: stripHtml(data.fundamentacion), alignment: AlignmentType.LEFT, spacing: { after: 300 } }),

                    // --- ESTRUCTURA ---
                    new Paragraph({
                        text: "ESTRUCTURA DE LA SECUENCIA DIDÁCTICA",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.LEFT,
                        spacing: { before: 400, after: 200 }
                    }),

                    new Paragraph({ text: "A. Propósitos", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.estructura.propositos.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 360 },
                    })),

                    new Paragraph({ text: "B. Saberes / Contenidos", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.estructura.saberes.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 360 },
                    })),

                    new Paragraph({ text: "C. Objetivos", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.estructura.objetivos.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 360 },
                    })),

                    // --- D. PLAN DE CLASES ---
                    new Paragraph({ text: "D. Plan de Clases y Actividades", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),

                    ...data.clases.flatMap((clase) => [
                        new Paragraph({
                            text: clase.nombre.toUpperCase(),
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 300, after: 150 },
                            border: { bottom: { color: "E2E8F0", space: 1, style: BorderStyle.SINGLE, size: 6 } }
                        }),
                        new Paragraph({ text: "📍 Apertura", bold: true, spacing: { before: 150 } }),
                        new Paragraph({ text: stripHtml(clase.inicio), indent: { left: 240 }, alignment: AlignmentType.LEFT }),

                        new Paragraph({ text: "📝 Desarrollo", bold: true, spacing: { before: 150 } }),
                        new Paragraph({ text: stripHtml(clase.desarrollo), indent: { left: 240 }, alignment: AlignmentType.LEFT }),

                        new Paragraph({ text: "🏁 Cierre", bold: true, spacing: { before: 150 } }),
                        new Paragraph({ text: stripHtml(clase.cierre), indent: { left: 240 }, alignment: AlignmentType.LEFT }),

                        new Paragraph({ text: "Diferenciación:", italics: true, spacing: { before: 100 } }),
                        new Paragraph({ text: clase.diferenciacion, indent: { left: 240 }, size: 18, color: "64748B" }),
                        new Paragraph({ text: "", spacing: { after: 300 } }),
                    ]),

                    // --- E. EVALUACIÓN ---
                    new Paragraph({ text: "E. Evaluación", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                    new Paragraph({ text: "Rúbrica de Desempeño:", bold: true, spacing: { after: 120 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: "CRITERIOS", bold: true, alignment: AlignmentType.CENTER })],
                                        shading: { fill: "E6F3E6" },
                                        verticalAlign: VerticalAlign.CENTER
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: "INICIAL", bold: true, alignment: AlignmentType.CENTER })],
                                        shading: { fill: "E6F3E6" }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: "BÁSICO", bold: true, alignment: AlignmentType.CENTER })],
                                        shading: { fill: "E6F3E6" }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: "SATISFACTORIO", bold: true, alignment: AlignmentType.CENTER })],
                                        shading: { fill: "E6F3E6" }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: "DESTACADO", bold: true, alignment: AlignmentType.CENTER })],
                                        shading: { fill: "E6F3E6" }
                                    }),
                                ],
                            }),
                            ...data.evaluacion.rubrica.map(row => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: row.criterio, bold: true })] }),
                                    new TableCell({ children: [new Paragraph(row.inicial || "")] }),
                                    new TableCell({ children: [new Paragraph(row.basico || "")] }),
                                    new TableCell({ children: [new Paragraph(row.satisfactorio || "")] }),
                                    new TableCell({ children: [new Paragraph(row.destacado || "")] }),
                                ],
                            })),
                        ],
                    }),

                    new Paragraph({ text: "Instrumentos de Evaluación:", bold: true, spacing: { before: 240, after: 120 } }),
                    ...data.evaluacion.instrumentos.map((item) => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 360 },
                    })),

                    // --- F. BIBLIOGRAFÍA ---
                    new Paragraph({ text: "F. Bibliografía (Normas APA 7ma Ed.)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 120 } }),
                    ...data.bibliografia.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun({ text: item, italics: true })],
                        indent: { left: 360 },
                        spacing: { after: 120 }
                    })),

                    new Paragraph({
                        text: "Documento generado por Maestro de Planificaciones | Basado en el Trayecto de Actualización Matemática",
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 600 },
                        size: 14,
                        color: "94A3B8"
                    })
                ],
            },
        ],
    });

    return await Packer.toBlob(doc);
};

/**
 * Generates a Word document Blob for an evaluation / exam.
 */
export const generateEvaluationWordBlob = async (evalData, sequenceData) => {
    if (!evalData || !sequenceData) return null;

    const encabezado = sequenceData.encabezado;

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children: [
                    // Academic Header
                    new Paragraph({
                        text: encabezado.institucion.toUpperCase(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        text: encabezado.materia,
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        text: `Docente: ${encabezado.docente} | DNI: ${encabezado.dni} | Teléfono: ${encabezado.telefono}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        text: `Ciclo: ${encabezado.ciclo} | Año: ${encabezado.año}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Evaluation Title
                    new Paragraph({
                        text: evalData.titulo,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 400 },
                    }),

                    // Student Info Box
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "ALUMNO/A: ", bold: true }), new TextRun("____________________________________")] })],
                                        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
                                        padding: { top: 100, bottom: 100, left: 100 }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "CURSO: ", bold: true }), new TextRun("__________")] })],
                                        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
                                        padding: { top: 100, bottom: 100, left: 100 }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "FECHA: ", bold: true }), new TextRun("___/___/___")] })],
                                        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
                                        padding: { top: 100, bottom: 100, left: 100 }
                                    }),
                                ]
                            }),
                        ]
                    }),

                    // Content
                    new Paragraph({ text: "", spacing: { before: 400 } }),
                    new Paragraph({
                        text: stripHtml(evalData.contenido_html),
                        spacing: { after: 400 },
                        alignment: AlignmentType.LEFT
                    }),

                    // Footer
                    new Paragraph({
                        text: "Maestro de Secuencias | Planificación Inteligente",
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 600 },
                        size: 14,
                        color: "94A3B8"
                    })
                ],
            },
        ],
    });

    return await Packer.toBlob(doc);
};

/**
 * Exports a single sequence as a Word document.
 */
export const exportToWord = async (data) => {
    const blob = await generateWordBlob(data);
    if (blob) {
        saveAs(blob, `Secuencia_${data.encabezado.materia}_${data.encabezado.docente || 'Docente'}.docx`);
    }
};

/**
 * Exports an evaluation as a Word document.
 */
export const exportEvaluationToWord = async (evalData, sequenceData) => {
    const blob = await generateEvaluationWordBlob(evalData, sequenceData);
    if (blob) {
        saveAs(blob, `Evaluacion_${sequenceData.encabezado.materia}_${evalData.titulo?.replace(/\s+/g, '_')}.docx`);
    }
};
