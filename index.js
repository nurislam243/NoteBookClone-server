const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const { extractTextFromPDF } = require('./pdfReader.js');
const { getEmbeddingFromCohere, getSimilarityScore,  generateAnswerFromCohere } = require('./cohere.js');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let pdfDataStorage = {
  text: "",
  embedding: null,
};

// __dirname is available by default in CommonJS, no need for fileURLToPath trick

// Multer setup
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// upload api 
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const text = await extractTextFromPDF(filePath);
    const embedding = await getEmbeddingFromCohere(text);

    pdfDataStorage.text = text;
    pdfDataStorage.embedding = embedding;

    res.json({ success: true, embedding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.post('/api/chat', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!pdfDataStorage.text || !pdfDataStorage.embedding) {
    return res.status(400).json({ error: 'No PDF uploaded yet' });
  }

  try {
    const questionEmbedding = await getEmbeddingFromCohere(question);
    const similarity = getSimilarityScore(questionEmbedding, pdfDataStorage.embedding);

    let answer;
    if (similarity > 0.0001) {
      // REAL AI-GENERATED ANSWER
      const context = pdfDataStorage.text.slice(0, 3000); // optional truncate
      answer = await generateAnswerFromCohere(context, question);
    } else {
      answer = `Your question is not closely related to the PDF content. [Similarity: ${similarity.toFixed(2)}]`;
    }

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat processing failed' });
  }
});



app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
