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
    return `${name.toLowerCase().replace(/\s+/g, '-')}`;
};

export const generatePlatformId = () => {
    return `PLT${Math.floor(1000 + Math.random() * 900000)}`;
};

export const getCurrentAdminId = () => {
    return `ADM${Math.floor(1000 + Math.random() * 900000)}`;
};