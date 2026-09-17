/**
 * Ensures a URL is absolute by adding 'https://' if it doesn't already 
 * start with a protocol (http, https, etc.).
 */
export function ensureAbsoluteUrl(url: string | undefined): string {
    if (!url || !url.trim()) return "";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    return `https://${trimmed}`;
}

/**
 * Normalizes a URL by removing protocols, www, query parameters, and trailing slashes.
 */
export function normalizeUrl(url: string | undefined): string {
    if (!url) return "";
    let clean = url.trim();
    clean = clean.replace(/^(https?:\/\/)/i, "");
    clean = clean.replace(/^www\./i, "");
    clean = clean.split(/[?#]/)[0];
    clean = clean.replace(/\/$/, "");
    return clean;
}

/**
 * Converts a string to Title Case.
 */
export function toTitleCase(str: string | undefined): string {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .trim();
}

/**
 * Format a number as Indian Rupee or currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Intelligently extracts a human-readable name from an email address
 * e.g., 'vinayakprakash2026@cs.ajce.in' -> 'Vinayak Prakash'
 * 'nandhubabuvktd@gmail.com' -> 'Nandhu Babu'
 * 'arnair126@gmail.com' -> 'Ar Nair'
 */
export function formatNameFromEmail(email: string | undefined | null): string {
    if (!email) return "";
    const prefix = email.split("@")[0] || "";
    // Clean out numbers, years, and punctuation
    const stripped = prefix
        .replace(/[0-9]+/g, " ")
        .replace(/[._-]+/g, " ")
        .trim();
    if (!stripped) return prefix;
    return toTitleCase(stripped);
}

/**
 * Resolves a clean candidate/user name with cascading fallbacks
 */
export function resolveName(
    name?: string | null,
    displayName?: string | null,
    fullName?: string | null,
    email?: string | null,
    defaultFallback = "Applicant"
): string {
    const cleanEmail = (email || "").toLowerCase().trim();
    if (cleanEmail === "dsc@amaljyothi.ac.in") {
        for (const c of [name, fullName, displayName]) {
            if (c && typeof c === "string" && c.trim() && !["applicant", "member", "null"].includes(c.trim().toLowerCase())) {
                return c.trim();
            }
        }
        return "Chapter Organizer";
    }

    const candidates = [name, fullName, displayName];
    for (const c of candidates) {
        if (
            c &&
            typeof c === "string" &&
            c.trim() &&
            c.trim().toLowerCase() !== "null" &&
            c.trim().toLowerCase() !== "undefined" &&
            c.trim().toLowerCase() !== "applicant" &&
            c.trim().toLowerCase() !== "member"
        ) {
            return c.trim();
        }
    }
    if (email) {
        const fromEmail = formatNameFromEmail(email);
        if (fromEmail) return fromEmail;
    }
    return defaultFallback;
}

