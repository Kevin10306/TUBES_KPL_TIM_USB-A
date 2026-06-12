import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./SideBar.module.css";

type SideBarProps = {
    onMapsClick?: () => void;
    activePage?: string;
};

const SideBar = ({ onMapsClick, activePage }: SideBarProps) => {
    const router = useRouter();

    const menuItems = [
        { name: "Home", href: "/dashboard", active: activePage === "home" || (activePage === undefined && router.pathname === "/dashboard") },
        { name: "Detail Barber", href: "/barber/detail", active: router.pathname === "/barber/detail" },
        { name: "Pemesanan", href: "/barber/booking", active: router.pathname === "/barber/booking" },
        { name: "Chat", href: "#", active: false },
        { name: "Profile", href: "#", active: false },
    ];

    return (
        <aside className={styles.sidebar}>
            <Link href="/dashboard" className={styles.logo}>
                Cukurin ✂️
            </Link>

            <ul className={styles.menu}>
                {menuItems.map((item) => (
                    <li key={item.name}>
                        <Link
                            href={item.href}
                            className={`${styles.menuItem} ${item.active ? styles.active : ""}`}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}

                {/* Tombol Maps */}
                <li>
                    <button
                        className={`${styles.menuItem} ${activePage === "maps" ? styles.active : ""}`}
                        onClick={onMapsClick}
                        type="button"
                    >
                        Maps
                    </button>
                </li>

                {/* Tombol Logout */}
                <li style={{ marginTop: "auto" }}>
                    <button
                        className={`${styles.menuItem} ${styles.logoutBtn}`}
                        onClick={() => router.push("/auth/login")}
                        type="button"
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default SideBar;
