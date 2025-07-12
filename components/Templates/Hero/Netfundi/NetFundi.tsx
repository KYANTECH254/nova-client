import { usePlatform } from '@/contexts/PlatformProvider';
import { useState, useEffect } from 'react';
import styles from '../../Modules/NetFundi/netfundi.module.css';

export default function NetFUndiHero({ isLoading, code, handleLogin, setCode }: any) {
    const { platformData } = usePlatform();
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    useEffect(() => {
        platformData ? setPhoneNumber(platformData.phone) : setPhoneNumber('')
    }, [platformData]);

    return (
        <div className={styles.hero}>
            <div className={styles.voucherinputsection}>
                <label className={styles.formlabel}>Voucher</label>
                <div className={styles.inputgroup}>
                    <input
                        type="text"
                        className={styles.voucherinput}
                        placeholder="Enter Voucher"
                    />
                    <button className={styles.connectbtn} onClick={handleLogin}>
                        Connect
                    </button>
                </div>
                <a href={`tel:${phoneNumber}`} className={styles.customercarelink}>
                    Customer Care: {phoneNumber}
                </a>
            </div>
        </div>
    );
}
