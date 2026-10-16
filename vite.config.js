import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'heygen-token-api-middleware',
        configureServer(server) {
          // Serve POST /api/get-heygen-token directly within Vite dev server
          server.middlewares.use('/api/get-heygen-token', async (req, res) => {
            if (req.method === 'POST') {
              res.setHeader('Content-Type', 'application/json');

              const apiKey =
                process.env.HEYGEN_API_KEY ||
                env.HEYGEN_API_KEY ||
                env.VITE_HEYGEN_API_KEY;

              if (!apiKey) {
                console.warn('[Vite API] HEYGEN_API_KEY is not set in environment or .env');
                res.statusCode = 400;
                res.end(
                  JSON.stringify({
                    error: 'HEYGEN_API_KEY is missing. Please add it to your .env file.',
                    hasApiKey: false,
                  })
                );
                return;
              }

              try {
                console.log('[Vite API] Generating HeyGen streaming token via https://api.heygen.com/v1/streaming.create_token');
                const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                  },
                });

                const text = await response.text();
                let data = null;
                try {
                  data = JSON.parse(text);
                } catch {
                  data = { message: text.slice(0, 200) };
                }

                if (!response.ok || !data?.data?.token) {
                  res.statusCode = response.status || 500;
                  res.end(
                    JSON.stringify({
                      error: data?.message || data?.error || 'Failed to generate token from HeyGen.',
                      details: data,
                      hasApiKey: true,
                    })
                  );
                  return;
                }

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    token: data.data.token,
                    hasApiKey: true,
                  })
                );
              } catch (err) {
                console.error('[Vite API] Error fetching HeyGen token:', err);
                res.statusCode = 500;
                res.end(
                  JSON.stringify({
                    error: err.message || 'Internal error fetching HeyGen token',
                    hasApiKey: true,
                  })
                );
              }
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
          });
        },
      },
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei', '@heygen/streaming-avatar'],
    },
  };
});
