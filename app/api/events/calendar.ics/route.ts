import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const snap = await getDocs(collection(db, "events"));
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const formatIcsDate = (dateStr?: string, timeStr?: string, addHours = 0) => {
      try {
        const d = dateStr ? new Date(dateStr) : new Date();
        const [h, m] = (timeStr || "10:00").split(":").map(Number);
        if (!isNaN(h)) d.setHours(h, m || 0, 0);
        if (addHours) d.setHours(d.getHours() + addHours);
        return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      } catch {
        return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      }
    };

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GDG on Campus AJCE//Events Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:GDG on Campus AJCE Events",
      "X-WR-TIMEZONE:Asia/Kolkata",
    ];

    events.forEach((ev: any) => {
      const dtStart = formatIcsDate(ev.date, ev.time, 0);
      const dtEnd = formatIcsDate(ev.date, ev.time, 2); // 2 hours duration by default

      lines.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}@gdgajce.org`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${(ev.title || "GDG Event").replace(/\n/g, " ")}`,
        `DESCRIPTION:${(ev.description || "Organized by Google Developer Groups on Campus AJCE").replace(/\n/g, "\\n")}`,
        `LOCATION:${(ev.location || "Amal Jyothi College of Engineering, Koovappally").replace(/\n/g, " ")}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    lines.push("END:VCALENDAR");

    return new NextResponse(lines.join("\r\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="gdg_ajce_events.ics"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
