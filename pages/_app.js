import { Analytics } from '@vercel/analytics/react';
import '../styles/global.css';

 
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
 
export default MyApp;