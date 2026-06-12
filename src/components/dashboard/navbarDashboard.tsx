import Link from "next/link";
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <div className={styles.navbar}>
            <div className={styles.navbarLogo}><Link href="/">Cukurin</Link></div>
            <ul className={styles.navbarLinks}>
            <li className={styles.navItemLogin}>Akun</li>
            <li className={styles.navItemRegister}>Chat</li>
            <li className={styles.navItemPesanan}>Pesanan</li>
            </ul>
        </div>
    );
}

export default Navbar;
