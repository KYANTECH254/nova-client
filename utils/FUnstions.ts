import { TimeInterval } from "./types";

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


export function validateLocalAddress(ip: any) {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  return ipv4Regex.test(ip);
}

export function validateDNSServer(ip: any) {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  return ipv4Regex.test(ip);
}

export function validateDdnsHost(input: string): boolean {
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|::1)$/;

  const hostnameRegex =
    /^(?=.{1,253}$)(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/;

  const urlRegex =
    /^https?:\/\/([a-zA-Z0-9-._~%!$&'()*+,;=:@]+@)?([a-zA-Z0-9.-]+)(:\d+)?(\/.*)?$/;

  return (
    ipv4Regex.test(input) ||
    ipv6Regex.test(input) ||
    hostnameRegex.test(input) ||
    urlRegex.test(input)
  );
}

export function hashInternalIP(ip: string) {
  const parts = ip.split('.');
  if (parts.length !== 4 || parts[0] !== '10' || parts[1] !== '10' || parts[2] !== '10') {
    throw new Error('Invalid IP format. Expected format: 10.10.10.X');
  }

  const lastOctet = parseInt(parts[3]);
  if (isNaN(lastOctet) || lastOctet < 0 || lastOctet > 255) {
    throw new Error('Invalid last octet');
  }

  const buffer = Buffer.from([lastOctet]);
  return buffer.toString('base64'); // or use 'hex' if preferred
}

export function decodeHashedIP(hash: string) {
  const buffer = Buffer.from(hash, 'base64');
  const lastOctet = buffer[0];
  return `10.10.10.${lastOctet}`;
}

export const formatPeriod = (period: string, usage: string) => {
  const raw = period.trim();

  if (raw === "NoExpiry") return usage;

  const [num, unitRaw] = raw.split(" ");
  const numVal = parseInt(num, 10);
  const unit = unitRaw?.toLowerCase();

  const singularized = (word: string) =>
    word.endsWith("s") && numVal === 1 ? word.slice(0, -1) : word;

  return `${numVal} ${singularized(unit)}`;
};

export const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: TimeInterval[] = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};


