import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { setSessionUser } from "@/utils/authSession";
import styles from "@/styles/view/Auth/Login/Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginWithEmail = async (loginEmail: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Login gagal");

      setSessionUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }
    loginWithEmail(email);
  };

  const handleGuest = () => loginWithEmail("tamu@cukurin.app");

  return (
    <>
      <title>Login | Cukurin</title>
      <div className="bg-layer"></div>
      <main className={styles["auth-container"]}>
        <div className={styles["auth-card"]}>
          <h1 className={styles["auth-title"]}>Selamat Datang</h1>

          <form className={styles["auth-form"]} onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="email@kamu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" />
            </div>

            {error && <p className={styles["auth-error"]}>{error}</p>}

            <button
              type="submit"
              className={styles["buttonMasuk"]}
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <button
              type="button"
              className={styles["buttonTamu"]}
              onClick={handleGuest}
              disabled={loading}
            >
              Masuk sebagai tamu
            </button>
          </form>

          <p className={styles["auth-footer"]}>
            Belum punya akun? <Link href="/auth/register">Daftar sekarang</Link>
          </p>
        </div>
      </main>
    </>
  );
}
