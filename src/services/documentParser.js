import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text from a .docx file using mammoth.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const parseDocx = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value; // The raw text
    } catch (error) {
        console.error("Error parsing DOCX:", error);
        throw new Error("No se pudo leer el archivo Word (.docx)");
    }
};

/**
 * Extracts text from a .pdf file using pdf.js.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const parsePdf = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("No se pudo leer el archivo PDF");
    }
};

/**
 * Universal parser based on file extension.
 * @param {File} file 
 */
export const parseDocument = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'docx') {
        return await parseDocx(file);
    } else if (extension === 'pdf') {
        return await parsePdf(file);
    } else {
        throw new Error("Formato de archivo no soportado. Usa .docx o .pdf");
    }
};
