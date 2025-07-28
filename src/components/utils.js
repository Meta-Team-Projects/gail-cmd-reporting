export function getNextSessionName(sessions) {
    const nums = sessions.map(s => {
        const m = s.name.match(/Session\s*(\d+)$/i);
        return m ? parseInt(m[1], 10) : 0;
    });
    const max = nums.length ? Math.max(...nums) : 0;
    return `Session ${max + 1}`;
}
