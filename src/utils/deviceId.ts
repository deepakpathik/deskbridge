const STORAGE_KEY = 'deskbridge_device_id';

export const getStoredDeviceId = (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
};

export const generateDeviceId = (): string => {
    // Generate a random 6-digit number
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    // Format as XXX-XXX for better readability? Or just keep as 6 digits like 123456?
    // The UI placeholder shows "xxx-xxx-xxx", but a 6-9 digit number is usually easier to type.
    // Let's go with a 9-digit format "XXX-XXX-XXX" to match the UI placeholder, 
    // or a simple 6-digit pin "123-456". 
    // Let's do 9 digits "XXX-XXX-XXX" for uniqueness collision avoidance.

    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    const p3 = Math.floor(100 + Math.random() * 900);

    const fullId = `${p1}-${p2}-${p3}`;

    localStorage.setItem(STORAGE_KEY, fullId);
    return fullId;
};

export const getOrCreateDeviceId = (): string => {
    const existing = getStoredDeviceId();
    if (existing) {
        return existing;
    }
    return generateDeviceId();
};
