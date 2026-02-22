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
    VerticalAlign,
    PageOrientation
} from "docx";
import { saveAs } from "file-saver";

export const exportToWord = async (data) => {
    if (!data) return;

    const children = [];

    // Title
    children.push(
        new Paragraph({
            text: data.tipo || "Documento Educativo",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        })
    );

    // Dynamic Content Generator
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'tipo') return;

        // Header style for "encabezado"
        if (key.toLowerCase().includes('encabezado') && typeof value === 'object' && value !== null) {
            children.push(
                new Paragraph({
                    text: key.toUpperCase(),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 120 },
                })
            );
            Object.entries(value).forEach(([subKey, subVal]) => {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${subKey}: `, bold: true }),
                            new TextRun(String(subVal)),
                        ],
                        spacing: { after: 60 },
                    })
                );
            });
            children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
            return;
        }

        // Section Title
        children.push(
            new Paragraph({
                text: key.toUpperCase(),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
            })
        );

        // Render based on type
        if (typeof value === 'string') {
            children.push(new Paragraph({ text: value, spacing: { after: 120 } }));
        } else if (Array.isArray(value)) {
            if (value.length === 0) return;

            // Detect if it's a table (array of similar objects)
            const isTable = typeof value[0] === 'object' && !Array.isArray(value[0]) && value[0] !== null;

            if (isTable) {
                const colKeys = Object.keys(value[0]);

                children.push(
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            // Header Row
                            new TableRow({
                                children: colKeys.map(col => new TableCell({
                                    children: [new Paragraph({ text: col.toUpperCase(), bold: true, alignment: AlignmentType.CENTER })],
                                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
                                    verticalAlign: VerticalAlign.CENTER,
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 2 },
                                        bottom: { style: BorderStyle.DOUBLE, size: 2 },
                                        left: { style: BorderStyle.SINGLE, size: 1 },
                                        right: { style: BorderStyle.SINGLE, size: 1 },
                                    }
                                })),
                            }),
                            // Data Rows
                            ...value.map(row => new TableRow({
                                children: colKeys.map(col => new TableCell({
                                    children: [new Paragraph({ text: String(row[col] || ""), size: 18 })],
                                    verticalAlign: VerticalAlign.CENTER,
                                    borders: {
                                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                                        left: { style: BorderStyle.SINGLE, size: 1 },
                                        right: { style: BorderStyle.SINGLE, size: 1 },
                                    }
                                })),
                            }))
                        ],
                    })
                );
                children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
            } else {
                value.forEach((item, idx) => {
                    if (typeof item === 'string') {
                        children.push(
                            new Paragraph({
                                children: [new TextRun("• "), new TextRun(item)],
                                indent: { left: 360 },
                                spacing: { after: 60 },
                            })
                        );
                    } else if (typeof item === 'object' && item !== null) {
                        // Complexity (like classes/moments)
                        children.push(new Paragraph({ text: `Item ${idx + 1}`, bold: true, spacing: { before: 100 } }));
                        Object.entries(item).forEach(([subKey, subVal]) => {
                            children.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: `${subKey}: `, bold: true }),
                                        new TextRun(String(subVal)),
                                    ],
                                    indent: { left: 480 },
                                    spacing: { after: 40 },
                                })
                            );
                        });
                    }
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subVal]) => {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${subKey}: `, bold: true }),
                            new TextRun(String(subVal)),
                        ],
                        indent: { left: 240 },
                    })
                );
            });
        }
    });

    children.push(
        new Paragraph({
            text: "Documento generado por Maestro de las secuencias",
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
            size: 14,
            color: "94A3B8"
        })
    );

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children: children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.tipo || "Documento"}_${new Date().getTime()}.docx`);
};
