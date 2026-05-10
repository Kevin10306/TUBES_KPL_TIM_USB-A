import styles from '@/styles/view/Auth/Login/Login.module.css';

export default function LoginPage() {
  return (
    <>
    <div className="bg-layer"></div>
    <main className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        
        {/* Header */}
        <h1 className={styles['auth-title']}>Selamat Datang</h1>

        {/* Form Login */}
        <form className={styles['auth-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@kamu.com" />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className={styles['buttonMasuk']}>Masuk</button>
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
