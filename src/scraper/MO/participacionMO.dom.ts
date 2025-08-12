import { Page } from "puppeteer";
import { toSqlDateTime, toFloatPrice } from "./normalize.utils";
import { HistRow, Participation } from "./types";

/** Extrae filas visibles del tbody actual (#body_table_listas) */
export async function extractRowsFromDOM(page: Page): Promise<HistRow[]> {
     // 1) Solo extrae strings en el contexto del navegador (sin usar utils)
     const rawRows = await page.$$eval("#body_table_listas tr", (trs) => {
          const out: Array<{
               producto_raw: string;
               cantidad: number | null;
               fecha_hist: string; // crudo
          }> = [];

          trs.forEach((tr) => {
               const tds = tr.querySelectorAll("td");
               if (tds.length < 3) return;

               const td0 = tds[0].cloneNode(true) as HTMLElement;
               td0.querySelectorAll(".pull-right").forEach((el) => el.remove());
               const producto = (td0.textContent || "").replace(/\s+/g, " ").trim();

               const cantidadTxt = (tds[1].textContent || "").trim();
               const cantidadNum = parseInt(cantidadTxt, 10);

               const fechaTxt = (tds[2].textContent || "").trim(); // <-- sin normalizar

               out.push({
                    producto_raw: producto,
                    cantidad: Number.isNaN(cantidadNum) ? null : cantidadNum,
                    fecha_hist: fechaTxt, // crudo
               });
          });

          return out;
     });

     // 2) Ya en Node, normaliza la fecha
     const rows: HistRow[] = rawRows.map((r) => ({
          producto_raw: r.producto_raw,
          cantidad: r.cantidad,
          fecha_hist: toSqlDateTime(r.fecha_hist) ?? r.fecha_hist,
          categoria_id: null,
     }));

     return rows;
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

// Abre el primer "Ver resultados" y valida que el modal contenga <h4>Historial de las ofertas</h4>
export async function openFirstDetailModalAndCheck(page: Page): Promise<boolean> {
     // Asegura que exista al menos un link de detalle
     await page.waitForSelector('#body_table_listas a[href*="/pendientes/participacion/ver/"]', { timeout: 15000 });

     // Click en el primer link y espera la respuesta AJAX que carga el modal
     const respWait = page
          .waitForResponse((r) => r.url().includes("/pendientes/participacion/ver/") && r.status() === 200, { timeout: 15000 })
          .catch(() => null);

     await page.click('#body_table_listas a[href*="/pendientes/participacion/ver/"]');
     await respWait;

     // Espera a que el modal esté visible y con contenido
     await page
          .waitForSelector('#resultados.in, #resultados.show, #resultados[aria-hidden="false"]', { timeout: 10000 })
          .catch(() => {});

     // Verifica el H4
     const found = await page
          .waitForFunction(
               () => {
                    const h = document.querySelector("#resultados .modal-content h4");
                    if (!h) return false;
                    const t = (h.textContent || "")
                         .normalize("NFD")
                         .replace(/\p{Diacritic}/gu, "")
                         .toLowerCase()
                         .trim();
                    return t.includes("historial de las ofertas");
               },
               { timeout: 10000 }
          )
          .then(() => true)
          .catch(() => false);

     // Cierra el modal (botón de cierre o via jQuery si está disponible)
     await page
          .evaluate(() => {
               const btn = document.querySelector(
                    '#resultados [data-dismiss="modal"], #resultados .modal-header .close'
               ) as HTMLElement | null;
               if (btn) {
                    btn.click();
               } else if ((window as any).$) {
                    (window as any)("#resultados").modal("hide");
               } else {
                    const m = document.getElementById("resultados");
                    if (m) m.classList.remove("in", "show");
               }
          })
          .catch(() => {});

     return found;
}

/**
 * Abre el modal "Ver resultados" de la fila de datos #rowIndex (0-based) y
 * devuelve sus participaciones. Omite la segunda fila de datos del modal.
 */
export async function extractParticipationsForRow(page: Page, rowIndex: number): Promise<Participation[]> {
     // 1) Obtener el href del link dentro de la fila de datos N
     const href = await page.$$eval(
          "#body_table_listas tr",
          (trs, idx) => {
               const dataRows = (trs as Element[]).filter((tr) => tr.querySelectorAll("td").length >= 3);
               const tr = dataRows[idx as number];
               if (!tr) return null;
               const a = tr.querySelector('a[href*="/pendientes/participacion/ver/"]') as HTMLAnchorElement | null;
               return a?.getAttribute("href") || null;
          },
          rowIndex
     );

     if (!href) return [];

     // 2) Espera la respuesta Ajax que carga el modal
     const respWait = page
          .waitForResponse((r) => r.url().includes(href) && r.status() === 200, { timeout: 15000 })
          .catch(() => null);

     // 3) Click al link del modal dentro de esa fila
     await page.$$eval(
          "#body_table_listas tr",
          (trs, idx) => {
               const dataRows = (trs as Element[]).filter((tr) => tr.querySelectorAll("td").length >= 3);
               const tr = dataRows[idx as number] as HTMLElement | undefined;
               if (!tr) return;
               const a = tr.querySelector('a[href*="/pendientes/participacion/ver/"]') as HTMLAnchorElement | null;
               if (a) (a as any).click();
          },
          rowIndex
     );

     await respWait;

     // 4) Esperar a que el modal esté visible y con la tabla cargada
     await page
          .waitForSelector('#resultados.in, #resultados.show, #resultados[aria-hidden="false"]', { timeout: 10000 })
          .catch(() => {});
     await page.waitForSelector("#resultados .modal-content table tbody", { timeout: 10000 });

     // 5) Extraer strings crudos (y saltar la segunda fila del modal)
     const rawRows = await page.$$eval("#resultados .modal-content table tbody tr", (trs) => {
          const dataRows = (trs as Element[]).filter((tr) => tr.querySelectorAll("td").length >= 3);
          const picked = dataRows.filter((_r, idx) => idx !== 1); // omite la segunda fila

          return picked.map((tr) => {
               const tds = tr.querySelectorAll("td");
               const precioRaw = (tds[0].textContent || "").replace(/\s+/g, " ").trim(); // "$ 1.569,00 ..."
               const proveedor = (tds[1].textContent || "").replace(/\s+/g, " ").trim();
               const fechaRaw = (tds[2].textContent || "").replace(/\s+/g, " ").trim(); // "28-02-2025 14:13:31"
               return { proveedor, precioRaw, fechaRaw };
          });
     });

     // 6) Cerrar el modal
     await page
          .evaluate(() => {
               const btn = document.querySelector(
                    '#resultados [data-dismiss="modal"], #resultados .modal-header .close'
               ) as HTMLElement | null;
               if (btn) btn.click();
               else if ((window as any).$) (window as any)("#resultados").modal("hide");
               else {
                    const m = document.getElementById("resultados");
                    if (m) m.classList.remove("in", "show");
               }
          })
          .catch(() => {});

     return rawRows.map((r) => ({
          orden_id: null,
          proveedor_id: r.proveedor,
          precio_ofertado: toFloatPrice(r.precioRaw) ?? 0,
          fecha_oferta: toSqlDateTime(r.fechaRaw) ?? r.fechaRaw,
     }));
}

/** Lee el encabezado del panel y devuelve el tipo_id:
 *  1 = "Órdenes de mejor oferta"
 *  2 = "Órdenes de gran compra (mejor oferta)"
 *  3 = "Órdenes de gran compra (Puja)"
 */
export async function getTipoIdFromHeading(page: Page): Promise<number> {
     const raw = await page.$eval("#tabla_gcmo .panel-heading", (el) => el.textContent || "").catch(() => "");

     const t = raw
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .replace(/\s+/g, " ")
          .trim();

     if (t.includes("gran compra") && t.includes("puja")) return 3; // Gran Compra Puja
     if (t.includes("gran compra") && t.includes("mejor oferta")) return 2; // Gran Compra Mejor Oferta
     if (t.includes("mejor oferta")) return 1; // Mejor Oferta
     return 1;
}
