import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // netlify dev(8888)가 프록시하는 대상. 컨테이너에서 접근 가능하도록 전 인터페이스 바인딩.
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
});
