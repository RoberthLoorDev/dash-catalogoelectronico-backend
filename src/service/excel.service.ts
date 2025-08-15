import { Op, Transaction, Sequelize } from "sequelize";
import type { Models } from "../db/initModels";

export type EnrichInputRow = {
     producto: string;
     ordenCompra: string;
     cantidad: number;
     entidad: string;
     finalizacion: string; // "DD-MM-YYYY HH:mm[:ss]" o "DD/MM/YYYY HH:mm[:ss]"
     canal?: string;
     precio?: number;
     referencial?: number;
     marca?: string;
};

type UpdatedItem = { index: number; status: "updated"; ordenId: number; updatedFields: string[] };
type NotFoundItem = { index: number; status: "not_found"; reason: string; candidates?: number[] };
type AmbiguousItem = { index: number; status: "ambiguous"; reason: string; candidates: number[] };
export type EnrichResultItem = UpdatedItem | NotFoundItem | AmbiguousItem;
export type EnrichBatchResult = { items: EnrichResultItem[] };

export class EnrichOrdenesService {
     private sequelize: Sequelize;
     private m: Models;

     constructor(sequelize: Sequelize, models: Models) {
          this.sequelize = sequelize;
          this.m = models;
     }

     // --- utils ---
     private normalize(s?: string): string {
          if (!s) return "";
          return s
               .toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "") // acentos
               .replace(/--\s*migrar/g, "") // "-- MIGRAR"
               .replace(/\(.*?\)/g, "") // paréntesis
               .replace(/\s+/g, " ")
               .trim();
     }

     /** Devuelve "YYYY-MM" para filtrar por mes/año, soporta "-" o "/" y HH:mm o HH:mm:ss */
     private monthKeyFromExcelDate(s: string): string | null {
          if (!s) return null;
          const clean = s.trim().replace(/\s+/g, " ");
          const datePart = clean.split(" ")[0]; // "DD-MM-YYYY" o "DD/MM/YYYY"
          const normalized = datePart.replace(/\//g, "-"); // unifico a "DD-MM-YYYY"
          const parts = normalized.split("-");
          if (parts.length !== 3) return null;
          const [dd, mm, yyyy] = parts;
          if (!yyyy || !mm) return null;
          return `${yyyy}-${String(mm).padStart(2, "0")}`;
     }

     /** Parse a Date from "DD-MM-YYYY HH:mm[:ss]" o "DD/MM/YYYY HH:mm[:ss]" */
     private parseExcelDate(s: string): Date | null {
          if (!s) return null;
          const clean = s.trim().replace(/\s+/g, " ");
          const [datePart, timePartRaw] = clean.split(" ");
          if (!datePart) return null;

          const [dd, mm, yyyy] = datePart.replace(/\//g, "-").split("-");
          if (!dd || !mm || !yyyy) return null;

          const timePart = (timePartRaw ?? "00:00:00").split(":");
          const hh = Number(timePart[0] ?? 0);
          const mi = Number(timePart[1] ?? 0);
          const ss = Number(timePart[2] ?? 0);

          const year = Number(yyyy);
          const monthIdx = Number(mm) - 1;
          const day = Number(dd);

          // construyo en local; si quieres UTC, usa Date.UTC(...)
          const d = new Date(year, monthIdx, day, hh, mi, ss, 0);
          return isNaN(d.getTime()) ? null : d;
     }

     /** "YYYY-MM-DD HH:mm:ss" */
     private toMySQLDateTime(d: Date): string {
          const pad = (n: number) => String(n).padStart(2, "0");
          const yyyy = d.getFullYear();
          const mm = pad(d.getMonth() + 1);
          const dd = pad(d.getDate());
          const hh = pad(d.getHours());
          const mi = pad(d.getMinutes());
          const ss = pad(d.getSeconds());
          return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
     }

     private async findOrCreateEntidad(nombre: string | undefined, tx: Transaction): Promise<number | null> {
          if (!nombre || !nombre.trim()) return null;
          const clean = nombre.trim();
          const [inst] = await this.m.EntidadModel.findOrCreate({
               where: { nombre: clean },
               defaults: { nombre: clean },
               transaction: tx,
          });
          return Number(inst.get("id"));
     }

     private async findOrCreateMarca(nombre: string | undefined, tx: Transaction): Promise<number | null> {
          if (!nombre || !nombre.trim()) return null;
          const clean = nombre.trim();
          const [inst] = await this.m.MarcaModel.findOrCreate({
               where: { nombre: clean },
               defaults: { nombre: clean },
               transaction: tx,
          });
          return Number(inst.get("id"));
     }

     // --- matching ---
     private async findUniqueOrdenCandidate(row: EnrichInputRow) {
          const { OrdenModel, ProveedorModel } = this.m;

          const normInput = this.normalize(row.producto);
          const likeKey = normInput.split(" ").filter(Boolean).slice(0, 3).join(" ");

          let candidates = await OrdenModel.findAll({
               where: { producto_raw: { [Op.like]: `%${likeKey}%` } },
               attributes: ["id", "producto_raw", "cantidad", "precio_ganador", "fecha_cierre", "ganador_proveedor_id"],
               order: [["id", "ASC"]],
          });

          candidates = candidates.filter((c) => this.normalize(String(c.get("producto_raw"))).includes(normInput));
          if (candidates.length <= 1) return candidates;

          // 2) cantidad
          candidates = candidates.filter((c) => Number(c.get("cantidad")) === Number(row.cantidad));
          if (candidates.length <= 1) return candidates;

          // 3) precio_ganador
          if (row.precio != null) {
               const p = Number(row.precio);
               candidates = candidates.filter((c) => {
                    const cg = Number(c.get("precio_ganador"));
                    return !isNaN(cg) && Math.abs(cg - p) < 0.5;
               });
               if (candidates.length <= 1) return candidates;
          }

          // 4) mes/año
          const keyMonth = this.monthKeyFromExcelDate(row.finalizacion);
          if (keyMonth) {
               candidates = candidates.filter((c) => {
                    const d = c.get("fecha_cierre") as Date;
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                    return `${yyyy}-${mm}` === keyMonth;
               });
               if (candidates.length <= 1) return candidates;
          }

          // 5) canal -> buscar proveedor y filtrar por ganador_proveedor_id
          if (row.canal) {
               const proveedor = await ProveedorModel.findOne({
                    where: { nombre: { [Op.like]: `%${row.canal.trim()}%` } },
                    attributes: ["id"],
               });
               if (proveedor) {
                    const provId = Number(proveedor.get("id"));
                    candidates = candidates.filter((c) => Number(c.get("ganador_proveedor_id")) === provId);
               }
          }

          return candidates;
     }

     // --- público ---
     async processBatch(rows: EnrichInputRow[]): Promise<EnrichBatchResult> {
          const items: EnrichResultItem[] = [];

          for (let i: number = 0; i < rows.length; i++) {
               const row = rows[i];

               const t = await this.sequelize.transaction();
               try {
                    const candidates = await this.findUniqueOrdenCandidate(row);

                    if (!candidates || candidates.length === 0) {
                         await t.rollback();
                         items.push({ index: i, status: "not_found", reason: "Sin coincidencias después de aplicar filtros" });
                         continue;
                    }
                    if (candidates.length > 1) {
                         await t.rollback();
                         items.push({
                              index: i,
                              status: "ambiguous",
                              reason: "Múltiples coincidencias",
                              candidates: candidates.map((c) => Number(c.get("id"))),
                         });
                         continue;
                    }

                    const match = candidates[0];
                    const ordenId = Number(match.get("id"));

                    // upserts
                    const entidadId = await this.findOrCreateEntidad(row.entidad, t);
                    const marcaId = await this.findOrCreateMarca(row.marca, t);

                    // fecha
                    const parsed = this.parseExcelDate(row.finalizacion);
                    const mysqlDate = parsed ? this.toMySQLDateTime(parsed) : null;

                    const updates: Record<string, unknown> = {};
                    const updatedFields: string[] = [];

                    if (entidadId) {
                         updates.entidad_id = entidadId;
                         updatedFields.push("entidad_id");
                    }
                    if (row.ordenCompra) {
                         updates.oc_numero = row.ordenCompra;
                         updatedFields.push("oc_numero");
                    }
                    if (marcaId) {
                         updates.marca_id = marcaId;
                         updatedFields.push("marca_id");
                    }
                    if (mysqlDate) {
                         updates.fecha_cierre = mysqlDate;
                         updatedFields.push("fecha_cierre");
                    }

                    if (updatedFields.length === 0) {
                         await t.rollback();
                         items.push({ index: i, status: "not_found", reason: "No había campos válidos para actualizar" });
                         continue;
                    }

                    await this.m.OrdenModel.update(updates, { where: { id: ordenId }, transaction: t });

                    await t.commit();
                    items.push({ index: i, status: "updated", ordenId, updatedFields });
               } catch (err) {
                    await t.rollback();
                    const msg = err instanceof Error ? err.message : "Error procesando item";
                    items.push({ index: i, status: "not_found", reason: msg });
               }
          }

          return { items };
     }
}
