import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/auth";
import styles from './Navbar.module.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();

    return (
        <div className={styles.navbar}>
            <div className={styles.navbarLogo}><Link href="/">Cukurin</Link></div>
            <ul className={styles.navbarLinks}>
                {isAuthenticated ? (
                    // Sudah login: tampilkan Dashboard + Logout
                    <>
                        <li className={styles.navItemLogin}>
                            <Link href="/dashboard">
                                Dashboard {user?.role === 'owner' ? '(Admin)' : ''}
                            </Link>
                        </li>
                        <li className={styles.navItemRegister}>
                            <button
                                onClick={logout}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: 0 }}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    // Belum login: tampilkan Login + Register
                    <>
                        <li className={styles.navItemLogin}><Link href="/auth/login">Login</Link></li>
                        <li className={styles.navItemRegister}><Link href="/auth/register">Register</Link></li>
                    </>
                )}
            </ul>
        </div>
    );
}

export default Navbar;

