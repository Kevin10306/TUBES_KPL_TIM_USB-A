import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { setSessionUser } from "@/utils/authSession";
import styles from "@/styles/view/Auth/Register/Register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const full_name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;

    if (!full_name || !email) {
      setError("Nama dan email wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, phone }),
      });
      const data = await res.json();

      if (!res.ok && res.status !== 409) {
        throw new Error(data.message ?? "Registrasi gagal");
      }

      const user = data.user ?? (await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json()).then((d) => d.user));

      if (user) {
        setSessionUser(user);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Daftar | Cukurin</title>
      <div className="bg-layer"></div>
      <main className={styles["auth-container"]}>
        <div className={styles["auth-card"]}>
          <h1 className={styles["auth-title"]}>Daftar Akun</h1>

          <form className={styles["auth-form"]} onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <label htmlFor="name">Nama Lengkap</label>
              <input id="name" name="name" type="text" placeholder="Nama kamu" />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="email@kamu.com" />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="phone">No WhatsApp</label>
              <input id="phone" name="phone" type="text" placeholder="+62" />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" />
            </div>

            {error && <p className={styles["auth-error"]}>{error}</p>}

            <button
              type="submit"
              className={styles["buttonDaftar"]}
              disabled={loading}
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className={styles["auth-footer"]}>
            Sudah punya akun? <Link href="/auth/login">Masuk di sini</Link>
          </p>
        </div>
      </main>
    </>
  );
}
