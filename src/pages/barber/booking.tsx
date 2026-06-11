import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import { formatRupiah } from "@/data/mockBarber";
import { getSessionUser } from "@/utils/authSession";
import styles from "./booking.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const BOOKING_TIMES = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:30", "13:00",
  "15:30", "16:00", "17:00", "17:30",
];

type ServiceItem = { id: string; slug: string; name: string; price: number; is_extra?: boolean };

type BarbershopInfo = {
  id: string;
  name: string;
  location: string;
  rating: number;
  review_count: number;
  image: string;
};

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean; disabled: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false, disabled: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isPast = new Date(year, month, d) < new Date(new Date().setHours(0, 0, 0, 0));
    cells.push({ day: d, current: true, disabled: isPast });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, current: false, disabled: true });
  }
  return cells;
}

function padTime(t: string) {
  return t.length === 5 ? `${t}:00` : t;
}

export default function BookingPage() {
  const router = useRouter();
  const { barbershopId } = router.query;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [extras, setExtras] = useState<string[]>([]);
  const [couponInput, setCouponInput] = useState("DISC20PERCEN");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState("");

  const [barbershop, setBarbershop] = useState<BarbershopInfo | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [extraServices, setExtraServices] = useState<ServiceItem[]>([]);

  const calendar = useMemo(() => buildCalendar(year, month), [year, month]);

  useEffect(() => {
    if (!barbershopId || typeof barbershopId !== "string") return;

    const load = async () => {
      try {
        const res = await fetch(`/api/barbershops?id=${barbershopId}`);
        const json = await res.json();
        if (res.ok && json.data) {
          const d = json.data;
          setBarbershop({
            id: d.id,
            name: d.name,
            location: d.location,
            rating: d.rating,
            review_count: d.review_count,
            image: d.image,
          });
          const mainServices: ServiceItem[] = d.services ?? [];
          setServices(mainServices);
          if (mainServices.length > 0) setSelectedService(mainServices[0].slug);
          setExtraServices(d.extra_services ?? []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [barbershopId]);

  const service = services.find((s) => s.slug === selectedService) ?? services[0];
  const extraTotal = extraServices
    .filter((e) => extras.includes(e.slug))
    .reduce((sum, e) => sum + e.price, 0);
  const subtotal = (service?.price ?? 0) + extraTotal;
  const total = subtotal - discount;

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bookingDate = new Date(year, month, selectedDay);
  const selectedDateLabel = `${dayNames[bookingDate.getDay()]}, ${selectedDay} ${MONTHS[month].slice(0, 3)} - ${selectedTime}`;
  const bookingDateISO = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const toggleExtra = (slug: string) => {
    setExtras((prev) =>
      prev.includes(slug) ? prev.filter((e) => e !== slug) : [...prev, slug]
    );
  };

  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponApplied(true);
        setDiscount(data.discount);
        setToast(`Kupon aktif! Hemat ${formatRupiah(data.discount)} dari transaksi ini`);
      } else {
        setCouponApplied(false);
        setDiscount(0);
        setToast(data.message ?? "Kupon tidak valid");
      }
    } catch {
      setToast("Gagal memvalidasi kupon");
    }
    setTimeout(() => setToast(""), 2500);
  };

  const handleConfirm = () => {
    if (!selectedDay || !selectedTime || !service) return;
    setStep(2);
  };

  const handlePay = async () => {
    if (!barbershop || !service) return;

    const user = getSessionUser();
    if (!user?.id) {
      setToast("Silakan login terlebih dahulu");
      setTimeout(() => router.push("/auth/login"), 1500);
      return;
    }

    setPaying(true);
    const extraLabels = extraServices
      .filter((e) => extras.includes(e.slug))
      .map((e) => e.name)
      .join(", ");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          barbershop_id: barbershop.id,
          barbershop_name: barbershop.name,
          booking_date: bookingDateISO,
          booking_time: padTime(selectedTime),
          jadwal: `${selectedDay} ${MONTHS[month]} ${year} - ${selectedTime}`,
          service_name: service.name,
          extra_services: extraLabels,
          subtotal,
          discount,
          coupon_code: couponApplied ? couponInput : undefined,
          total,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Pembayaran gagal");

      setPaymentSuccess(true);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Pembayaran gagal");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setPaying(false);
    }
  };

  const handleDownload = () => {
    if (!barbershop || !service) return;
    const content = [
      "INVOICE - CUKURIN",
      "Pembayaran Berhasil",
      "",
      `Barbershop: ${barbershop.name}`,
      `Tanggal: ${selectedDateLabel}`,
      `Layanan: ${service.name}`,
      ...extraServices.filter((e) => extras.includes(e.slug) && e.price > 0).map((e) => `+ ${e.name}: ${formatRupiah(e.price)}`),
      couponApplied ? `Diskon: -${formatRupiah(discount)}` : "",
      `Total: ${formatRupiah(total)}`,
    ].filter(Boolean).join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice-cukurin.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!barbershop) {
    return (
      <>
        <SideBar />
        <main className={styles.page}>
          <p className={styles.loadingText}>Memuat data pemesanan...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <title>Pemesanan | Cukurin</title>
      <SideBar />
      <main className={styles.page}>
        <h1 className={styles.pageTitle}>Pemesanan</h1>

        <div className={styles.steps}>
          <span className={`${styles.step} ${step >= 1 ? styles.stepDone : ""}`}>
            1. Tanggal {step > 1 ? "✓" : ""}
          </span>
          <span className={styles.stepDivider}>→</span>
          <span className={`${styles.step} ${step >= 1 ? styles.stepDone : ""}`}>
            2. Layanan {step > 1 ? "✓" : ""}
          </span>
          <span className={styles.stepDivider}>→</span>
          <span className={`${styles.step} ${step === 2 ? styles.stepActive : ""}`}>
            3. Konfirmasi {step === 2 ? "✓" : ""}
          </span>
        </div>

        {step === 1 && (
          <div className={styles.layout}>
            <div className={styles.mainPanel}>
              <h2 className={styles.panelTitle}>Pilih Tanggal</h2>
              <div className={styles.calendarHeader}>
                <span className={styles.calendarMonth}>
                  {MONTHS[month]} {year}
                </span>
                <div className={styles.calendarNav}>
                  <button className={styles.calendarNavBtn} onClick={prevMonth}>‹</button>
                  <button className={styles.calendarNavBtn} onClick={nextMonth}>›</button>
                </div>
              </div>

              <div className={styles.calendarGrid}>
                {DAYS.map((d) => (
                  <div key={d} className={styles.dayLabel}>{d}</div>
                ))}
                {calendar.map((cell, i) => (
                  <button
                    key={i}
                    disabled={cell.disabled}
                    className={[
                      styles.dayCell,
                      !cell.current ? styles.dayOther : "",
                      cell.disabled ? styles.dayDisabled : "",
                      cell.current && cell.day === selectedDay ? styles.daySelected : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => cell.current && !cell.disabled && setSelectedDay(cell.day)}
                  >
                    {String(cell.day).padStart(2, "0")}
                  </button>
                ))}
              </div>

              <h2 className={styles.panelTitle}>Choose Service</h2>
              <div className={styles.serviceGrid}>
                {services.map((s) => (
                  <button
                    key={s.slug}
                    className={`${styles.serviceChip} ${selectedService === s.slug ? styles.serviceChipActive : ""}`}
                    onClick={() => setSelectedService(s.slug)}
                  >
                    <p className={styles.serviceChipName}>{s.name}</p>
                    <p className={styles.serviceChipPrice}>{s.price.toLocaleString("id-ID")}</p>
                  </button>
                ))}
              </div>

              <h2 className={styles.panelTitle}>Available time</h2>
              <div className={styles.timeGrid}>
                {BOOKING_TIMES.map((t) => (
                  <button
                    key={t}
                    className={`${styles.timeChip} ${selectedTime === t ? styles.timeChipActive : ""}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sidePanel}>
              <h2 className={styles.panelTitle}>Payment summary</h2>
              {service && (
                <>
                  <div className={styles.summaryRow}>
                    <span>{service.name}</span>
                    <span>{formatRupiah(service.price)}</span>
                  </div>
                  {extraServices.filter((e) => extras.includes(e.slug) && e.price > 0).map((e) => (
                    <div key={e.slug} className={styles.summaryRow}>
                      <span>{e.name}</span>
                      <span>{formatRupiah(e.price)}</span>
                    </div>
                  ))}
                  <div className={styles.summaryRow}>
                    <span>Service fee</span>
                    <span>{formatRupiah(0)}</span>
                  </div>
                  <div className={styles.summaryRowTotal}>
                    <span>Total</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                </>
              )}
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                Konfirmasi
              </button>
            </div>
          </div>
        )}

        {step === 2 && service && (
          <div className={styles.layout}>
            <div className={styles.mainPanel}>
              <div className={styles.barberCard}>
                <img
                  src={barbershop.image}
                  alt={barbershop.name}
                  className={styles.barberCardImage}
                />
                <div>
                  <p className={styles.barberCardName}>{barbershop.name}</p>
                  <p className={styles.barberCardLocation}>{barbershop.location}</p>
                  <p className={styles.barberCardRating}>
                    ⭐ {barbershop.rating} ({barbershop.review_count})
                  </p>
                </div>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Tanggal & Waktu</p>
                <p className={styles.detailValue}>{selectedDateLabel}</p>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Layanan</p>
                <p className={styles.detailValue}>{service.name}</p>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Tambahan</p>
                <div className={styles.extraList}>
                  {extraServices.map((e) => (
                    <label key={e.slug} className={styles.extraItem}>
                      <input
                        type="checkbox"
                        checked={extras.includes(e.slug)}
                        onChange={() => toggleExtra(e.slug)}
                      />
                      {e.name}
                      {e.price > 0 && ` (+${formatRupiah(e.price)})`}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Kupon</p>
                <div className={styles.couponBox}>
                  <input
                    className={styles.couponInput}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Masukkan kode kupon"
                  />
                  <button className={styles.couponBtn} onClick={applyCoupon}>
                    Konfirmasi
                  </button>
                </div>
                {couponApplied && (
                  <div className={styles.couponSuccess}>
                    ✅ Kupon aktif! Hemat {formatRupiah(discount)} dari transaksi ini
                  </div>
                )}
              </div>

              <div className={styles.warningBox}>
                ⚠️ Pesanan akan otomatis dibatalkan jika tidak hadir dalam 15 menit dari jadwal.
              </div>
            </div>

            <div className={styles.sidePanel}>
              <h2 className={styles.panelTitle}>Payment summary</h2>
              <div className={styles.summaryRow}>
                <span>{service.name}</span>
                <span>{formatRupiah(service.price)}</span>
              </div>
              {extraServices.filter((e) => extras.includes(e.slug) && e.price > 0).map((e) => (
                <div key={e.slug} className={styles.summaryRow}>
                  <span>{e.name}</span>
                  <span>{formatRupiah(e.price)}</span>
                </div>
              ))}
              {couponApplied && (
                <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                  <span>🏷️ Diskon Kupon</span>
                  <span>- {formatRupiah(discount)}</span>
                </div>
              )}
              <div className={styles.summaryRowTotal}>
                <span>Total Harga</span>
                <span>{formatRupiah(total)}</span>
              </div>

              <div className={styles.paySection}>
                <p className={styles.payLabel}>Total yang dibayar</p>
                <p className={styles.payAmount}>{formatRupiah(total)}</p>
                <button
                  className={styles.payBtn}
                  onClick={handlePay}
                  disabled={paying}
                >
                  {paying ? "Memproses pembayaran..." : "Bayar Sekarang"}
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentSuccess && (
          <div className={styles.successOverlay}>
            <div className={styles.successModal}>
              <div className={styles.successIcon}>✅</div>
              <h2 className={styles.successTitle}>Pembayaran Berhasil</h2>
              <p className={styles.successSubtitle}>
                Jadwal cukur Anda tersimpan. Lihat di Dashboard → Jadwal Cukur.
              </p>
              <div className={styles.reminderBox}>
                🔔 Pengingat akan dikirim ke WhatsApp 1 jam sebelum jadwal.
              </div>

              <div className={styles.invoiceCard}>
                <p className={styles.invoiceBarber}>{barbershop.name}</p>
                <p className={styles.invoiceDate}>
                  {dayNames[bookingDate.getDay()]}, {selectedDay} {MONTHS[month].slice(0, 3)}
                </p>
                <p className={styles.invoiceService}>{service?.name}</p>

                <div className={styles.invoiceSummary}>
                  <div className={styles.summaryRow}>
                    <span>{service?.name}</span>
                    <span>{formatRupiah(service?.price ?? 0)}</span>
                  </div>
                  {couponApplied && (
                    <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                      <span>🏷️ Diskon Kupon</span>
                      <span>- {formatRupiah(discount)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRowTotal}>
                    <span>Total Harga</span>
                    <span>{formatRupiah(total)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.successActions}>
                <button className={styles.backBtn} onClick={() => router.push("/dashboard")}>
                  Back
                </button>
                <button className={styles.downloadBtn} onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={styles.toast}>{toast}</div>}
      </main>
    </>
  );
}
