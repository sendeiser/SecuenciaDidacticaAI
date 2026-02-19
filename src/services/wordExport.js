import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType } from "docx";
import { saveAs } from "file-saver";

export const exportToWord = async (data) => {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Header
                    new Paragraph({
                        text: `Secuencia Didáctica de ${data.encabezado.materia}`,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({ text: "Institución: ", bold: true }),
                            new TextRun(data.encabezado.institucion),
                            new TextRun({ text: "    Zona: ", bold: true }),
                            new TextRun(data.encabezado.zona),
                        ],
                    }),
                    new Paragraph({ text: "Datos personales del docente:", bold: true, spacing: { before: 100 } }),
                    ...[
                        ["Nombre y apellido", data.encabezado.docente],
                        ["DNI", data.encabezado.dni],
                        ["Correo electrónico", data.encabezado.email],
                        ["Teléfono", data.encabezado.telefono],
                    ].map(([label, value]) => new Paragraph({
                        children: [
                            new TextRun({ text: "• ", bold: true }),
                            new TextRun({ text: `${label}: `, bold: true }),
                            new TextRun(value),
                        ],
                        indent: { left: 720 },
                    })),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Ciclo: ", bold: true }),
                            new TextRun(data.encabezado.ciclo),
                            new TextRun({ text: "    Año: ", bold: true }),
                            new TextRun(data.encabezado.año),
                            new TextRun({ text: "    Año Lectivo: ", bold: true }),
                            new TextRun(data.encabezado.anio_lectivo),
                        ],
                        spacing: { before: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Eje Temático / Contenidos: ", bold: true }),
                            new TextRun(data.encabezado.eje_tematico),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Nombre de la Secuencia Didáctica: ", bold: true }),
                            new TextRun(`"${data.encabezado.titulo_secuencia}"`),
                        ],
                    }),

                    // 2. Puntos de partida
                    new Paragraph({ text: "2. Puntos de partida", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.puntos_partida.map(punto => new Paragraph({
                        children: [new TextRun("• "), new TextRun(punto)],
                        indent: { left: 720 },
                    })),

                    // 3. Fundamentación
                    new Paragraph({ text: "3. Fundamentación de la Secuencia Didáctica", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    new Paragraph({ text: data.fundamentacion, alignment: AlignmentType.JUSTIFY }),

                    // Estructura
                    new Paragraph({ text: "Estructura de la Secuencia Didáctica", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),

                    new Paragraph({ text: "A. Propósitos", heading: HeadingLevel.HEADING_2 }),
                    ...data.estructura.propositos.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 720 },
                    })),

                    new Paragraph({ text: "B. Eje - Saberes - Contenidos a desarrollar", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.estructura.saberes.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 720 },
                    })),

                    new Paragraph({ text: "C. Objetivos", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.estructura.objetivos.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 720 },
                    })),

                    // D. Clases
                    new Paragraph({ text: "D. Clases - Actividades", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
                    ...data.clases.flatMap((clase, i) => [
                        new Paragraph({ text: clase.nombre, heading: HeadingLevel.HEADING_3, spacing: { before: 150 } }),
                        new Paragraph({ text: "Actividades de inicio (15-20 minutos):", bold: true }),
                        new Paragraph({ text: clase.inicio, indent: { left: 360 }, spacing: { after: 100 } }),
                        new Paragraph({ text: "Actividades de desarrollo (40-60 minutos):", bold: true }),
                        new Paragraph({ text: clase.desarrollo, indent: { left: 360 }, spacing: { after: 100 } }),
                        new Paragraph({ text: "Actividades de cierre (15-20 minutos):", bold: true }),
                        new Paragraph({ text: clase.cierre, indent: { left: 360 }, spacing: { after: 100 } }),
                        new Paragraph({ text: "Consignas metacognitivas:", bold: true }),
                        new Paragraph({ text: clase.metacognicion, indent: { left: 360 }, spacing: { after: 100 } }),
                        new Paragraph({ text: "Posibles errores e intervenciones:", bold: true }),
                        new Paragraph({ text: clase.errores_intervenciones, indent: { left: 360 }, spacing: { after: 100 } }),
                        new Paragraph({ text: "Diferenciación de actividades:", bold: true }),
                        new Paragraph({ text: clase.diferenciacion, indent: { left: 360 }, spacing: { after: 100 } }),
                    ]),

                    // F. Evaluación
                    new Paragraph({ text: "F. Evaluación", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
                    new Paragraph({ text: "Criterios de Evaluación:", bold: true }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "CRITERIOS", bold: true })], shading: { fill: "f2f2f2", type: ShadingType.CLEAR } }),
                                    new TableCell({ children: [new Paragraph({ text: "INICIAL", bold: true })], shading: { fill: "f2f2f2", type: ShadingType.CLEAR } }),
                                    new TableCell({ children: [new Paragraph({ text: "BÁSICO", bold: true })], shading: { fill: "f2f2f2", type: ShadingType.CLEAR } }),
                                    new TableCell({ children: [new Paragraph({ text: "SATISFACTORIO", bold: true })], shading: { fill: "f2f2f2", type: ShadingType.CLEAR } }),
                                    new TableCell({ children: [new Paragraph({ text: "DESTACADO", bold: true })], shading: { fill: "f2f2f2", type: ShadingType.CLEAR } }),
                                ],
                            }),
                            ...data.evaluacion.rubrica.map(row => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: row.criterio, bold: true })] }),
                                    new TableCell({ children: [new Paragraph(row.inicial)] }),
                                    new TableCell({ children: [new Paragraph(row.basico)] }),
                                    new TableCell({ children: [new Paragraph(row.satisfactorio)] }),
                                    new TableCell({ children: [new Paragraph(row.destacado)] }),
                                ],
                            })),
                        ],
                    }),
                    new Paragraph({ text: "Instrumentos de Evaluación:", bold: true, spacing: { before: 200 } }),
                    ...data.evaluacion.instrumentos.map((item, i) => new Paragraph({
                        children: [new TextRun(`${i + 1}. `), new TextRun(item)],
                        indent: { left: 720 },
                    })),

                    // G. Bibliografía
                    new Paragraph({ text: "G. Bibliografía", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
                    ...data.bibliografia.map(item => new Paragraph({
                        children: [new TextRun("• "), new TextRun(item)],
                        indent: { left: 720 },
                    })),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Secuencia_${data.encabezado.materia}_${data.encabezado.docente}.docx`);
};
