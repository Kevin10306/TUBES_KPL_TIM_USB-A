import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import { getSavedSchedules, confirmSchedule, deleteSchedule, SavedSchedule } from "@/utils/scheduleStorage";
import { useAuth } from "@/utils/auth";
import { BARBER_DETAIL } from "@/data/mockBarber";
import styles from "./Dashboard.module.css";

type ApiSchedule = {
    id: string;
    barbershopName: string;
    jadwal: string;
};

const Dashboard = () => {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [barbershops, setBarbershops] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<(ApiSchedule | SavedSchedule)[]>([]);
    const [servicePopup, setServicePopup] = useState<{ name: string; price: number }[] | null>(null);
    const [historySearch, setHistorySearch] = useState('');
    const [confirmDeleteSchedule, setConfirmDeleteSchedule] = useState<SavedSchedule | null>(null);

    const loadSchedules = useCallback(() => {
        const saved = getSavedSchedules();
        setSchedule(saved);
    }, []);

    const handleConfirm = (id: string) => {
        const updated = confirmSchedule(id);
        setSchedule(updated);
    };

    // Parse string service -> cocokkan dengan katalog
    const handleServiceClick = (serviceStr: string) => {
        const parts = serviceStr.split(',').map(s => s.trim().toLowerCase());
        const matched = parts.map(part => {
            const found = BARBER_DETAIL.services.find(
                s => s.name.toLowerCase() === part
            );
            return found
                ? { name: found.name, price: found.price }
                : { name: part.charAt(0).toUpperCase() + part.slice(1), price: -1 };
        });
        setServicePopup(matched);
    };

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

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

    if (isLoading || !isAuthenticated) return null;

    const renderOwnerDashboard = () => {
        // Pisahkan pesanan menunggu & dikonfirmasi (hanya dari localStorage)
        const savedOnly = schedule.filter(s => 'status' in s) as SavedSchedule[];
        const pending = savedOnly.filter(s => (s.status || 'menunggu') === 'menunggu');
        const confirmed = savedOnly.filter(s => s.status === 'dikonfirmasi');

        // Statistik real: hitung dari pesanan dikonfirmasi
        const totalAntrean = confirmed.length;
        const totalPendapatan = confirmed.reduce((sum, s) => sum + (s.total || 0), 0);

        return (
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Dashboard Pemilik Barber</h1>
                    <p>Selamat datang, {user?.name}. Kelola antrean barbershop Anda hari ini.</p>
                </div>

                {/* ── Statistik Cepat ── */}
                <h3 className={styles.subTitle} style={{ marginTop: '30px' }}>Statistik Cepat</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245,200,66,0.12)', color: 'var(--accent-gold)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Total Pendapatan Hari Ini</p>
                            <h2 className={styles.statValue}>
                                Rp {totalPendapatan.toLocaleString('id-ID')}
                            </h2>
                            <p className={styles.statSub}>{totalAntrean} pesanan dikonfirmasi</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Total Antrean Terkonfirmasi</p>
                            <h2 className={styles.statValue}>{totalAntrean} Orang</h2>
                            <p className={styles.statSub}>{pending.length} masih menunggu</p>
                        </div>
                    </div>
                </div>

                {/* ── Pesanan Masuk (hanya Menunggu) ── */}
                <h3 className={styles.subTitle}>Pesanan Masuk Terbaru :</h3>
                <div className={styles.scheduleList}>
                    {pending.length === 0 ? (
                        <div className={styles.emptyOrders}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <p>Tidak ada pesanan baru yang menunggu konfirmasi.</p>
                        </div>
                    ) : (
                        pending.map((jadwal) => (
                            <div key={jadwal.id} className={`${styles.scheduleCard} ${styles.scheduleCardPending}`}>
                                <div className={styles.scheduleCardTop}>
                                    <div>
                                        <p className={styles.scheduleCardName}>{jadwal.barbershopName}</p>
                                        {jadwal.service && (
                                            <p
                                                className={styles.scheduleCardServiceClickable}
                                                onClick={() => handleServiceClick(jadwal.service)}
                                                title="Klik untuk lihat detail layanan"
                                            >
                                                ✂️ {jadwal.service}
                                            </p>
                                        )}
                                    </div>
                                    <p className={styles.scheduleCardDate}>{jadwal.jadwal}</p>
                                </div>
                                <div className={styles.scheduleCardBottom}>
                                    <span className={styles.badgePending}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        Menunggu
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {jadwal.total > 0 && (
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                Rp {jadwal.total.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                        <button
                                            className={styles.btnKonfirmasi}
                                            onClick={() => handleConfirm(jadwal.id)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Konfirmasi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ── Histori Pesanan (Dikonfirmasi) ── */}
                {confirmed.length > 0 && (() => {
                    const q = historySearch.trim().toLowerCase();
                    const filtered = confirmed.filter(j =>
                        j.barbershopName.toLowerCase().includes(q) ||
                        (j.service || '').toLowerCase().includes(q) ||
                        j.jadwal.toLowerCase().includes(q)
                    );
                    return (
                        <div style={{ marginTop: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <h3 className={styles.subTitle} style={{ margin: 0 }}>
                                    Histori Pesanan
                                </h3>
                                <span className={styles.badgeConfirmed}>
                                    {confirmed.length} selesai
                                </span>
                            </div>

                            {/* Search bar histori */}
                            <div className={styles.historySearchWrap}>
                                <svg className={styles.historySearchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    className={styles.historySearchInput}
                                    placeholder="Cari nama barbershop, layanan, atau tanggal..."
                                    value={historySearch}
                                    onChange={e => setHistorySearch(e.target.value)}
                                />
                                {historySearch && (
                                    <button
                                        className={styles.historySearchClear}
                                        onClick={() => setHistorySearch('')}
                                        aria-label="Hapus pencarian"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className={styles.historyList}>
                                {filtered.length === 0 ? (
                                    <div className={styles.emptyOrders}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <p>Tidak ada hasil untuk <strong>&ldquo;{historySearch}&rdquo;</strong></p>
                                    </div>
                                ) : (
                                    filtered.map((jadwal) => (
                                        <div key={jadwal.id} className={styles.historyItem}>
                                            <div className={styles.historyCheckIcon}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p className={styles.historyName}>{jadwal.barbershopName}</p>
                                                {jadwal.service && (
                                                    <p
                                                        className={styles.historyServiceClickable}
                                                        onClick={() => handleServiceClick(jadwal.service)}
                                                        title="Klik untuk lihat detail layanan"
                                                    >
                                                        ✂️ {jadwal.service}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p className={styles.historyDate}>{jadwal.jadwal}</p>
                                                {jadwal.total > 0 && (
                                                    <p className={styles.historyTotal}>Rp {jadwal.total.toLocaleString('id-ID')}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        );
    };



    const renderCustomerDashboard = () => (
        <>
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
                        <div className={styles.emptyOrders}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <p>Tidak ada jadwal cukur.</p>
                        </div>
                    ) : (
                        schedule.map((jadwal) => {
                            const saved = 'status' in jadwal ? jadwal as SavedSchedule : null;
                            const status = saved?.status || 'menunggu';
                            const isConfirmed = status === 'dikonfirmasi';
                            return (
                                <div
                                    key={jadwal.id}
                                    className={`${styles.scheduleCard} ${isConfirmed ? styles.scheduleCardConfirmed : styles.scheduleCardPending}`}
                                >
                                    <div className={styles.scheduleCardTop}>
                                        <div style={{ flex: 1 }}>
                                            <p className={styles.scheduleCardName}>{jadwal.barbershopName}</p>
                                            {"service" in jadwal && jadwal.service && (
                                                <p
                                                    className={styles.scheduleCardServiceClickable}
                                                    onClick={() => handleServiceClick((jadwal as SavedSchedule).service)}
                                                    title="Klik untuk lihat detail layanan"
                                                >
                                                    ✂️ {(jadwal as SavedSchedule).service}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <p className={styles.scheduleCardDate}>{jadwal.jadwal}</p>
                                            {/* Tombol hapus — hanya jadwal dari localStorage */}
                                            {saved && (
                                                <button
                                                    className={styles.deleteScheduleBtn}
                                                    title="Hapus jadwal"
                                                    onClick={() => setConfirmDeleteSchedule(saved)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                        <path d="M10 11v6" /><path d="M14 11v6" />
                                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                    </svg>
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.scheduleCardBottom}>
                                        {isConfirmed ? (
                                            <span className={styles.badgeConfirmed}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                Dikonfirmasi
                                            </span>
                                        ) : (
                                            <span className={styles.badgePending}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                Menunggu Konfirmasi
                                            </span>
                                        )}
                                        {saved?.total && saved.total > 0 && (
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                Rp {saved.total.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
        </>
    );

    return (
        <>
            <><title>Dashboard | Cukurin</title></>
            <main className={styles.dashboard}>

                <SideBar />

                <div style={{ flex: 1 }}>
                    {user?.role === 'owner' ? renderOwnerDashboard() : renderCustomerDashboard()}
                </div>

            </main>

            {/* ── Popup Detail Service ── */}
            {servicePopup && (
                <div className={styles.serviceOverlay} onClick={() => setServicePopup(null)}>
                    <div className={styles.servicePopup} onClick={e => e.stopPropagation()}>
                        <div className={styles.servicePopupHeader}>
                            <h3 className={styles.servicePopupTitle}>Detail Layanan</h3>
                            <button
                                className={styles.servicePopupClose}
                                onClick={() => setServicePopup(null)}
                                aria-label="Tutup"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.servicePopupList}>
                            {servicePopup.map((svc, i) => (
                                <div key={i} className={styles.servicePopupItem}>
                                    <div className={styles.servicePopupIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14.5 10.5l-9 9a2.121 2.121 0 0 1-3-3l9-9" />
                                            <path d="M16 6l2 2" />
                                            <path d="M19.5 2.5l2 2a1 1 0 0 1 0 1.4l-2.5 2.5-3.5-3.5 2.5-2.5a1 1 0 0 1 1.5 0z" />
                                        </svg>
                                    </div>
                                    <span className={styles.servicePopupName}>{svc.name}</span>
                                    <span className={styles.servicePopupPrice}>
                                        {svc.price >= 0
                                            ? `Rp ${svc.price.toLocaleString('id-ID')}`
                                            : '—'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.servicePopupTotal}>
                            <span>Total</span>
                            <strong>
                                Rp {servicePopup
                                    .filter(s => s.price >= 0)
                                    .reduce((sum, s) => sum + s.price, 0)
                                    .toLocaleString('id-ID')}
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Konfirmasi Hapus Jadwal ── */}
            {confirmDeleteSchedule && (
                <div className={styles.modalOverlay} onClick={() => setConfirmDeleteSchedule(null)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </div>
                        <h3 className={styles.modalTitle}>Hapus Jadwal?</h3>
                        <p className={styles.modalDesc}>
                            Jadwal <strong>{confirmDeleteSchedule.barbershopName}</strong> pada{' '}
                            <strong>{confirmDeleteSchedule.jadwal}</strong> akan dihapus permanen.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalBtnCancel}
                                onClick={() => setConfirmDeleteSchedule(null)}
                            >
                                Batal
                            </button>
                            <button
                                className={styles.modalBtnConfirm}
                                onClick={() => {
                                    const updated = deleteSchedule(confirmDeleteSchedule.id);
                                    setSchedule(updated);
                                    setConfirmDeleteSchedule(null);
                                }}
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

};

export default Dashboard;
