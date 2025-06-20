import React from 'react';
import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import 'dayjs/locale/zh';
import 'dayjs/locale/ja';

import { i18n } from '@/utils/i18n.ts';
import App from './App.tsx';
import './style.css';

dayjs.locale(i18n.lang);
dayjs.extend(relativeTime);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
