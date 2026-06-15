import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/view/Auth/Register/Register.module.css';

// Kode akses rahasia untuk mendaftar sebagai Pemilik Barber
// Ganti sesuai kode yang Anda inginkan
const OWNER_ACCESS_CODE = 'CUKURIN2025';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' // default role
  });
  const [ownerCode, setOwnerCode] = useState('');
  const [ownerCodeError, setOwnerCodeError] = useState('');
  const [showOwnerCode, setShowOwnerCode] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showOwnerCodeText, setShowOwnerCodeText] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Tampilkan/sembunyikan field kode akses saat role berubah
    if (id === 'role') {
      setShowOwnerCode(value === 'owner');
      setOwnerCode('');
      setOwnerCodeError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi kode akses jika mendaftar sebagai owner
    if (formData.role === 'owner') {
      if (ownerCode.trim().toUpperCase() !== OWNER_ACCESS_CODE) {
        setOwnerCodeError('Kode akses salah! Hubungi admin untuk mendapatkan kode.');
        return;
      }
    }

    const existingUsers = JSON.parse(localStorage.getItem('cukurin_users') || '[]');
    const newUser = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    };
    
    // Check if email exists
    if (existingUsers.some((u: any) => u.email === formData.email)) {
      alert('Email sudah digunakan!');
      return;
    }

    localStorage.setItem('cukurin_users', JSON.stringify([...existingUsers, newUser]));
    alert('Registrasi berhasil! Silakan login.');
    router.push('/auth/login');
  };

  return (
    <>
    <title>Daftar | Cukurin</title>
    <div className="bg-layer"></div>
    <main className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        
        {/* Header */}
        <h1 className={styles['auth-title']}>Daftar Akun</h1>

        {/* Form Register */}
        <form className={styles['auth-form']} onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="name">Nama Lengkap</label>
            <input id="name" type="text" placeholder="Nama kamu" required value={formData.name} onChange={handleChange} />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@kamu.com" required value={formData.email} onChange={handleChange} />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='phone'>No WhatsApp</label>
            <input id='phone' type='text' placeholder='+62' required value={formData.phone} onChange={handleChange} />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPasswordText ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
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
                  /* Eye-off */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* Eye */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="role">Daftar Sebagai</label>
            <select id="role" required value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.09)', color: '#947318', outline: 'none' }}>
              <option value="customer">Pelanggan</option>
              <option value="owner">Pemilik Barber</option>
            </select>
          </div>

          {/* Field Kode Akses — hanya muncul jika pilih Pemilik Barber */}
          {showOwnerCode && (
            <div className={styles['form-group']} style={{ animation: 'slideDown 0.3s ease' }}>
              <label htmlFor="ownerCode" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Lock icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Kode Akses Pemilik
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="ownerCode"
                  type={showOwnerCodeText ? 'text' : 'password'}
                  placeholder="Masukkan kode dari admin..."
                  value={ownerCode}
                  onChange={e => {
                    setOwnerCode(e.target.value);
                    setOwnerCodeError('');
                  }}
                  required={formData.role === 'owner'}
                  style={{
                    borderColor: ownerCodeError ? '#ef4444' : undefined,
                    paddingRight: '44px',
                    width: '100%',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerCodeText(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '4px',
                    color: 'var(--text-secondary)', display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                  aria-label={showOwnerCodeText ? 'Sembunyikan kode' : 'Tampilkan kode'}
                >
                  {showOwnerCodeText ? (
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
              {ownerCodeError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.82rem', marginTop: '6px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {ownerCodeError}
                </div>
              )}
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Kode ini hanya diberikan kepada pemilik barbershop yang terdaftar.
              </p>
            </div>
          )}

          <button type="submit" className={styles['buttonDaftar']} style={{ position: 'relative', bottom: '0', left: '0', marginTop: '10px' }}>Daftar</button>
        </form>

        {/* Link ke Login */}
        <p className={styles['auth-footer']}>
          Sudah punya akun? <a href="/auth/login">Masuk di sini</a>
        </p>

      </div>
    </main>
    <style>{`
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    </>
  )
}
