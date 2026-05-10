import styles from "./Manfaat.module.css"

const Manfaat = () => {
    return (
        <>
        <section className={styles.manfaatPelanggan}>
          <h1 className={styles.manfaatTitle}>Untuk Pelanggan</h1>
            <div className={styles.manfaatDescription}>
              <div className={styles.bgBox}>
                <p className={styles.manfaatItem}>Daftar antrean kapan saja dan di mana saja</p>
              </div>

              <div className={styles.bgBox}>
                <p className={styles.manfaatItem}>Tidak perlu menunggu lama di barbershop</p>
              </div>

              <div className={styles.bgBox}>
                <p className={styles.manfaatItem}>Bisa melihat antrean barbershop favoritmu</p>
              </div>
            </div>
        </section>

        <section className="manfaatBarber">
          <h1 className={styles.manfaatTitle}>Untuk Barber & Barbershop</h1>
            <div className={styles.manfaatDescription}>
              <div className={styles.bgBox}>
                <p className={styles.manfaatItem}>Kelola antrean lebih efisien</p>
              </div>

              <div className={styles.bgBox}>
                <p className={styles.manfaatItem}>Terjangkau luas</p>
              </div>

              <div className={styles.bgBox}>
                <p className={styles.manfaatItem}>Dapatkan keuntungan lebih banyak</p>
              </div>
            </div>
        </section>
        </>
    )
}

export default Manfaat