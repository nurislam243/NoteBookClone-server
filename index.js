const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { extractPagesFromPDF } = require('./pdfReader');
const { getEmbeddingFromCohere, getSimilarityScore, generateAnswerFromCohere } = require('./cohere');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let pdfChunks = [];

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

let pdfDataStorage = {
  pages: [],
  pageEmbeddings: []
};


app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const pages = await extractPagesFromPDF(filePath);

    pdfChunks = [];

    for (const { page, text } of pages) {
      if (text.trim().length === 0) continue;

      const embedding = await getEmbeddingFromCohere(text);
      pdfChunks.push({ page, text, embedding });
    }

    // Delete uploaded file after processing
    fs.unlink(filePath, () => {});

    res.json({ success: true, totalPages: pdfChunks.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during PDF processing' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: 'Question is required' });
  if (pdfChunks.length === 0) return res.status(400).json({ error: 'No PDF uploaded yet' });

  try {
    const questionEmbedding = await getEmbeddingFromCohere(question);

    let bestMatch = null;
    let bestScore = -1;

    for (const chunk of pdfChunks) {
      const score = getSimilarityScore(questionEmbedding, chunk.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = chunk;
      }
    }

    if (!bestMatch) {
      return res.json({ answer: "No relevant page found.", page: null });
    }

    const answer = await generateAnswerFromCohere(bestMatch.text, question);

    res.json({
      answer,
      page: bestMatch.page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
