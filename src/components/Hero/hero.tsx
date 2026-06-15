import { useRouter } from "next/router"
import { useAuth } from "@/utils/auth"
import styles from "./hero.module.css"

const Hero = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()

    const handleBooking = () => {
        if (isAuthenticated) {
            // Sudah login → langsung ke dashboard pelanggan
            router.push('/dashboard')
        } else {
            // Belum login → ke halaman login dulu
            router.push('/auth/login')
        }
    }

    const handleOwnerRegister = () => {
        if (isAuthenticated && user?.role === 'owner') {
            // Sudah login sebagai owner → ke dashboard owner
            router.push('/dashboard')
        } else if (isAuthenticated && user?.role === 'customer') {
            // Sudah login sebagai customer → arahkan ke register owner
            router.push('/auth/register')
        } else {
            // Belum login → ke register (untuk barber/owner)
            router.push('/auth/register')
        }
    }

    return (
        <section className={styles.hero}>

          <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={handleBooking}>
                Booking Sekarang
              </button>
              <div className={styles.bgContent} onClick={handleOwnerRegister}>
                Untuk Barber &amp; Barbershop
              </div>
            </div>

          <div className={styles.imageBackground}>
            <img src="/bgHero.jpeg" alt="barber" />
          </div>
        </section>
    )
}

export default Hero;