import styles from "../../Modules/NetFundi/netfundi.module.css";
import { ClipLoader } from "react-spinners";
import { Loader2 } from "lucide-react";

export default function NetFundiPopup({
    codes,
    onClose,
    loading,
    loggingin,
    setLoggingIn,
    copyToClipboard,
    setInput,
    input,
    fetchCode
}: any) {

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <img
                    src="/images/templates/netfundi/close_cyskal.png"
                    alt="Close"
                    className={styles.close}
                    onClick={onClose}
                />
                <h2 className="text-black text-2xl mb-2 font-bold mt-5" >Get Your Login Voucher</h2>
                <p className="text-black">
                    Enter Phone Number or Mpesa Voucher or Paste full Mpesa message after
                    payment:
                </p>
                <input
                className="text-black"
                    type="text"
                    placeholder="Enter Phone Number or Mpesa Voucher"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={fetchCode}>
                    {loading ? <ClipLoader size={20} color="#fff" /> : " Get Voucher"}
                </button>

                {!loading && codes.length > 0 && (
                    <div className={styles.voucherDetails}>
                        <h3>{codes.length} Voucher{codes.length > 1 ? "s" : ""}</h3>
                        {codes.map((c: any, index: any) => (
                            <div className={styles.voucherBox}>
                                <p className={styles.voucherStatus}>{c.status}</p>
                                <input type="text" value={c.code} readOnly />
                                <p>
                                    This voucher was active from {c.startTime}.
                                    <br />
                                    Remaining time: {c.remaining} remaining.
                                </p>
                                <button
                                    onClick={() => {
                                        if (!c.expired) {
                                            setLoggingIn(true);
                                            window.location.href = `http://local.wifi/login?username=${c.username}&password=${c.password}`;
                                        } else {
                                            window.location.href = `${window.location.origin}/login`;
                                        }
                                    }}
                                    className={styles.loginButton}>
                                    {c.expired ? "Subscribe" : loggingin ? (
                                        <>
                                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                            Logging in...
                                        </>
                                    ) : "Log In"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
