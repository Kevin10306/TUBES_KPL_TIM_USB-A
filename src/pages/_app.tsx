import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '@/components/Navbar/Navbar'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isDashboard = router.pathname === '/dashboard';

  return (
    <>
      {!isDashboard && <Navbar />}
      <Component {...pageProps} />
    </>
  )
}