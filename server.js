// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch'); // or built-in fetch in Node 18+
const upload = multer();
const app = express();

app.post('/api/describe-image', upload.single('image'), async (req, res) => {
  try {
    const promptTemplate = req.body.promptTemplate || '';
    const imageBuffer = req.file.buffer; // multer gives buffer
    const imageBase64 = imageBuffer.toString('base64');

    // Provider configuration: use environment variables so no secret is stored in code.
    const API_URL = process.env.GEMINI_API_URL || 'https://api.example.com/v1/describe';
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).send('Server misconfiguration: GEMINI_API_KEY not set');

    // Example POST to AI provider. Replace API_URL and payload with the provider's required format.
    const apiRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptTemplate,
        image_base64: imageBase64
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).send(text);
    }

    const json = await apiRes.json();
    // Expect the provider to return the textual description
    res.json({ description: json.description || JSON.stringify(json), promptUsed: promptTemplate });
  } catch (err) {
    res.status(500).send(String(err));
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));