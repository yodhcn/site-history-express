import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    version: '1.2.4',
    name: '__MSG_name__',
    description: '__MSG_description__',
    offline_enabled: true,
    default_locale: 'en',
    action: {
      default_title: '__MSG_action_default_title__',
    },
    permissions: ['tabs', 'history', 'storage', 'favicon'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
