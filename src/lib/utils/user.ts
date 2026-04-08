export function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function maskEmail(email: string): string {
    const atIndex = email.indexOf('@');
    if (atIndex <= 0) return email;
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex);
    if (local.length <= 3) return `${local[0]}***${domain}`;
    const start = local.slice(0, 2);
    const end = local.slice(-1);
    return `${start}${'*'.repeat(Math.min(local.length - 3, 4))}${end}${domain}`;
}