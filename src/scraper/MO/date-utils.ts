/** Normaliza cadenas (lowercase + sin acentos + trim) */
function norm(s: string) {
     return s
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .trim();
}

/** "01" -> "1", " 2 " -> "2", 3 -> "3" */
export function toNumStr(v: number | string) {
     const s = String(v).trim();
     const n = parseInt(s, 10);
     return Number.isNaN(n) ? s : String(n);
}

// Texto de mes -> value numérico del <option>
const MONTH_MAP: Record<string, string> = {
     ene: "1",
     "ene.": "1",
     enero: "1",
     feb: "2",
     "feb.": "2",
     febrero: "2",
     mar: "3",
     "mar.": "3",
     marzo: "3",
     abr: "4",
     "abr.": "4",
     abril: "4",
     may: "5",
     "may.": "5",
     mayo: "5",
     jun: "6",
     "jun.": "6",
     junio: "6",
     jul: "7",
     "jul.": "7",
     julio: "7",
     ago: "8",
     "ago.": "8",
     agosto: "8",
     sep: "9",
     "sep.": "9",
     sept: "9",
     "sept.": "9",
     septiembre: "9",
     oct: "10",
     "oct.": "10",
     octubre: "10",
     nov: "11",
     "nov.": "11",
     noviembre: "11",
     dic: "12",
     "dic.": "12",
     diciembre: "12",
};

/** Acepta "feb.", "mar", "abril", 2, "2" y devuelve "1".."12" */
export function toMonthValue(m: number | string): string {
     const raw = String(m).trim();
     const n = parseInt(raw, 10);
     if (!Number.isNaN(n)) return String(n); // ya viene 1..12

     const key = norm(raw).replace(/\./g, "");
     if (MONTH_MAP[key]) return MONTH_MAP[key];

     const abbr = key.slice(0, 3);
     if (MONTH_MAP[abbr]) return MONTH_MAP[abbr];

     throw new Error(`Mes inválido: "${m}" (usa "ene.", "feb.", "mar.", etc., o 1..12)`);
}
