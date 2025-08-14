/**
 * Convierte:
 *  - "dd-MM-yyyy HH:mm:ss"  -> "YYYY-MM-DD HH:mm:ss"
 *  - "yyyy-MM-dd HH:mm:ss"  -> se deja igual
 * Devuelve null si no calza.
 */
export function toSqlDateTime(s: string): string | null {
     if (!s) return null;
     const t = s.trim().replace(/\s+/g, " ");

     const m1 = t.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
     if (m1) {
          const [, dd, MM, yyyy, hh, mm, ss] = m1;
          return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
     }

     const m2 = t.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
     if (m2) return t;

     return null;
}

/**
 * "$ 1.569,00" -> 1569.00
 * Maneja miles con '.' y decimal con ',' o viceversa.
 */
export function toFloatPrice(s: string): number | null {
     if (!s) return null;
     let x = s.replace(/[^\d.,-]/g, "").trim();
     if (!x) return null;

     const hasComma = x.includes(",");
     const hasDot = x.includes(".");

     if (hasComma && hasDot) {
          if (x.lastIndexOf(",") > x.lastIndexOf(".")) {
               // decimal = coma
               x = x.replace(/\./g, "").replace(",", ".");
          } else {
               // decimal = punto
               x = x.replace(/,/g, "");
          }
     } else if (hasComma && !hasDot) {
          x = x.replace(",", ".");
     }
     const n = parseFloat(x);
     return Number.isFinite(n) ? n : null;
}

export function normalizeProductName(s: string): string {
     return (s || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .replace(/\s+/g, " ")
          .trim();
}

export function addHoursToSqlDateTime(sql: string, hours: number): string | null {
     // Espera "YYYY-MM-DD HH:mm:ss"
     const m = sql.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
     if (!m) return null;

     const [_, y, mo, d, h, mi, s] = m.map(Number);
     // trabajamos en UTC para evitar líos de TZ/DST
     const t0 = Date.UTC(y, mo - 1, d, h, mi, s);
     const t1 = t0 + hours * 3600_000;
     const dt = new Date(t1);

     const pad2 = (n: number) => String(n).padStart(2, "0");
     const yyyy = dt.getUTCFullYear();
     const mm = pad2(dt.getUTCMonth() + 1);
     const dd = pad2(dt.getUTCDate());
     const HH = pad2(dt.getUTCHours());
     const MM = pad2(dt.getUTCMinutes());
     const SS = pad2(dt.getUTCSeconds());

     return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
}
