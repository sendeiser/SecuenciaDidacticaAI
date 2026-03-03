import partialParse from 'partial-json-parser';

/**
 * Decodes and processes a streaming response from Groq/OpenAI-like APIs.
 * @param {Response} response - The fetch response object with a body stream.
 * @param {Function} onProgress - Callback function called with the partial JSON object.
 * @returns {Promise<Object>} The final complete JSON object.
 */
export const processAIStream = async (response, onProgress) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let lastParsedJson = null;
    let lineBuffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            lineBuffer += chunk;

            const lines = lineBuffer.split('\n');
            // Keep the last partial line in the buffer
            lineBuffer = lines.pop();

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine === "" || trimmedLine === "data: [DONE]") continue;

                if (trimmedLine.startsWith("data: ")) {
                    try {
                        const jsonStr = trimmedLine.substring(6);
                        const data = JSON.parse(jsonStr);

                        // Check for API errors in the stream
                        if (data.error) {
                            throw new Error(data.error.message || "Error en el stream de la IA");
                        }

                        const delta = data.choices?.[0]?.delta?.content || "";
                        fullContent += delta;

                        // Try to parse partial JSON
                        try {
                            if (fullContent.trim().startsWith('{')) {
                                const partial = partialParse(fullContent);
                                if (partial && typeof partial === 'object') {
                                    lastParsedJson = partial;
                                    onProgress(partial);
                                }
                            }
                        } catch (e) {
                            // Wait for more content
                        }
                    } catch (e) {
                        console.warn("Fragmented line skipped", trimmedLine);
                    }
                }
            }
        }

        // Final parse for completeness
        try {
            return JSON.parse(fullContent);
        } catch (e) {
            return lastParsedJson;
        }
    } catch (error) {
        console.error("Error processing AI stream:", error);
        throw error;
    }
};
