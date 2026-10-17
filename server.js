import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════════════════════════
// 1. ELEVENLABS REALISTIC TEXT-TO-SPEECH (TTS) ENDPOINT
// ════════════════════════════════════════════════════════════════════
app.post('/api/assistant/tts/elevenlabs', async (req, res) => {
  try {
    const { text, voiceId, emotion, stability, similarityBoost } = req.body;
    const apiKey = process.env.ELEVENLABS_API_KEY || req.headers['x-elevenlabs-key'];

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text prompt is required for TTS synthesis.' });
    }

    if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
      // Gracefully signal the frontend to use native Web Speech API fallback without errors
      return res.status(200).json({
        fallback: true,
        reason: 'ELEVENLABS_API_KEY is not configured in .env. Falling back to high-quality browser Web Speech API.',
      });
    }

    // Default Voice: Rachel (Warm, empathetic, professional female mentor voice)
    const activeVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    // Emotion-informed voice tuning (Calmer and more stable when user is anxious)
    const voiceSettings = {
      stability: stability !== undefined ? stability : emotion === 'anxious' ? 0.85 : 0.72,
      similarity_boost: similarityBoost !== undefined ? similarityBoost : 0.80,
      style: emotion === 'confident' ? 0.45 : 0.25,
      use_speaker_boost: true,
    };

    console.log(`[ElevenLabs TTS] Generating speech for voice ${activeVoiceId} (emotion: ${emotion || 'neutral'})...`);

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${activeVoiceId}`;
    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_multilingual_v2', // Or 'eleven_turbo_v2' for ultra-low latency
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[ElevenLabs TTS] Upstream error from ElevenLabs API:', response.status, errorText);
      return res.status(200).json({
        fallback: true,
        reason: `ElevenLabs API status ${response.status}: Falling back to browser speech synthesis.`,
        details: errorText,
      });
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioArrayBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-cache',
    });

    return res.send(buffer);
  } catch (error) {
    console.error('[ElevenLabs TTS] Server synthesis error:', error);
    return res.status(200).json({
      fallback: true,
      reason: 'Server synthesis exception. Using browser speech fallback.',
      error: error.message,
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 2. GEMINI EMPATHETIC REASONING & CHAT ENDPOINT
// ════════════════════════════════════════════════════════════════════
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], emotionalState = {} } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        hasServerKey: false,
        message: 'No server-side GEMINI_API_KEY. Frontend will use client key or local reasoning engine.',
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `
You are Dr. Ann Vance, an empathetic and caring AI mentor.
Conduct your internal reasoning inside <thought> ... </thought> tags.
In your thinking:
1. Detect user emotion & stress level.
2. Determine their emotional need.
3. Formulate a warm, validating response (max 2-3 sentences).
Output ONLY the thinking tags followed by the spoken words.
`.trim();

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nStudent says: "${message}"\nDetected emotion: ${emotionalState.primaryEmotion || 'neutral'}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    };

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiRes.ok) {
      throw new Error(`Gemini status ${apiRes.status}`);
    }

    const data = await apiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const thoughtMatch = raw.match(/<thought>([\s\S]*?)<\/thought>/i);
    const thoughtProcess = thoughtMatch ? thoughtMatch[1].trim() : 'Formulated empathetic validation and response.';
    const spokenText = raw.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

    return res.json({
      thoughtProcess,
      spokenText,
      hasServerKey: true,
    });
  } catch (err) {
    console.error('[Assistant Chat API] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════
// 3. ASSISTANT CONFIGURATION & HEALTH ENDPOINTS
// ════════════════════════════════════════════════════════════════════
app.get('/api/assistant/config', (req, res) => {
  res.json({
    hasElevenLabsKey: !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here'),
    hasGeminiKey: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    defaultVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
    status: 'online',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasHeyGenKey: !!(process.env.HEYGEN_API_KEY || process.env.VITE_HEYGEN_API_KEY),
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasGeminiKey: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
  });
});

app.listen(PORT, () => {
  console.log(`[Assistant Backend] Server running on http://localhost:${PORT}`);
  console.log(`[Assistant Backend] ElevenLabs TTS: POST http://localhost:${PORT}/api/assistant/tts/elevenlabs`);
  console.log(`[Assistant Backend] Empathetic Chat: POST http://localhost:${PORT}/api/assistant/chat`);
});
