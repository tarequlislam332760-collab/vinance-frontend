import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 এর জন্য অফিসিয়াল প্লাগইন
  ],
  resolve: {
    alias: {
      // এটি ব্যবহার করলে আপনি '@/' লিখে সরাসরি src ফোল্ডার এক্সেস করতে পারবেন
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // আপনার লোকাল পোর্ট
    host: true, // মোবাইল বা অন্য ডিভাইস থেকে লোকাল নেটওয়ার্কে চেক করার জন্য
  },
  build: {
    outDir: 'dist', // Vercel বা অন্য কোথাও ডেপলয় করার জন্য আউটপুট ফোল্ডার
  }
})