import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin, ViteDevServer } from 'vite'

/**
 * Dev-only plugin that handles /api/rss-aggregator requests locally.
 * In production, these are handled by the Netlify Function.
 * In Vite dev mode (without `netlify dev`), this plugin fetches the RSS
 * URL server-side (no CORS) and returns the XML to the client.
 */
function rssAggregatorDevPlugin(): Plugin {
  return {
    name: 'rss-aggregator-dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/rss-aggregator', async (req: any, res: any) => {
        const url = new URL(req.url, 'http://localhost');
        const feedUrl = url.searchParams.get('url');

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (!feedUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing required parameter: url' }));
          return;
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const upstream = await fetch(feedUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'SocialCaution-Dev/1.0 RSS Reader',
              'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
            }
          });
          clearTimeout(timeout);

          const contentType = upstream.headers.get('content-type') || 'application/xml';
          const body = await upstream.text();

          res.statusCode = upstream.status;
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=1800');
          res.end(body);
        } catch (err: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Failed to fetch feed' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react(), rssAggregatorDevPlugin()],
    optimizeDeps: {
      include: [
        'web-vitals',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
        'exifr'
      ],
      esbuildOptions: {
        // Preserve React module structure
        keepNames: true,
        // Ensure proper module resolution
        platform: 'browser'
      }
    },
    resolve: {
      // Dedupe React to avoid multiple instances
      dedupe: ['react', 'react-dom']
    },
    server: {
      port: 5175,
      host: true,
      strictPort: false, // Allow Vite to use alternative port if 5175 is in use
      hmr: {
        port: 5175,
        overlay: false
      },
      cors: true
    },
    build: {
      outDir: 'dist',
      // Production optimizations
      minify: 'terser',
      sourcemap: !isProduction, // Only in development
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      },
      rollupOptions: {
        output: {
          // Chunk splitting for better caching
          manualChunks: (id) => {
            // CRITICAL: Keep React and all React-dependent libraries in main bundle
            // This ensures React is always available before any code that uses it
            // Check for React first to prevent it from going into vendor chunks
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/react/jsx-runtime') ||
                id.includes('node_modules/react/jsx-dev-runtime') ||
                id.includes('node_modules/react-router') ||
                id.includes('node_modules/react-router-dom') ||
                id.includes('node_modules/lucide-react') ||
                id.includes('node_modules/@sentry/react') ||
                id.includes('node_modules/hoist-non-react-statics') ||
                id.includes('node_modules/framer-motion')) {
              return undefined; // Keep React and React-dependent libs in main bundle
            }
            
            // Vendor chunks for non-React libraries only
            if (id.includes('node_modules')) {
              // Other Sentry packages and web-vitals can go to vendor-utils
              if (id.includes('web-vitals') || (id.includes('@sentry') && !id.includes('@sentry/react'))) {
                return 'vendor-utils';
              }
              // Exclude React-related packages from vendor
              if (!id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
                return 'vendor';
              }
            }
            
            // Feature chunks for better code splitting
            // Keep contexts and common components in main bundle since they use React context and are used everywhere
            if (id.includes('/contexts/') || id.includes('/components/common/')) {
              return undefined; // Keep in main bundle with React
            }
            // Keep HomePage in main bundle - it's the entry point
            if (id.includes('/components/HomePage')) {
              return undefined; // Keep in main bundle
            }
            // Keep ServiceCatalog in main bundle to avoid duplicate React/context (useContext null error when lazy-loaded in separate chunk)
            if (id.includes('/components/ServiceCatalog')) {
              return undefined;
            }
            if (id.includes('/components/assessments/')) {
              return 'feature-assessments';
            }
            if (id.includes('/components/pages/')) {
              return 'feature-pages';
            }
            // Chunk other root-level components
            if (id.includes('/components/PersonalizedDashboard')) {
              return 'feature-dashboard';
            }
            if (id.includes('/components/AdaptiveResources')) {
              return 'feature-resources';
            }
            if (id.includes('/components/PersonalizedToolkit')) {
              return 'feature-toolkit';
            }
            if (id.includes('/components/PrivacyToolsDirectory')) {
              return 'feature-tools';
            }
          },
          // Asset file naming
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) {
              return `assets/[name]-[hash][extname]`;
            }
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            // Keep favicon and logo files in root for proper browser access
            if (assetInfo.name === 'favicon.ico' || assetInfo.name === 'socialcaution.png') {
              return `[name][extname]`;
            }
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js'
        }
      },
      // Performance budgets
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096
    },
    // Production-only optimizations
    ...(isProduction && {
      define: {
        'process.env.NODE_ENV': '"production"',
        '__DEV__': false
      }
    })
  }
})