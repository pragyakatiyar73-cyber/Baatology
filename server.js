import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * POST /api/get-heygen-token
 * Creates a HeyGen streaming token using process.env.HEYGEN_API_KEY
 */
app.post('/api/get-heygen-token', async (req, res) => {
  try {
    const apiKey = process.env.HEYGEN_API_KEY || process.env.VITE_HEYGEN_API_KEY;

    if (!apiKey) {
      console.warn('[HeyGen API] Warning: HEYGEN_API_KEY is not set in environment.');
      return res.status(400).json({
        error: 'HEYGEN_API_KEY is missing in server environment variables.',
        hasApiKey: false,
      });
    }

    console.log('[HeyGen API] Requesting new streaming token from HeyGen...');
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.token) {
      console.error('[HeyGen API] HeyGen responded with error:', data);
      return res.status(response.status || 500).json({
        error: data?.message || 'Failed to generate HeyGen streaming token.',
        details: data,
        hasApiKey: true,
      });
    }

    console.log('[HeyGen API] Successfully generated streaming token.');
    return res.json({
      token: data.data.token,
      hasApiKey: true,
    });
  } catch (error) {
    console.error('[HeyGen API] Server error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error while creating HeyGen token',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasHeyGenKey: !!(process.env.HEYGEN_API_KEY || process.env.VITE_HEYGEN_API_KEY),
  });
});

app.listen(PORT, () => {
  console.log(`[HeyGen Backend] Server running on http://localhost:${PORT}`);
  console.log(`[HeyGen Backend] POST route ready at http://localhost:${PORT}/api/get-heygen-token`);
});
