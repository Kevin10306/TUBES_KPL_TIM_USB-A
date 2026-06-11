import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import { supabaseClient } from "@/lib/supabase";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const router = useRouter();
    const [barbershops, setBarbershops] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<any[]>([]);

    useEffect(() => {
        const fetchBarbershops = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('barbershops')
                    .select('*');
                
                if (error) {
                    throw error;
                }
                
                setBarbershops(data || []);
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
        const fetchBookings = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('bookings')
                    .select(`
                        id,
                        booking_date,
                        booking_time,
                        services ( service_name ),
                        barbers (
                            barbershops ( name )
                        )
                    `);
                
                if (error) {
                    throw error;
                }
                
                setSchedule(data || []);
            } catch (error) {
                console.error("Error fetch data:", error);
                setError("Data jadwal gagal dimuat");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
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
                        Jadwal cukur :
                    </h3>

                    <div className={styles.scheduleList}>
                        {schedule.length === 0 ? (
                            <p>Tidak ada jadwal cukur</p>
                        ) : (
                            schedule.map((jadwal: any) => (
                                <div key={jadwal.id} className={styles.scheduleItem}>
                                    <div>
                                        <p>{jadwal.barbers?.barbershops?.name || 'Nama Barbershop'}</p>
                                        {jadwal.services?.service_name && (
                                            <p className={styles.scheduleService}>{jadwal.services.service_name}</p>
                                        )}
                                    </div>
                                    <p>{jadwal.booking_date} - {jadwal.booking_time}</p>
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
                                    onClick={() => router.push(`/barber/detail?id=${barbershop.id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && router.push(`/barber/detail?id=${barbershop.id}`)}
                                >

                                    <img
                                        src={barbershop.image_url || "/placeholder-barber.jpg"}
                                        alt={barbershop.name}
                                        className={styles.barberImage}
                                    />

                                    <div className={styles.barberInfo}>

                                        <h3>{barbershop.name}</h3>

                                        <p className={styles.barberDesc}>
                                            {barbershop.address}
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
