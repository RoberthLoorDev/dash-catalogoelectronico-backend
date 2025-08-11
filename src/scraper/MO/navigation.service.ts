import puppeteer, { Browser, HTTPResponse, Page } from "puppeteer";
import { dbConfig } from "../../config";

const BASE = "https://catalogoelectronico.compraspublicas.gob.ec";

export async function launchBrowser(): Promise<Browser> {
     const browser = await puppeteer.launch({
          headless: true, // o "new"
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
     });
     return browser;
}

export async function newPage(browser: Browser): Promise<Page> {
     const page = await browser.newPage();
     await page.setViewport({ width: 1366, height: 800 });
     await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
     );
     page.setDefaultTimeout(45000);
     return page;
}

export async function gotoAndMaybeAcceptCookies(page: Page, url: string): Promise<HTTPResponse | null> {
     const resp = await page.goto(url, { waitUntil: "networkidle2" });
     // Aceptar cookies si aparece
     try {
          const cookieBtn = await page.$("a.cc-btn.cc-dismiss");
          if (cookieBtn) {
               await cookieBtn.click();
               await new Promise((resolve) => setTimeout(resolve, 800));
          }
     } catch {}
     return resp;
}

export async function needsLogin(page: Page): Promise<boolean> {
     const url = page.url();
     if (url.includes("/entrar")) return true;
     const hasRuc = await page.$("#ruc");
     const hasUser = await page.$("#username");
     const hasPass = await page.$("#password");
     return !!(hasRuc && hasUser && hasPass);
}

export async function doLogin(page: Page): Promise<void> {
     console.log("🔐 Intentando iniciar sesión…");
     // Ir al home por si el botón "Iniciar sesión" está allí
     await gotoAndMaybeAcceptCookies(page, BASE + "/");

     // Click en "Iniciar sesión"
     const clicked = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll("a"));
          const loginLink =
               anchors.find((a) => a.textContent?.trim().toLowerCase().includes("iniciar sesión")) ||
               anchors.find((a) => a.href?.includes("/entrar"));
          if (loginLink) {
               (loginLink as HTMLElement).click();
               return true;
          }
          return false;
     });

     if (!clicked) {
          throw new Error("No se encontró el enlace 'Iniciar sesión'.");
     }

     await page.waitForNavigation({ waitUntil: "networkidle2" });

     // Completar formularios
     await page.waitForSelector("#ruc");
     await page.type("#ruc", dbConfig.webRuc, { delay: 20 });
     await page.type("#username", dbConfig.webUsuario, { delay: 20 });
     await page.type("#password", dbConfig.webClave, { delay: 20 });

     // Click en "Entrar"
     const clickedEntrar = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const enterBtn = buttons.find((b) => b.textContent?.trim().toLowerCase().includes("entrar"));
          if (enterBtn) {
               (enterBtn as HTMLElement).click();
               return true;
          }
          return false;
     });

     if (!clickedEntrar) {
          throw new Error("No se encontró el botón 'Entrar'.");
     }

     await page.waitForNavigation({ waitUntil: "networkidle2" });
     console.log("✅ Sesión iniciada (navegación completada). URL actual:", page.url());
}
