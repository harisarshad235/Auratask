import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Secure HTTP response headers for local preview and server
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloudflareinsights.com; frame-src 'self' https://*.supabase.co https://accounts.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
    },
    // Disable debug logs and debugger statements in production bundles
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none',
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      sourcemap: false, // Prevent exposing source code or debug maps in production
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Granular vendor chunk splitting for cache efficiency
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react'
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion'
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase'
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide'
              }
              if (id.includes('canvas-confetti')) {
                return 'vendor-confetti'
              }
              return 'vendor-deps'
            }
          },
        },
      },
    },
    server: {
      host: true,
      port: 5173,
      open: false,
      headers: securityHeaders,
    },
    preview: {
      host: true,
      port: 4173,
      headers: securityHeaders,
    },
  }
})