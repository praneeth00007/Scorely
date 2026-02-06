import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Providers } from './Providers.tsx'
import './index.css'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
const isProd = import.meta.env.PROD;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
      {isProd && <SpeedInsights />}
      {isProd && <Analytics />}
    </Providers>
  </React.StrictMode>,
)
