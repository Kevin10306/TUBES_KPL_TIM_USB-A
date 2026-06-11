import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import { getSessionUser } from "@/utils/authSession";
import styles from "./Dashboard.module.css";

type ScheduleItem = {
  id: string;
  barbershopName: string;
  jadwal: string;
  service?: string;
  total?: number;
};

type BarbershopItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
};

const Dashboard = () => {
  const router = useRouter();
  const [barbershops, setBarbershops] = useState<BarbershopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const loadSchedules = useCallback(async () => {
    const user = getSessionUser();
    if (!user?.id) {
      setSchedule([]);
      setScheduleLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schedules?userId=${user.id}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message ?? "Gagal mengambil jadwal");
      }
      const data = await response.json();
      setSchedule(data.schedule ?? []);
    } catch (err) {
      console.error("Error fetch jadwal:", err);
      setSchedule([]);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchBarbershops = async () => {
      try {
        const response = await fetch("/api/barbershops");
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message ?? "Gagal mengambil data");
        }
        const data = await response.json();
        setBarbershops(data.barbershops ?? data.data ?? []);
      } catch (err) {
        console.error("Error fetch data:", err);
        setError(
          err instanceof Error ? err.message : "Data barbershop gagal dimuat"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBarbershops();
  }, []);

  useEffect(() => {
    loadSchedules();
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
      <title>Dashboard | Cukurin</title>
      <main className={styles.dashboard}>
        <SideBar />

        <div className={styles.header}>
          <h1>Cukurin | Mitra barber terpercaya</h1>
          <p>Kelola antrean barber dengan efisien</p>
        </div>

        <div className={styles.content}>
          <h3 className={styles.subTitle}>Jadwal cukur :</h3>

          <div className={styles.scheduleList}>
            {scheduleLoading ? (
              <p className={styles.emptyState}>Memuat jadwal...</p>
            ) : schedule.length === 0 ? (
              <p className={styles.emptyState}>
                Tidak ada jadwal cukur. Pesan sekarang di barbershop terdekat!
              </p>
            ) : (
              schedule.map((jadwal) => (
                <div key={jadwal.id} className={styles.scheduleItem}>
                  <div>
                    <p>{jadwal.barbershopName}</p>
                    {jadwal.service && (
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
          <h3 className={styles.subTitle}>Barbershop terdekat</h3>

          <div className={styles.barberList}>
            {loading ? (
              <p className={styles.emptyState}>Memuat data...</p>
            ) : error ? (
              <p className={styles.errorState}>{error}</p>
            ) : barbershops.length === 0 ? (
              <p className={styles.emptyState}>Tidak ada data barbershop</p>
            ) : (
              barbershops.map((barbershop) => (
                <article
                  key={barbershop.id}
                  className={styles.barberCard}
                  onClick={() =>
                    router.push(`/barber/detail?id=${barbershop.id}`)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(`/barber/detail?id=${barbershop.id}`)
                  }
                >
                  <img
                    src={barbershop.image}
                    alt={barbershop.name}
                    className={styles.barberImage}
                  />

                  <div className={styles.barberInfo}>
                    <h3>{barbershop.name}</h3>
                    <p className={styles.barberDesc}>{barbershop.description}</p>
                    <p>⭐ {barbershop.rating}</p>
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
