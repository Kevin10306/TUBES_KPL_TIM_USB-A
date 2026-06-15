import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '@/components/Navbar/Navbar'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/utils/auth'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideNavbar = router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/barber') || router.pathname.startsWith('/chat');

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}
      <Component {...pageProps} />
    </AuthProvider>
  )
}