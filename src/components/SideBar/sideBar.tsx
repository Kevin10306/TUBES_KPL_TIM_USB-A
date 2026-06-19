import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/auth";
import styles from "./SideBar.module.css";

const SideBar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const customerMenu = [
        { name: "Home", href: "/dashboard", active: router.pathname === "/dashboard" },
        { name: "Detail Barber", href: "/barber/detail", active: router.pathname === "/barber/detail" },
        { name: "Pemesanan", href: "/barber/booking", active: router.pathname === "/barber/booking" },
        { name: "Chat", href: "/dashboard/chat", active: router.pathname === "/dashboard/chat" },
    ];

    const ownerMenu = [
        { name: "Dashboard", href: "/dashboard", active: router.pathname === "/dashboard" },
        { name: "Chat Pelanggan", href: "/dashboard/chat", active: router.pathname === "/dashboard/chat" },
    ];

    const menuItems = user?.role === 'owner' ? ownerMenu : customerMenu;

    return (
        <aside className={styles.sidebar}>
            <Link href="/dashboard" className={styles.logo}>
                Cukurin ✂️
            </Link>

            {user && (
                <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <p style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {user.role === 'owner' ? 'Pemilik Barber' : 'Pelanggan'}
                    </p>
                </div>
            )}

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
                        onClick={logout}
                        style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default SideBar;
