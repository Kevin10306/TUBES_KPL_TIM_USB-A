import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/view/Auth/Login/Login.module.css';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Di sini biasanya ada logika login, tapi kita langsung ke dashboard aja dulu
    router.push('/dashboard');
  };

  return (
    <>
    <title>Login | Cukurin</title>
    <div className="bg-layer"></div>
    <main className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        
        {/* Header */}
        <h1 className={styles['auth-title']}>Selamat Datang</h1>

        {/* Form Login */}
        <form className={styles['auth-form']} onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@kamu.com" />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className={styles['buttonMasuk']}>Masuk</button>
          
          <Link href="/dashboard" className={styles['buttonTamu']} style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Masuk sebagai tamu
          </Link>
        </form>

        {/* Link ke Register */}
        <p className={styles['auth-footer']}>
          Belum punya akun? <a href="/auth/register">Daftar sekarang</a>
        </p>

      </div>
    </main>
    </>
  )
}
