import styles from "../../Modules/NetFundi/netfundi.module.css";
import { ClipLoader } from "react-spinners";
import { Copy, Loader2 } from "lucide-react";

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
console.log(codes);

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
                <button disabled={loading} onClick={fetchCode}>
                    {loading ? <ClipLoader size={20} color="#fff" /> : " Get Voucher"}
                </button>

                {!loading && codes.length > 0 && (
                    <div className={styles.voucherDetails}>
                        <h3 className="text-xl font-bold text-black m-5">{codes.length} Voucher{codes.length > 1 ? "s" : ""} found</h3>
                        {codes.map((c: any, index: any) => (
                            <div key={index} className={c.expired ? styles.expiredvoucherBox : styles.voucherBox}>
                                {/* <p className={styles.voucherStatus}>{c.status}</p> */}
                                <h4 className={`text-lg font-semibold ${c.expired ? 'text-red-500' : 'text-green-500'}`}>
                                    {c.expired ? (
                                        "Expired"
                                    ) : (
                                        "Active"
                                    )}
                                </h4>
                                <div className="relative w-full">
                                    <input
                                        onClick={() => copyToClipboard(c.username)}
                                        className={`${styles.codeInput} ${c.expired ? "bg-red-500/20" : "bg-green-500/20"} pr-10`}
                                        type="text"
                                        value={c.username}
                                        readOnly
                                    />
                                    <Copy
                                        onClick={() => copyToClipboard(c.username)}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 ${c.expired ? "text-red-400" : "text-green-400"
                                            } hover:text-white transition cursor-pointer`}
                                    />
                                </div>

                                <p className="text-black">
                                    This voucher was active from {c.activeFrom}.
                                    <br />
                                    Remaining time: {c.timeLeft}.
                                </p>

                                <button
                                    disabled={loggingin}
                                    onClick={() => {
                                        if (!c.expired) {
                                            setLoggingIn(true);
                                            window.location.href = `http://local.wifi/login?username=${c.username}&password=${c.password}`;
                                        } else {
                                            window.location.href = `${window.location.origin}/login`;
                                        }
                                    }}
                                    className={c.expired ? styles.subscribeButton : styles.loginButton}
                                >
                                    {c.expired ? (
                                        "Subscribe"
                                    ) : loggingin ? (
                                        <>
                                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                            Logging in...
                                        </>
                                    ) : (
                                        "Log In"
                                    )}
                                </button>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}
