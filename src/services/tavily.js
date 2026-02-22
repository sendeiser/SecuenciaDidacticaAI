/**
 * Service to interact with Tavily Search API.
 * Optimized for finding educational resources, lesson plans, and activities.
 */
export const searchEducationalResources = async (query) => {
    const API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

    // If no API key is provided, return empty results gracefully
    if (!API_KEY) {
        console.warn("Tavily API Key missing. Skipping web search.");
        return [];
    }

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: API_KEY,
                query: `${query} secuencia didáctica actividades alumnos secundaria argentina`,
                search_depth: "basic", // "basic" is faster and cheaper
                include_answer: false,
                include_images: false,
                max_results: 5,
                // Boost searches from relevant educational domains
                include_domains: ["educ.ar", "abc.gob.ar", "argentina.gob.ar", "mendoza.edu.ar", "buenosaires.gob.ar"]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Error in Tavily API");
        }

        const data = await response.json();

        // Format results for the LLM prompt
        return data.results.map(result => ({
            title: result.title,
            url: result.url,
            content: result.content
        }));
    } catch (error) {
        console.error("Error fetching educational resources from Tavily:", error);
        return []; // Return empty array to not break the main flow
    }
};
