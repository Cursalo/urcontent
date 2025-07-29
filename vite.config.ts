import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isAnalyze = mode === 'analyze'
  
  return {
    plugins: [
      react(),
      // Bundle analyzer plugin
      isAnalyze && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    
    server: {
      host: '::',
      port: 8080,
      historyApiFallback: true,
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'es2015',
      
      rollupOptions: {
        // Ensure proper external handling for platform-specific binaries
        external: (id) => {
          // Don't bundle platform-specific Rollup binaries
          if (id.includes('@rollup/rollup-')) return true
          return false
        },
        // Additional configuration for better Vercel compatibility
        treeshake: {
          preset: 'smallest',
          manualPureFunctions: ['console.log', 'console.info']
        },
        output: {
          // Optimize bundle splitting
          manualChunks: {
            // Vendor chunk for core React libraries
            vendor: ['react', 'react-dom', 'react-router-dom'],
            
            // UI components chunk
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              'lucide-react'
            ],
            
            // Form and validation chunk
            forms: [
              'react-hook-form',
              '@hookform/resolvers',
              'zod'
            ],
            
            // Charts and visualization
            charts: ['recharts'],
            
            // Utility libraries
            utils: [
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
              'date-fns'
            ]
          },
          
          // Naming pattern for chunks
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[^.]*$/, '')
              : 'chunk'
            return `js/${facadeModuleId}-[hash].js`
          },
          
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `img/[name]-[hash][extname]`
            }
            if (/css/i.test(ext)) {
              return `css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          }
        }
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    
    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zod'
      ]
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // Define environment variables
    define: {
      __DEV__: mode === 'development'
    }
  }
})