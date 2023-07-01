import { Analytics } from '@vercel/analytics/react';
import '../styles/global.css';
import { StrictMode } from 'react';

 
function MyApp({ Component, pageProps }) {
  return (
    <StrictMode>
      <Component {...pageProps} />
      <Analytics />
    </StrictMode>
  );
}
 
export default MyApp;