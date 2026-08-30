import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { generatePostHandler } from './api/_lib/generatePost.js'

// Serves /api/generate-post during `npm run dev` using the exact same
// handler Vercel runs in production, so there's only one place the AI
// generation logic lives.
function apiDevServer() {
  return {
    name: 'postguard-api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/generate-post', (req, res) => {
        // generatePostHandler itself returns a JSON 405 for non-POST, so
        // this always terminates the request rather than falling through
        // to Vite's static file serving (which would otherwise leak the
        // handler's source on a GET, and doesn't happen in production).
        generatePostHandler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv only returns the vars; it doesn't touch process.env itself, but
  // the dev-only API handler above reads process.env directly (same as it
  // will on Vercel), so we copy them over for `npm run dev`.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    // Trim defensively: the AI SDK does not trim env values itself, so a
    // stray trailing newline/space from copy-pasting a key into .env.local
    // would otherwise fail authentication in a way that looks identical to
    // "wrong key".
    if (process.env[key] === undefined) process.env[key] = value.trim()
  }

  return {
    plugins: [react(), apiDevServer()],
  }
})
