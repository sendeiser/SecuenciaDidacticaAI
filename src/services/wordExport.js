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
                    // Complexity (like classes)
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
            text: "Documento generado por Maestro de Planificaciones",
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
