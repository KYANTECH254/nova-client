export function getNextAvailableIP(existingHosts: string[], base: string = "10.10.10.") {
    const assigned = new Set(
        existingHosts
            .filter(ip => ip.startsWith(base))
            .map(ip => ip.split("/")[0])
            .map(ip => parseInt(ip.split(".")[3]))
            .filter(val => !isNaN(val))
    );

    for (let i = 2; i <= 254; i++) {
        if (!assigned.has(i)) {
            return `${base}${i}`;
        }
    }

    return "";
}


export const generatePlatformUrl = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generatePlatformId = () => {
    return `PLT${Math.floor(1000 + Math.random() * 900000)}`;
};

export const getCurrentAdminId = () => {
    return `ADM${Math.floor(1000 + Math.random() * 900000)}`;
};

export const isValidIP = (ip: string): boolean => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
};

export const isValidPublicKey = (key: string): boolean => {
    // Remove surrounding whitespace
    const trimmedKey = key.trim();

    // Check length exactly 44 characters (standard WireGuard public key length)
    if (trimmedKey.length !== 44) {
        return false;
    }

    // Validate base64 charset (allowing '=' padding at end)
    const base64Regex = /^[A-Za-z0-9+/]{43}=$/;

    return base64Regex.test(trimmedKey);
};

export interface ValidateAmountOptions {
    min?: number;
    max?: number;
    decimals?: number;
}

export interface ValidateAmountResult {
    valid: boolean;
    value?: number;
    error?: string;
}

export function validateAmount(
    amount: string | number | null | undefined,
    options: ValidateAmountOptions = {}
): ValidateAmountResult {
    const { min = 0.01, max = Infinity, decimals = 2 } = options;

    if (amount === null || amount === undefined || amount === '') {
        return { valid: false, error: 'Amount is required.' };
    }

    const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());

    if (isNaN(num)) {
        return { valid: false, error: 'Amount must be a number.' };
    }

    if (num <= 0) {
        return { valid: false, error: 'Amount must be greater than zero.' };
    }

    if (num < min) {
        return { valid: false, error: `Amount must be at least ${min}.` };
    }

    if (num > max) {
        return { valid: false, error: `Amount must not exceed ${max}.` };
    }

    const decimalPlaces = (num.toString().split('.')[1] || '').length;
    if (decimalPlaces > decimals) {
        return { valid: false, error: `Amount must have no more than ${decimals} decimal places.` };
    }

    return { valid: true, value: num };
}

export const getMappedPort = (internalIP: string): number | null => {
    const match = internalIP.match(/^10\.10\.10\.(\d{1,3})$/);
    if (!match) return null;

    const lastOctet = parseInt(match[1], 10);
    if (lastOctet < 2 || lastOctet > 254) return null;

    return 8290 + lastOctet;
};

export const getInternalIP = (publicPort: number): string | null => {
    if (publicPort <= 8290 || publicPort > 8544) return null;
    const lastOctet = publicPort - 8290;
    return `10.10.10.${lastOctet}`;
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function validateDdnsHost(host: string): boolean {
    if (typeof host !== 'string' || host.trim() === '') return false;

    // Matches domain-like strings: sub.domain.tld (e.g., myrouter.mynetname.net)
    const ddnsRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    return ddnsRegex.test(host);
}
