// Mapeo fijo (según tu tabla categorias)
const ID_MAP = {
     aio12: 1,
     aio13: 2,
     desktop12: 3,
     desktop13: 4,
     laptop12: 5,
     laptop13: 6,
} as const;

function norm(s: string) {
     return s
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .trim();
}

/**
 * Devuelve el categoria_id de acuerdo al nombre del producto.
 * Regla:
 *  - "TODO EN UNO" -> AIO
 *  - "ESCRITORIO"  -> Desktop
 *  - "PORTÁTIL/PORTATIL" -> Laptop
 *  - "GENERACIÓN 13" (o "generacion 13" sin acento) => 13; si no aparece => 12
 */
export function computeCategoriaId(producto_raw: string): number | null {
     const s = norm(producto_raw.replace(/^\*/, "")); // quita asterisco inicial si existe
     const isGen13 = /\bgeneracion\s*13\b/.test(s);

     let base: "aio" | "desktop" | "laptop" | null = null;
     if (s.includes("todo en uno")) base = "aio";
     else if (s.includes("escritorio")) base = "desktop";
     else if (s.includes("portatil")) base = "laptop";

     if (!base) return null;

     const key = `${base}${isGen13 ? "13" : "12"}` as keyof typeof ID_MAP;
     return ID_MAP[key] ?? null;
}
