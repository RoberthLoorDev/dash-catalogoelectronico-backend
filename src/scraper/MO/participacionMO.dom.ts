import { Page } from "puppeteer";
import { HistRow } from "./types";

/** Extrae filas visibles del tbody actual (#body_table_listas) */
export async function extractRowsFromDOM(page: Page): Promise<HistRow[]> {
     return page.$$eval("#body_table_listas tr", (trs) => {
          const out: HistRow[] = [];
          trs.forEach((tr) => {
               const tds = tr.querySelectorAll("td");
               if (tds.length < 3) return; // evita filas de "No hay ninguna participación"

               const td0 = tds[0].cloneNode(true) as HTMLElement;
               td0.querySelectorAll(".pull-right").forEach((el) => el.remove());
               const producto = (td0.textContent || "").replace(/\s+/g, " ").trim();

               const cantidadTxt = (tds[1].textContent || "").trim();
               const cantidadNum = parseInt(cantidadTxt, 10);
               const fecha_hist = (tds[2].textContent || "").trim();

               out.push({
                    producto_raw: producto,
                    cantidad: Number.isNaN(cantidadNum) ? null : cantidadNum,
                    fecha_hist,
               });
          });
          return out;
     });
}

/** Lee el número máximo de página del paginador bajo la tabla */
export async function getMaxPageFromDOM(page: Page): Promise<number> {
     const nums = await page.$$eval("#tabla_gcmo ul.pagination li a", (as) =>
          as
               .map((a) => (a.textContent || "").replace(/[^\d]/g, "").trim())
               .map((s) => parseInt(s, 10))
               .filter((n) => !Number.isNaN(n))
     );
     return nums.length ? Math.max(...nums) : 1;
}

/** Espera a que los resultados reales estén renderizados en el tbody */
export async function ensureResultsLoaded(page: Page): Promise<void> {
     await page.waitForSelector("#body_table_listas", { timeout: 15000 });
     await page.waitForFunction(
          () => {
               const tbody = document.getElementById("body_table_listas");
               if (!tbody) return false;
               const rows = Array.from(tbody.querySelectorAll("tr"));
               return rows.some((tr) => {
                    const tds = tr.querySelectorAll("td");
                    const hasLink = tr.querySelector('a[href*="/pendientes/participacion/ver/"]');
                    return tds.length >= 3 || !!hasLink;
               });
          },
          { timeout: 15000 }
     );
}

/** Va a una página N usando la función del sitio y espera a que cargue */
export async function goToPageAndWait(page: Page, pageNum: number): Promise<void> {
     await page.evaluate((n) => (window as any).paginacionMO(n, "MO"), pageNum);

     // espera a que el paginador marque activa la página N
     await page.waitForFunction(
          (n) => {
               const a = document.querySelector("#tabla_gcmo ul.pagination li.active a");
               if (!a) return false;
               const cur = (a.textContent || "").replace(/[^\d]/g, "").trim();
               return cur === String(n);
          },
          { timeout: 20000 },
          pageNum
     );

     await ensureResultsLoaded(page);
}
