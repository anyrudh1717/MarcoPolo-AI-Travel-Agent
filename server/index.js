const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.post('/api/plan', (req, res) => {
  const { start_location, destination, start_date, end_date } = req.body;

  if (!start_location || !destination || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const python = spawn('python', [
    path.join(__dirname, '../pipeline/planner.py'),
    start_location,
    destination,
    start_date,
    end_date
  ]);

  let result = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    if (data) result += data.toString();
  });

  python.stderr.on('data', (data) => {
    if (data) errorOutput += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0 || errorOutput) {
      console.error('Python script failed:', errorOutput);
      return res.status(500).json({ error: 'Internal server error', details: errorOutput });
    }

    res.json({ plan: result });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
});
