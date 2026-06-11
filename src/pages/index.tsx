import Manfaat from "@/components/Manfaat/manfaat";
import Hero from "@/components/Hero/hero";
import { GetServerSideProps } from "next";
import { supabaseClient } from "@/lib/supabase";

type Props = {
  barbershop: {
    id: string;
    name: string;
    address: string;
    image_url: string;
    rating: number;
  }[];
};

export default function Home({ barbershop  = [] }: Props) {
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

        {/* Data barbershop */}
        <section>
          {barbershop.map((shop) => (
            <div key={shop.id}>
              <img src={shop.image_url || "/placeholder-barber.jpg"} alt={shop.name} width={50} />
              <h2>{shop.name}</h2>
              <p>{shop.address}</p>
              <p>Rating: {shop.rating}</p>
            </div>
          ))}
        </section>

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