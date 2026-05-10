import {useRouter} from "next/router"
import styles from "./hero.module.css"

const Hero = () => {
    const router = useRouter()
    
    return (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.heroDescription}>Daftar antrean barbershop favoritmu, tanpa perlu nunggu di tempat.</p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={() => router.push('/auth/login')}>Booking Sekarang</button>
              <div className={styles.bgContent}>Untuk Barber & Barbershop</div>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <div className={styles.heroImg}>
              <img src="/hero.jpeg" alt="barber" />
            </div>
          </div>
        </section>
    )
}

export default Hero;