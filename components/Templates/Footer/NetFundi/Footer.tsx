import { ShieldCheck } from 'lucide-react';
import styles from '../../Modules/NetFundi/netfundi.module.css';

export default function NetFundiFooter() {
    return (
        <footer className={styles.footer}>
            <ShieldCheck className="w-5 h-5 text-[#2b9d5d]" />
            <span className={styles.text}>
                Powered by <span className={styles.brand}>
                    <a href="https://novawifi.online" target="_blank" rel="noopener noreferrer">
                        <span className="font-bold text-[#2b9d5d]">NOVA</span>
                    </a>
                </span>
            </span>
        </footer>
    );
}
