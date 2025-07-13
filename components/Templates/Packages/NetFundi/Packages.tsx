import styles from '../../Modules/NetFundi/netfundi.module.css';


export default function NetFundiPackages({
    filter,
    setFilter,
    filteredPlans,
    selectedPlan,
    setSelectedPlan,
}: any) {

    return (
        <div className={styles.netfundipackages}>
            <div className={styles.packagetogglebuttons}>
                {['Daily', 'Weekly', 'Monthly'].map((type) => (
                    <button
                        key={type}
                        className={`${styles.packagetogglebtn} ${filter === type ? styles.active : ''}`}
                       onClick={() => setFilter(type as "Daily" | "Weekly" | "Monthly")}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.packagecontent}>
                {filteredPlans
                    .sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))
                    .map((pkg: any, index: any) => (
                        <div key={index} className={styles.plancard}>
                            <div className={styles.pricesection}>
                                <div className={styles.currency}>KES</div>
                                <div className={styles.price}>{pkg.price}</div>
                            </div>
                            <div className={styles.plandetails}>
                                <div className={styles.planname}>{pkg.name}</div>
                                <div className={styles.planspecs}>{pkg.specs}</div>
                                {pkg.badges && (
                                    <div className={styles.badges}>
                                        {pkg.badges.map((badge: any, j: any) => (
                                            <div
                                                key={j}
                                                className={`${styles.badge} ${badge === 'NO EXPIRY' ? styles.noExpiry : styles.streaming}`}
                                            >
                                                {badge}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className={styles.buybutton}>BUY NOW</button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
