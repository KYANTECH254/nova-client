import { formatPeriod } from '@/utils/FUnstions';
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
                {['Daily', 'Weekly', 'Monthly', 'Data'].map((type) => (
                    <button
                        key={type}
                        className={`${styles.packagetogglebtn} ${filter === type ? styles.active : ''}`}
                        onClick={() => setFilter(type as "Daily" | "Weekly" | "Monthly" | "Data")}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>
            {filteredPlans.length > 0 ? (
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
                                    <div className={styles.planspecs}>
                                        {formatPeriod(pkg.period, pkg.usage)} •{" "}
                                        {parseInt(pkg.devices) === 1
                                            ? `${pkg.devices} Device`
                                            : parseInt(pkg.devices) < 1
                                                ? "Unlimited Devices"
                                                : `${pkg.devices} Devices`} • {pkg.speed}Mbps
                                    </div>

                                    {(pkg.popular || (pkg.period || "").trim() === "NoExpiry") && (
                                        <div className={styles.badges}>
                                            {pkg.popular && (
                                                <div className={`${styles.badge} ${styles.streaming}`}>
                                                    Popular
                                                </div>
                                            )}
                                            {(pkg.period || "").trim() === "NoExpiry" && (
                                                <div className={`${styles.badge} ${styles.noExpiry}`}>
                                                    NO EXPIRY
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button onClick={() => setSelectedPlan(pkg)} className={styles.buybutton}>BUY NOW</button>
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-500">No Packages Available</h2>
                </div>
            )}
        </div>
    );
}
