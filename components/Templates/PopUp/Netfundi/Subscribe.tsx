import styles from "../../Modules/NetFundi/netfundi.module.css";

export default function NetFundiSubscribe({
    plan,
    onClose,
    handlePayment,
    loading,
    setPhone,
    phone,
}: any) {

    return (
        <div className={styles.buypopupoverlay}>
            <div className={styles.buypopup}>
                <img
                    src="images/templates/netfundi/close_cyskal.png"
                    alt="Close"
                    className={styles.close}
                    onClick={onClose}
                />

                <div className={styles.packagedetails}>
                    <h2 className="text-black text-2xl font-bold">{plan?.name || "Package name"}</h2>
                    <p>{plan.period} •  {parseInt(plan.devices) === 1
                        ? `${plan.devices} Device`
                        : parseInt(plan.devices) < 1
                            ? 'Unlimited Devices'
                            : `${plan.devices} Devices`} • {plan.speed}Mbps</p>
                </div>

                <label className={styles.label} htmlFor="mpesaInput">Enter Mpesa Number:</label>
                <input
                    type="text"
                    id="mpesaInput"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 0712345678"
                />

                <button disabled={loading} onClick={handlePayment}> {loading ? "Processing..." : `Pay Now`}</button>
            </div>
        </div>
    );
}
