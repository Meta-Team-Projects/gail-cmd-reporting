const KEY = 'cmd.templateNumber'; 

export function setTemplateNumber(n) {
    try {
        if (n === 6 || n === 12) sessionStorage.setItem(KEY, String(n));
        else sessionStorage.removeItem(KEY);
    } catch {}
}

export function getTemplateNumber() {
    try {
        const raw = sessionStorage.getItem(KEY);
        const n = raw ? Number(raw) : null;
        return (n === 6 || n === 12) ? n : null;
    } catch {
        return null;
    }
}

export function clearTemplateNumber() {
    try { sessionStorage.removeItem(KEY); } catch {}
}
