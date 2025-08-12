import { Browser } from "puppeteer";
import { dbConfig } from "../../config";
import { doLogin, gotoAndMaybeAcceptCookies, launchBrowser, needsLogin, newPage } from "./navigation.service";
import { toMonthValue, toNumStr } from "./date-utils";
import {
     extractRowsFromDOM,
     getMaxPageFromDOM,
     ensureResultsLoaded,
     goToPageAndWait,
     extractParticipationsForRow,
     getTipoIdFromHeading,
} from "./participacionMO.dom";
import { CheckMOResult, RangeParams, HistRow } from "./types";
import { computeCategoriaId } from "./category.utils";
import { openFirstDetailModalAndCheck } from "./participacionMO.dom";

const TARGET = "https://catalogoelectronico.compraspublicas.gob.ec/pendientes/participacion/MO";

export async function checkParticipacionMO(range?: RangeParams): Promise<CheckMOResult> {
     let browser: Browser | null = null;

     try {
          console.log("🚀 Iniciando Puppeteer…");
          browser = await launchBrowser();
          const page: any = await newPage(browser);

          console.log("🌐 Abriendo URL objetivo:", TARGET);
          await gotoAndMaybeAcceptCookies(page, TARGET);

          if (await needsLogin(page)) {
               console.log("⚠️ Detectado login requerido.");
               if (!dbConfig.webRuc || !dbConfig.webUsuario || !dbConfig.webClave) {
                    throw new Error("Credenciales no configuradas. Revisa WEB_RUC, WEB_USUARIO, WEB_CLAVE en tu .env");
               }
               await doLogin(page);
               console.log("↩️ Navegando nuevamente a la URL objetivo…");
               await gotoAndMaybeAcceptCookies(page, TARGET);
          } else {
               console.log("ℹ️ No se requiere login. URL actual:", page.url());
          }

          // Verificar el título "Historial de Participación"
          console.log('🔎 Verificando presencia de "Historial de Participación"…');
          await page.waitForSelector("body", { timeout: 15000 });
          const ingresoOk = await page.evaluate(() => {
               const normalize = (s: string) =>
                    s
                         .normalize("NFD")
                         .replace(/\p{Diacritic}/gu, "")
                         .replace(/\s+/g, " ")
                         .toLowerCase()
                         .trim();
               const txt = normalize(document.body.innerText || "");
               return txt.includes("historial") && txt.includes("participacion");
          });

          if (!ingresoOk) {
               console.log('❌ No se encontró el encabezado "Historial de Participación".');
               return { ok: false, reason: 'No se encontró el encabezado "Historial de Participación".' };
          }

          // Healthcheck simple
          if (!range) {
               console.log("🎯 ÉXITO: Ingreso exitoso ✅");
               return { ok: true };
          }

          // ========= Interacción con selects + Buscar =========
          console.log("🗓️ Llenando filtros Desde/Hasta y buscando…");
          await page.waitForSelector("#frmFiltros", { timeout: 15000 });
          await page.waitForSelector("#form_desde_day");
          await page.waitForSelector("#form_desde_month");
          await page.waitForSelector("#form_desde_year");
          await page.waitForSelector("#form_hasta_day");
          await page.waitForSelector("#form_hasta_month");
          await page.waitForSelector("#form_hasta_year");

          const dDay = toNumStr(range.desde.day);
          const dMonth = toMonthValue(range.desde.month);
          const dYear = toNumStr(range.desde.year);
          const hDay = toNumStr(range.hasta.day);
          const hMonth = toMonthValue(range.hasta.month);
          const hYear = toNumStr(range.hasta.year);

          await page.select("#form_desde_day", dDay);
          await page.select("#form_desde_month", dMonth);
          await page.select("#form_desde_year", dYear);
          await page.select("#form_hasta_day", hDay);
          await page.select("#form_hasta_month", hMonth);
          await page.select("#form_hasta_year", hYear);

          // Por si hay listeners de 'change'
          await page.evaluate(() => {
               [
                    "form_desde_day",
                    "form_desde_month",
                    "form_desde_year",
                    "form_hasta_day",
                    "form_hasta_month",
                    "form_hasta_year",
               ].forEach((id) => {
                    const el = document.getElementById(id) as HTMLSelectElement | null;
                    if (el) el.dispatchEvent(new Event("change", { bubbles: true }));
               });
          });

          // Página 1
          await page.$eval("#pagina", (el: any) => (el.value = "1")).catch(() => {});

          // Enviar POST del formulario
          console.log("🔎 Enviando búsqueda…");
          const nav = page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => null);
          await page.evaluate(() => {
               const form = document.getElementById("frmFiltros") as HTMLFormElement | null;
               if (form) form.submit();
          });
          await nav;

          // Esperar resultados reales
          await ensureResultsLoaded(page);

          // Obtener tipo_id del encabezado
          const tipoId = await getTipoIdFromHeading(page);

          // Tabla HTML de página 1
          const tableHtml: string | null = await page
               .$eval("#body_table_listas", (tbody: HTMLElement) => {
                    const table = tbody.closest("table");
                    return table ? table.outerHTML : tbody.outerHTML;
               })
               .catch(() => null);

          // Filas de la página 1
          let allRows: HistRow[] = await extractRowsFromDOM(page);
          allRows = allRows.map((r) => ({ ...r, categoria_id: computeCategoriaId(r.producto_raw), tipo_id: tipoId }));

          // por cada fila visible, abre el modal y agrega participaciones
          for (let i = 0; i < allRows.length; i++) {
               try {
                    allRows[i].participaciones = await extractParticipationsForRow(page, i);
               } catch {
                    allRows[i].participaciones = [];
               }
          }

          // Paginación: páginas 2..N
          const maxPage = await getMaxPageFromDOM(page);
          for (let p = 2; p <= maxPage; p++) {
               console.log(`➡️ Cargando página ${p} de ${maxPage}…`);
               await goToPageAndWait(page, p);
               const rowsPage = await extractRowsFromDOM(page);
               const rowsPageWithCat = rowsPage.map((r) => ({
                    ...r,
                    categoria_id: computeCategoriaId(r.producto_raw),
                    tipo_id: tipoId,
               })); // <--- Aquí se asigna la categoría y el id del tipo

               // modal por fila también en páginas siguientes
               for (let i = 0; i < rowsPageWithCat.length; i++) {
                    try {
                         rowsPageWithCat[i].participaciones = await extractParticipationsForRow(page, i);
                    } catch {
                         rowsPageWithCat[i].participaciones = [];
                    }
               }

               allRows = allRows.concat(rowsPageWithCat);
          }

          if (tableHtml) {
               console.log(`🎯 ÉXITO: Tabla encontrada. Filas totales: ${allRows.length}`);
               return { ok: true, table: tableHtml, rows: allRows };
          }

          console.log("⚠️ No se encontró la tabla de resultados para el rango solicitado.");
          return { ok: false, reason: "No se encontró la tabla de resultados para el rango solicitado." };
     } catch (err: any) {
          console.error("💥 Error en checkParticipacionMO:", err?.message || err);
          return { ok: false, reason: err?.message || "Error desconocido" };
     } finally {
          if (browser) {
               await browser.close();
               console.log("🧹 Navegador cerrado.");
          }
     }
}

// (CLI opcional intacto)
if (process.argv[1]?.includes("participacionMO.scraper.ts")) {
     checkParticipacionMO().then((res) => {
          if (!res.ok) process.exitCode = 1;
     });
}
