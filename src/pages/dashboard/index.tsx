import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import NavbarDashboard from "@/components/dashboard/navbarDashboard";

interface Barbershop{
    id: number;
    name: string;
    rating: number;
    image: string;
    description: string;
}

const Dashboard = () => {
    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBarbershops = async () => {
            try {
                const response = await fetch('/api/barbershops');
                const data = await response.json();

                setBarbershops(data.barbershops);
            } catch (error) {
                console.log("gagal mengambil data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBarbershops();
    }, []);

    
    return (
        <>
        <NavbarDashboard/>
        <main className={styles.dashboard}>
            <div className={styles.header}>
               <h1>Cukurin | Mitra barber terpercaya</h1>
                <p>Kelola antrean barber dengan efisien</p>
            </div>

            <div className={styles.content}>
               <h3 className={styles.subTitle}>Jadwal cukur hari ini :</h3>
                    <p className={styles.contentItem}>Tidak ada jadwal cukur hari ini</p>
            </div>

                <input type="text" placeholder="Cari barbershop" className={styles.searchBar}></input>

          <section>
            <h3 className={styles.subTitle}>Barbershop terdekat</h3>
            <div className={styles.barberList}>
                {loading ? (
                    <p>Memuat data...</p>
                ) : (
                    barbershops.map((barbershop) => (
                        <article key={barbershop.id} className={styles.barberCard}>
                            <img src={barbershop.image} alt={barbershop.name} />
                            <div className={styles.barberInfo}>
                                <h3>{barbershop.name}</h3>
                                <p className={styles.barberDesc}>{barbershop.description}</p>
                                <p>{barbershop.rating}</p>
                            </div>
                        </article>
                    ))
                )}
            </div>
          </section>
        </main>
        </>      
    )
}

export default Dashboard;