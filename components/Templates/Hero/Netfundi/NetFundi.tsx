import { usePlatform } from '@/contexts/PlatformProvider';
import { useState, useEffect } from 'react';
import styles from '../../Modules/NetFundi/netfundi.module.css';
import { Loader2 } from 'lucide-react';

export default function NetFUndiHero({ isLoading, code, handleLogin, setCode }: any) {
    const { platformData } = usePlatform();
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    useEffect(() => {
        platformData ? setPhoneNumber(platformData.phone) : setPhoneNumber('')
    }, [platformData]);

    return (
        <div className={styles.hero}>
            <div className={styles.voucherinputsection}>
                <label className={styles.formlabel}>Voucher or Mpesa Code </label>
                <div className={styles.inputgroup}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={styles.voucherinput}
                        placeholder="Enter Voucher or Mpesa Code"
                    />
                    <button
                        className={styles.connectbtn}
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                Checking...
                            </>
                        ) : (
                            <>
                                Connect
                            </>
                        )}
                    </button>
                </div>
                <a href={`tel:${phoneNumber}`} className={styles.customercarelink}>
                    Customer Care: {phoneNumber}
                </a>
            </div>
        </div>
    );
}
