import Manfaat from "@/components/Manfaat/manfaat";
import Hero from "@/components/Hero/hero";
import { GetServerSideProps } from "next";
import { Barbershop } from "@/models/Barbershop";
import styles from "@/styles/Home.module.css";

type BarbershopItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
};

type Props = {
  barbershops: BarbershopItem[];
};

export default function Home({ barbershops = [] }: Props) {
  return (
    <>
      <title>Cukurin | Antrean cukur berbasis web</title>
      <div className="bg-layer"></div>
      <main>
        <Hero />

        <section className="about">
          <h1 className="about-title">Tentang Cukurin</h1>
          <p className="about-description">
            Cukurin merupakan sebuah aplikasi web yang memudahkan kamu untuk
            melakukan pendaftaran antrean barbershop favoritmu.
            <br />
            <br />
            Dengan Cukurin, kamu tidak perlu lagi menunggu lama di barbershop.
            Kamu bisa memesan tempat dari mana saja dan kapan saja.
          </p>
        </section>

        <Manfaat />

        {barbershops.length > 0 && (
          <section className={styles.barbershopSection}>
            <h2 className={styles.sectionHeading}>Barbershop Mitra</h2>
            <div className={styles.barbershopGrid}>
              {barbershops.map((shop) => (
                <article key={shop.id} className={styles.barbershopCard}>
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className={styles.barbershopImage}
                  />
                  <div className={styles.barbershopInfo}>
                    <h3>{shop.name}</h3>
                    <p>{shop.description}</p>
                    <span className={styles.barbershopRating}>
                      ⭐ {shop.rating}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="footer-section">
          <div className="footer-description">
            <p>© 2026 Cukurin. All rights reserved.</p>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('barbershops')
      .select('*');

    if (error) throw error;

    return {
      props: {
        barbershop: data || [],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        barbershop: [],
      },
    };
  }
};
