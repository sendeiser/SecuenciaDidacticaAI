import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Configure PDF.js worker using a more stable CDN approach
const PDFJS_VERSION = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

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
        console.error("DEBUG - PDF Parsing Details:", error);
        throw new Error(`Error en PDF: ${error.message || 'No se pudo leer'}`);
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
