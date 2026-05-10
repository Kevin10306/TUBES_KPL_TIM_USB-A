import Link from "next/link";
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <div className={styles.navbar}>
            <div className={styles.navbarLogo}><Link href="/">Cukurin</Link></div>
            <ul className={styles.navbarLinks}>
            <li className={styles.navItemLogin}><Link href="/auth/login">Login</Link></li>
            <li className={styles.navItemRegister}><Link href="/auth/register">Register</Link></li>
            </ul>
        </div>
    );
}

export default Navbar;
