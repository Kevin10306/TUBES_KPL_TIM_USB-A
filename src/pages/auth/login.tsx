import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth';
import styles from '@/styles/view/Auth/Login/Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulate login verification against local storage mock db
    const existingUsers = JSON.parse(localStorage.getItem('cukurin_users') || '[]');
    const user = existingUsers.find((u: any) => u.email === email && u.password === password);

    if (user) {
      // Remove password before saving to session
      const { password, ...userSession } = user;
      login(userSession);
      router.push('/dashboard');
    } else {
      setError('Email atau password salah. Jika belum punya akun, silakan daftar terlebih dahulu.');
    }
  };

  const loginAsGuest = () => {
    login({
      id: 'guest',
      name: 'Tamu Cukurin',
      email: 'tamu@cukurin.com',
      phone: '-',
      role: 'customer'
    });
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

        {/* Banner jika sudah login */}
        {isAuthenticated && (
          <div style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.9rem' }}>
            <p>Kamu sudah login sebagai <strong>{user?.name}</strong> ({user?.role === 'owner' ? 'Pemilik Barber' : 'Pelanggan'}).</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => router.push('/dashboard')} style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Ke Dashboard</button>
              <button onClick={logout} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Ganti Akun (Logout)</button>
            </div>
          </div>
        )}

        {/* Form Login */}
        <form className={styles['auth-form']} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
          
          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@kamu.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPasswordText ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '44px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '4px',
                  color: 'var(--text-secondary)', display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
                aria-label={showPasswordText ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPasswordText ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className={styles['buttonMasuk']}>Masuk</button>



          <button type="button" onClick={loginAsGuest} className={styles['buttonTamu']} style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: '12px' }}>
            Masuk sebagai tamu
          </button>
        </form>

        {/* Link ke Register */}
        <p className={styles['auth-footer']}>
          Belum punya akun? <Link href="/auth/register">Daftar sekarang</Link>
        </p>

      </div>
    </main>
    </>
  )
}
