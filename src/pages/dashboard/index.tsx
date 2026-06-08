import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import { getSavedSchedules, SavedSchedule } from "@/utils/scheduleStorage";
import styles from "./Dashboard.module.css";

type ApiSchedule = {
    id: string;
    barbershopName: string;
    jadwal: string;
};

const Dashboard = () => {
    const router = useRouter();
    const [barbershops, setBarbershops] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<(ApiSchedule | SavedSchedule)[]>([]);

    const loadSchedules = useCallback(() => {
        const saved = getSavedSchedules();
        setSchedule(saved);
    }, []);

    useEffect(() => {
        const fetchBarbershops = async () => {
            try {
                const response = await fetch("/api/barbershops");
                if (!response.ok) {
                    throw new Error("Gagal mengambil data");
                }
                const data = await response.json();
                setBarbershops(data.barbershops ?? data.data ?? []);
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
        loadSchedules();

        const fetchApiSchedule = async () => {
            try {
                const response = await fetch("/api/schedules");
                if (!response.ok) return;
                const data = await response.json();
                const apiList: ApiSchedule[] = data.schedule ?? [];
                const saved = getSavedSchedules();
                setSchedule([...saved, ...apiList]);
            } catch {
                // tetap tampilkan jadwal dari localStorage
            }
        };
        fetchApiSchedule();
    }, [loadSchedules]);

    useEffect(() => {
        const handleRoute = () => {
            if (router.pathname === "/dashboard") loadSchedules();
        };
        router.events.on("routeChangeComplete", handleRoute);
        return () => router.events.off("routeChangeComplete", handleRoute);
    }, [router, loadSchedules]);

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
                            schedule.map((jadwal) => (
                                <div key={jadwal.id} className={styles.scheduleItem}>
                                    <div>
                                        <p>{jadwal.barbershopName}</p>
                                        {"service" in jadwal && jadwal.service && (
                                            <p className={styles.scheduleService}>{jadwal.service}</p>
                                        )}
                                    </div>
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
                                    onClick={() => router.push("/barber/detail")}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && router.push("/barber/detail")}
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
