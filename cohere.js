require('dotenv').config();
const { CohereClient } = require("cohere-ai");

// Create an instance of CohereClient
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function getEmbeddingFromCohere(text) {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: "embed-english-v3.0",
      inputType: "search_document"
    });
    return response.embeddings[0];
  } catch (error) {
    console.error("Cohere API Error:", error);
    throw error;
  }
}

function getSimilarityScore(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

async function generateAnswerFromCohere(context, question) {
  try {
    const response = await cohere.generate({
      model: "command-r-plus",
      prompt: `Context:\n${context}\n\nQuestion: ${question}\nAnswer:`,
      maxTokens: 300,
      temperature: 0.5,
    });
    return response.generations[0].text.trim();
  } catch (err) {
    console.error("Generate API Error:", err);
    throw err;
  }
}

module.exports = {
  getEmbeddingFromCohere,
  getSimilarityScore,
  generateAnswerFromCohere
};
