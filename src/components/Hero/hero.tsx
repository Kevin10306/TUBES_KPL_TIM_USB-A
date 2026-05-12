import {useRouter} from "next/router"
import styles from "./hero.module.css"

const Hero = () => {
    const router = useRouter()
    return (
        <section className={styles.hero}>

          <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={() => router.push('/auth/login')}>Booking Sekarang</button>
              <div className={styles.bgContent} onClick={() => router.push('/auth/login')}>Untuk Barber & Barbershop</div>
            </div>

          <div className={styles.imageBackground}>
            <img src="/bgHero.jpeg" alt="barber" />
          </div>
        </section>
    )
}

export default Hero;