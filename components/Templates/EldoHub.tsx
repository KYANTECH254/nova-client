"use client"
import styles from '@/public/styles/templates/eldohub/style.module.css'

export default function EldoHub({ isLoading, code, handleLogin, setCode }: any) {
    return (
        <div className="eldohub-body">
            <main className={styles['main-c']}>
                <div className={styles["form-container"]}>
                    <div className={styles["logo"]}>
                        <img src="/images/templates/eldohub/eldohub.png" />
                    </div>
                    <h1 className={styles["h1"]}>Network Access</h1>
                    <form name="loginForm" method="post" className={styles["form"]}>
                        <input
                            className={styles["input"]}
                            id="username"
                            name="username"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter Access Code"
                            required
                        />
                        <button
                            className={styles["button"]}
                            onClick={handleLogin}
                            disabled={isLoading}
                            type="submit"
                        >
                            {isLoading ? "Checking..." : "Sign In"}
                        </button>
                    </form>
                    <div className={styles["hint-text"]}>
                        Please enter the provided access code to sign in to the network.
                    </div>
                </div>
            </main>
        </div>
    )
}

