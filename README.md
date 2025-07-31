# Google NotebookLM Clone - Backend

This is the backend server for the Google NotebookLM Clone project. It is built with **Node.js** and **Express.js** and integrates with the **Cohere AI API** to embed and generate answers from uploaded PDF documents.

---

## Features

- Upload large PDF files and extract text content page-wise.
- Generate vector embeddings of each page's text using Cohere AI.
- Receive user questions related to the uploaded PDF via a chat API.
- Find the most relevant page in the PDF based on semantic similarity.
- Generate concise and context-aware answers from the matched PDF page content.
- Minimal token usage to optimize API calls and costs.

---

## Tech Stack

- **Node.js** and **Express.js** — Backend framework.
- **Multer** — File upload handling.
- **pdf-parse** — Parsing and extracting text from PDFs page-wise.
- **Cohere AI** — Text embedding and generation API.
- **CORS** — Cross-Origin Resource Sharing for frontend-backend communication.

---

## Live Demo

The backend server is live and accessible at:

[https://your-backend-url.example.com](https://your-backend-url.example.com)

*Replace the above URL with your actual deployed backend URL.*

---

## Environment Variables

Create a `.env` file in the root folder of the backend and add the following:

```bash
PORT=5000
COHERE_API_KEY=your_cohere_api_key_here
``

Replace your_cohere_api_key_here with your actual Cohere API key.

The port can be changed as needed.

Installation
Clone or unzip the backend source code.

Navigate to the backend directory.

Install dependencies:

``bash
npm install
Add your .env file with the required environment variables.

Create an uploads folder in the backend root for temporary PDF uploads:

bash
mkdir uploads
Usage
Start the server by running:

bash
npm start
The server will start on http://localhost:<PORT> (default 5000).

API Endpoints
POST /upload
Description: Upload a PDF file. The server extracts text page-wise, generates embeddings, and stores them in memory.

Request: multipart/form-data with key pdf containing the PDF file.

Response:

json

{
  "success": true,
  "totalPages": <number_of_pages_processed>
}
POST /api/chat
Description: Ask a question related to the uploaded PDF.

Request Body (JSON):

json

{
  "question": "Your question here"
}
Response (JSON):

json

{
  "answer": "Generated answer text",
  "page": <page_number_of_relevant_section>
}
If no PDF is uploaded or question is missing, returns a 400 error.

Code Structure
index.js: Main Express server with routes and logic.

cohere.js: Cohere API wrapper functions for embedding, similarity, and answer generation.

pdfReader.js: PDF text extraction utility to split text page-wise.

uploads/: Temporary folder for storing uploaded PDFs.

Important Notes
Uploaded PDFs are deleted after processing to save storage.

All embeddings and text are stored in memory (pdfChunks) — suitable for moderate usage.

For production, consider persistent storage and advanced caching.

API keys must be kept secure and never committed to public repositories.

How It Works (Summary)
User uploads PDF via /upload.

Server extracts each page's text and generates embeddings using Cohere.

User sends question via /api/chat.

Server embeds the question, finds the best matching PDF page by similarity.

Server generates an answer based on that page's text and returns it with the page number.

Frontend can use the page number to display citation/navigation.