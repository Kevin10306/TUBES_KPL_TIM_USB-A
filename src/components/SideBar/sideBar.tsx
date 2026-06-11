import Link from "next/link";
import { useRouter } from "next/router";
import { clearSessionUser } from "@/utils/authSession";
import styles from "./SideBar.module.css";

const SideBar = () => {
    const router = useRouter();

    const menuItems = [
        { name: "Home", href: "/dashboard", active: router.pathname === "/dashboard" },
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
                <li>
                    <button
                        className={styles.menuItem}
                        onClick={() => {
                            clearSessionUser();
                            router.push("/auth/login");
                        }}
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default SideBar;
