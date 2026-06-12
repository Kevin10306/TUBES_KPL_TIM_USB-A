import styles from '@/styles/view/Auth/Register/Register.module.css';
import { StyleRegistry } from 'styled-jsx';

export default function RegisterPage() {
  return (
    <>
    <div className="bg-layer"></div>
    <main className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        
        {/* Header */}
        <h1 className={styles['auth-title']}>Daftar Akun</h1>

        {/* Form Register */}
        <form className={styles['auth-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="name">Nama Lengkap</label>
            <input id="name" type="text" placeholder="Nama kamu" />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@kamu.com" />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='phone'>No WhatsApp</label>
            <input id='phone' type='text' placeholder='+62'/>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className={styles['buttonDaftar']} style={{ position: 'relative', bottom: '0', left: '0', marginTop: '10px' }}>Daftar</button>
        </form>

        {/* Link ke Login */}
        <p className={styles['auth-footer']}>
          Sudah punya akun? <a href="/auth/login">Masuk di sini</a>
        </p>

      </div>
    </main>
    </>
  )
}
