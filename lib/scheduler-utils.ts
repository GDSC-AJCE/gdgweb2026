export const fmtDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export function slotTime(startTime: string, idx: number, mins: number) {
    if (!startTime) return "";
    const [h, m] = startTime.split(":").map(Number);
    const tot = h * 60 + m + idx * mins;
    const nh = Math.floor(tot / 60) % 24;
    const nm = tot % 60;
    const h12 = nh % 12 === 0 ? 12 : nh % 12;
    return `${h12}:${String(nm).padStart(2, "0")} ${nh < 12 ? "AM" : "PM"}`;
}
