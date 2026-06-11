import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import styles from "./detail.module.css";

type Tab = "tentang" | "layanan" | "jadwal" | "review";

type BarbershopDetail = {
  id: string;
  name: string;
  location: string;
  rating: number;
  review_count: number;
  status: string;
  image: string;
  about: string;
  hours: { days: string; time: string }[];
  team: { name: string; role: string; avatar: string }[];
  services: { id: string; slug: string; name: string; price: number }[];
  reviews: { name: string; rating: number; text: string }[];
};

const TABS: { id: Tab; label: string }[] = [
  { id: "tentang", label: "Tentang" },
  { id: "layanan", label: "Layanan" },
  { id: "jadwal", label: "Jadwal" },
  { id: "review", label: "Review" },
];

const TIME_SLOTS = ["08.00", "08.30", "09.00", "09.30", "10.00", "10.30"];

export default function DetailBarber() {
  const router = useRouter();
  const { id } = router.query;
  const [barber, setBarber] = useState<BarbershopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("tentang");
  const [expanded, setExpanded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/barbershops?id=${id}`);
        const json = await res.json();
        if (res.ok) setBarber(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      maps: "Membuka peta lokasi barbershop...",
      chat: "Membuka chat dengan barbershop...",
      share: "Link barbershop berhasil disalin!",
      favorite: favorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit",
    };
    if (action === "favorite") setFavorite(!favorite);
    if (action === "share") navigator.clipboard?.writeText(window.location.href);
    showToast(messages[action]);
  };

  if (loading) {
    return (
      <>
        <SideBar />
        <main className={styles.page}>
          <p className={styles.loadingText}>Memuat detail barbershop...</p>
        </main>
      </>
    );
  }

  if (!barber) {
    return (
      <>
        <SideBar />
        <main className={styles.page}>
          <p className={styles.loadingText}>Barbershop tidak ditemukan.</p>
        </main>
      </>
    );
  }

  const shortAbout =
    barber.about.slice(0, 120) + (barber.about.length > 120 && !expanded ? "..." : "");

  return (
    <>
      <title>Detail Barber | Cukurin</title>
      <SideBar />
      <main className={styles.page}>
        <img src={barber.image} alt={barber.name} className={styles.heroImage} />

        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.statusBadge}>{barber.status}</span>
            <h1 className={styles.title}>{barber.name}</h1>
            <p className={styles.location}>{barber.location}</p>
            <div className={styles.rating}>
              <span>⭐ {barber.rating}</span>
              <span>({barber.review_count})</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => handleAction("maps")}>
              🗺️ Maps
            </button>
            <button className={styles.actionBtn} onClick={() => handleAction("chat")}>
              💬 Chat
            </button>
            <button className={styles.actionBtn} onClick={() => handleAction("share")}>
              ↗ Share
            </button>
            <button
              className={`${styles.actionBtn} ${favorite ? styles.actionBtnActive : ""}`}
              onClick={() => handleAction("favorite")}
            >
              {favorite ? "❤️" : "🤍"} Favorite
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === "tentang" && (
            <>
              <p className={styles.aboutText}>
                {expanded ? barber.about : shortAbout}
                {!expanded && barber.about.length > 120 && (
                  <button className={styles.readMore} onClick={() => setExpanded(true)}>
                    {" "}Read more...
                  </button>
                )}
              </p>

              <h3 className={styles.sectionTitle}>Jam Buka</h3>
              <div className={styles.hoursList}>
                {barber.hours.map((h) => (
                  <div key={h.days} className={styles.hourRow}>
                    <span>{h.days}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>

              <h3 className={styles.sectionTitle}>Tim</h3>
              <div className={styles.teamGrid}>
                {barber.team.map((member) => (
                  <div key={member.name} className={styles.teamCard}>
                    <img src={member.avatar} alt={member.name} className={styles.teamAvatar} />
                    <p className={styles.teamName}>{member.name}</p>
                    <p className={styles.teamRole}>{member.role}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "layanan" && (
            <div className={styles.serviceList}>
              {barber.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <span className={styles.serviceName}>{service.name}</span>
                  <span className={styles.servicePrice}>
                    {service.price.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "jadwal" && (
            <>
              <p className={styles.scheduleDate}>
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <h3 className={styles.sectionTitle}>Waktu</h3>
              <div className={styles.timeSlots}>
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    className={`${styles.timeSlot} ${selectedSlot === slot ? styles.timeSlotActive : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <h3 className={styles.sectionTitle}>Barber Tersedia</h3>
              <div className={styles.barberScheduleList}>
                {barber.team.slice(0, 3).map((b) => (
                  <div key={b.name} className={styles.barberScheduleItem}>
                    <img src={b.avatar} alt={b.name} className={styles.barberScheduleAvatar} />
                    <div>
                      <p className={styles.barberScheduleName}>{b.name}</p>
                      <p className={styles.barberScheduleService}>{b.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "review" && (
            <div className={styles.reviewList}>
              {barber.reviews.map((review, i) => (
                <div key={`${review.name}-${i}`} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewName}>{review.name}</span>
                    <span className={styles.reviewRating}>({review.rating})</span>
                  </div>
                  <p className={styles.reviewText}>{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.orderBtn}
            onClick={() => router.push(`/barber/booking?barbershopId=${barber.id}`)}
          >
            Pesan Sekarang
          </button>
        </div>

        {toast && <div className={styles.toast}>{toast}</div>}
      </main>
    </>
  );
}
