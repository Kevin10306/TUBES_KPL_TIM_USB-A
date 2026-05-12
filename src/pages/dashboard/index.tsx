import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar/sideBar";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const [barbershops, setBarbershops] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<any[]>([]);

    useEffect(() => {

        const fetchBarbershops = async () => {
            try {
                const response = await fetch("/api/barbershops");
                if (!response.ok) {
                    throw new Error("Gagal mengambil data");
                }
                const data = await response.json();
                setBarbershops(data.barbershops);

            } catch (error) {
                console.error("Error fetch data:", error);
                setError("Data barbershop gagal dimuat");
                
            } finally {
                setLoading(false);
            }
        };
        fetchBarbershops();
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch("/api/schedules");
                if (!response.ok) {
                    throw new Error("Gagal mengambil data");
                }
                const data = await response.json();
                setSchedule(data.schedule);
            } catch (error) {
                console.error("Error fetch data:", error);
                setError("Data jadwal gagal dimuat");
            }
        };
        fetchSchedule();
    }, []);

    return (
        <>
            <><title>Dashboard | Cukurin</title></>
            <main className={styles.dashboard}>
        
        <SideBar />

                <div className={styles.header}>
                    <h1>Cukurin | Mitra barber terpercaya</h1>
                    <p>Kelola antrean barber dengan efisien</p>
                </div>


                <div className={styles.content}>
                    <h3 className={styles.subTitle}>
                        Jadwal cukur hari ini :
                    </h3>

                    <div className={styles.scheduleList}>
                        {schedule.length === 0 ? (
                            <p>Tidak ada jadwal cukur hari ini</p>
                        ) : (
                            schedule.map((jadwal) => (
                                <div key={jadwal.id} className={styles.scheduleItem}>
                                    <p>{jadwal.barbershopName}</p>
                                    <p>{jadwal.jadwal}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Cari barbershop"
                    className={styles.searchBar}
                />

                <section>
                    <h3 className={styles.subTitle}>
                        Barbershop terdekat
                    </h3>

                    <div className={styles.barberList}>

                        {loading ? (
                            <p>Memuat data...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : barbershops.length === 0 ? (
                            <p>Tidak ada data barbershop</p>
                        ) : (
                            barbershops.map((barbershop) => (

                                <article
                                    key={barbershop.id}
                                    className={styles.barberCard}
                                >

                                    <img
                                        src={barbershop.image}
                                        alt={barbershop.name}
                                        className={styles.barberImage}
                                    />

                                    <div className={styles.barberInfo}>

                                        <h3>{barbershop.name}</h3>

                                        <p className={styles.barberDesc}>
                                            {barbershop.description}
                                        </p>

                                        <p>
                                            ⭐ {barbershop.rating}
                                        </p>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

            </main>
        </>
    );
};

export default Dashboard;