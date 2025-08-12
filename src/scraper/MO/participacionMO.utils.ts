export function getCategoriaId(productoRaw: string): number | null {
     const t = productoRaw
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();

     const isGen13 = /\bgeneracion\s*13\b|\bgeneración\s*13\b|\bgen\s*13\b/.test(t);

     const base13 = isGen13 ? 13 : 12;

     const isAIO = t.includes("todo en uno") || t.includes("aio");
     const isDesktop = t.includes("escritorio");
     const isLaptop = t.includes("portatil") || t.includes("portátil") || t.includes("laptop") || t.includes("notebook");

     if (isAIO) return base13 === 13 ? 2 : 1; // AIO 13 / AIO 12
     if (isDesktop) return base13 === 13 ? 4 : 3; // Desktop 13 / Desktop 12
     if (isLaptop) return base13 === 13 ? 6 : 5; // Laptop 13 / Laptop 12

     return null; // si no matchea ninguna (raro)
}
