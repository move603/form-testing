// index.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL; // Set in .env
const SECRET_TOKEN = process.env.WEBHOOK_SECRET_TOKEN;   // Set in .env

app.post('/webhook', async (req, res) => {
  const token = req.query.token;
  if (token !== SECRET_TOKEN) {
    return res.status(403).send('Forbidden: Invalid token');
  }

  const data = req.body || {};
  const lines = ['*📨 New Form Submission (D)*'];
  for (const key in data) {
    lines.push(`*${key}*: ${data[key]}`);
  }

  const slackPayload = { text: lines.join('\n') };

  try {
    const slackRes = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });

    if (!slackRes.ok) {
      return res.status(500).send('Slack notification failed');
    }

    res.status(200).send('Notification sent');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
