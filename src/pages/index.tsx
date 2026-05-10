import Manfaat from "@/components/Manfaat/manfaat";
import {useRouter} from "next/router"
import Hero from "@/components/Hero/hero";


export default function Home() {

  return (
    <>
    <title>Cukurin | Antrean cukur berbasis web </title>
    <div 
    className="bg-layer">
    </div>
      <main>
        <Hero />
        
        <section className="about">
          <h1 className="about-title">Tentang Cukurin</h1>
          <p className="about-description">Cukurin merupakan sebuah aplikasi web
            yang memudahkan kamu untuk melakukan pendaftaran antrean barbershop favoritmu.
            <br />
            <br />
            Dengan Cukurin, kamu tidak perlu lagi menunggu lama di barbershop. Kamu bisa 
            memesan tempat dari mana saja dan kapan saja.
          </p>
        </section>

        <Manfaat />

        <section className="footer-section">
          <div className="footer-description">
            <p>© 2026 Cukurin. All rights reserved.</p>
          </div>
        </section>
      </main>
    </>
  )
}
