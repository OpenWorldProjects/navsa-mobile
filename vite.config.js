import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'navsa-live-proxy',
      configureServer(server) {
        server.middlewares.use('/api/live', (req, res) => {
          const options = {
            hostname: 'navsa.spatias.com',
            port: 443,
            path: '/live',
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
              'Referer': 'https://navsa.spatias.com/',
            }
          };

          const request = https.request(options, (response) => {
            res.statusCode = response.statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            response.pipe(res);
          });

          request.on('error', (err) => {
            console.error('Error proxying to navsa:', err);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Failed to fetch live data' }));
          });

          request.end();
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
