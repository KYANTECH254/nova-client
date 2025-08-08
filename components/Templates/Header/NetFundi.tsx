import styles from '../Modules/NetFundi/netfundi.module.css';
import Link from 'next/link';

export default function NetFundiHeader({ name, onClick }: any) {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.brand}>
                {name}
            </Link>
            <button onClick={onClick} className={styles.voucherButton}>GET VOUCHER</button>
        </header>
    );
}
