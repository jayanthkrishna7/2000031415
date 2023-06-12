const express = require('express');
const axios = require('axios');
const { URL } = require('url');

const app = express();
const PORT = 3000;
const TIMEOUT = 500;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URL parameter' });
  }

  const validUrls = urls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  });

  const promises = validUrls.map(async url => {
    try {
      const response = await axios.get(url, { timeout: TIMEOUT });
      if (response.status === 200 && Array.isArray(response.data.numbers)) {
        return response.data.numbers;
      }
    } catch (error) {
      // Ignore URL if it takes too long to respond or returns invalid data
    }
    return [];
  });

  try {
    const results = await Promise.all(promises);
    const allNumbers = results.flat();
    const uniqueNumbers = Array.from(new Set(allNumbers));
    const sortedNumbers = uniqueNumbers.sort((a, b) => a - b);
    res.json({ numbers: sortedNumbers });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
