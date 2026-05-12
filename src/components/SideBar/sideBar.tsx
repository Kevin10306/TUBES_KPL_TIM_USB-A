import styles from "./SideBar.module.css";

const SideBar = () => {
    const menuItems = [
        { name: "Jadwal", active: false },
        { name: "Chat", active: false },
        { name: "Profile", active: false },
        { name: "Logout", active: false },
    ];

    return (
        <aside className={styles.sidebar}>

            <div className={styles.logo}>
                Cukurin ✂️
            </div>

            <ul className={styles.menu}>
                {menuItems.map((item) => (
                    <li 
                        key={item.name} 
                        className={`${styles.menuItem} ${item.active ? styles.active : ""}`}
                    >
                        {item.name}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default SideBar;
