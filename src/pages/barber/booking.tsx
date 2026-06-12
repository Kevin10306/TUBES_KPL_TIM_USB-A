import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import SideBar from "@/components/SideBar/sideBar";
import {
  BARBER_DETAIL,
  BOOKING_TIMES,
  BOOKING_SERVICES,
  EXTRA_SERVICES,
  COUPON,
  formatRupiah,
} from "@/data/mockBarber";
import { saveSchedule } from "@/utils/scheduleStorage";
import styles from "./booking.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

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

export default function BookingPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedService, setSelectedService] = useState("basic");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [extras, setExtras] = useState<string[]>(["extra-massage"]);
  const [couponInput, setCouponInput] = useState(COUPON.code);
  const [couponApplied, setCouponApplied] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [toast, setToast] = useState("");

  const calendar = useMemo(() => buildCalendar(year, month), [year, month]);

  const service = BOOKING_SERVICES.find((s) => s.id === selectedService)!;
  const extraTotal = EXTRA_SERVICES.filter((e) => extras.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);
  const subtotal = service.price + extraTotal;
  const discount = couponApplied ? COUPON.discount : 0;
  const total = subtotal - discount;

  const selectedDateLabel = `Minggu, ${selectedDay} ${MONTHS[month].slice(0, 3)} - ${selectedTime}`;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const toggleExtra = (id: string) => {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const applyCoupon = () => {
    if (couponInput.toUpperCase() === COUPON.code) {
      setCouponApplied(true);
      setToast("Kupon aktif! Hemat Rp 5.000 dari transaksi ini");
    } else {
      setCouponApplied(false);
      setToast("Kupon tidak valid");
    }
    setTimeout(() => setToast(""), 2500);
  };

  const handleConfirm = () => {
    if (!selectedDay || !selectedTime) return;
    setStep(2);
  };

  const handlePay = () => {
    const extraLabels = EXTRA_SERVICES
      .filter((e) => extras.includes(e.id))
      .map((e) => e.name)
      .join(", ");

    saveSchedule({
      barbershopName: BARBER_DETAIL.name,
      jadwal: `${selectedDay} ${MONTHS[month]} ${year} - ${selectedTime}`,
      service: extraLabels ? `${service.name}, ${extraLabels}` : service.name,
      total,
    });
    setPaymentSuccess(true);
  };

  const handleDownload = () => {
    const content = [
      "INVOICE - CUKURIN",
      "Pembayaran Berhasil",
      "",
      `Barbershop: ${BARBER_DETAIL.name}`,
      `Tanggal: ${selectedDateLabel}`,
      `Layanan: ${service.name}`,
      ...EXTRA_SERVICES.filter((e) => extras.includes(e.id)).map((e) => `+ ${e.name}: ${formatRupiah(e.price)}`),
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
                {BOOKING_SERVICES.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles.serviceChip} ${selectedService === s.id ? styles.serviceChipActive : ""}`}
                    onClick={() => setSelectedService(s.id)}
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
              <div className={styles.summaryRow}>
                <span>{service.name}</span>
                <span>{formatRupiah(service.price)}</span>
              </div>
              {EXTRA_SERVICES.filter((e) => extras.includes(e.id) && e.price > 0).map((e) => (
                <div key={e.id} className={styles.summaryRow}>
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
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                Konfirmasi
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.layout}>
            <div className={styles.mainPanel}>
              <div className={styles.barberCard}>
                <img
                  src={BARBER_DETAIL.image}
                  alt={BARBER_DETAIL.name}
                  className={styles.barberCardImage}
                />
                <div>
                  <p className={styles.barberCardName}>{BARBER_DETAIL.name}</p>
                  <p className={styles.barberCardLocation}>{BARBER_DETAIL.location}</p>
                  <p className={styles.barberCardRating}>
                    ⭐ {BARBER_DETAIL.rating} ({BARBER_DETAIL.reviewCount})
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
                <p className={styles.detailValue} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Basic haircut & vitamint
                </p>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Tambahan</p>
                <div className={styles.extraList}>
                  {EXTRA_SERVICES.map((e) => (
                    <label key={e.id} className={styles.extraItem}>
                      <input
                        type="checkbox"
                        checked={extras.includes(e.id)}
                        onChange={() => toggleExtra(e.id)}
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
                    ✅ Kupon aktif! Hemat Rp 5.000 dari transaksi ini
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
              {EXTRA_SERVICES.filter((e) => extras.includes(e.id) && e.price > 0).map((e) => (
                <div key={e.id} className={styles.summaryRow}>
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
                <button className={styles.payBtn} onClick={handlePay}>
                  Bayar Sekarang
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
                Segera periksa menu pemesanan untuk informasi detail.
              </p>
              <div className={styles.reminderBox}>
                🔔 Pengingat akan dikirim ke WhatsApp 1 jam sebelum jadwal.
              </div>

              <div className={styles.invoiceCard}>
                <p className={styles.invoiceBarber}>{BARBER_DETAIL.name}</p>
                <p className={styles.invoiceDate}>
                  Minggu, {selectedDay} {MONTHS[month].slice(0, 3)}
                </p>
                <p className={styles.invoiceService}>
                  {service.name}
                  {extras.includes("extra-massage") ? ", Massage" : ""}
                </p>

                <div className={styles.invoiceSummary}>
                  <div className={styles.summaryRow}>
                    <span>{service.name}</span>
                    <span>{formatRupiah(service.price)}</span>
                  </div>
                  {extras.includes("extra-massage") && (
                    <div className={styles.summaryRow}>
                      <span>Extra massage</span>
                      <span>{formatRupiah(5000)}</span>
                    </div>
                  )}
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
