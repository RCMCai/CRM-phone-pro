const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

let telnyxApiKey = null;
let telnyxNumber = null;

app.post('/api/store-telnyx-key', (req, res) => {
  telnyxApiKey = req.body.telnyxApiKey;
  telnyxNumber = req.body.telnyxNumber;
  res.json({ success: true });
});

app.post('/send-sms', async (req, res) => {
  if (!telnyxApiKey || !telnyxNumber) return res.status(400).send('API key or number not set');
  const { to, text } = req.body;
  try {
    const response = await axios.post(
      'https://api.telnyx.com/v2/messages',
      { from: telnyxNumber, to, text },
      { headers: { 'Authorization': `Bearer ${telnyxApiKey}`, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/make-call', async (req, res) => {
  if (!telnyxApiKey || !telnyxNumber) return res.status(400).send('API key or number not set');
  const { to } = req.body;
  try {
    const response = await axios.post(
      'https://api.telnyx.com/v2/calls',
      { connection_id: 'YOUR_CONNECTION_ID', to, from: telnyxNumber, url: '/call-control' },
      { headers: { 'Authorization': `Bearer ${telnyxApiKey}`, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/call-control', (req, res) => {
  const { event_type } = req.body;
  if (event_type === 'call.initiated') res.json({ action: 'continue' });
  else if (event_type === 'call.ended') res.status(200).send('OK');
});

app.listen(3000, () => console.log('Server running on port 3000'));