import { Sequelize, Transaction, ModelDefined } from "sequelize";
import { Models } from "../../db/initModels";
import { HistRow, Participation } from "../../scraper/MO/types";
import { addHoursToSqlDateTime, normalizeProductName } from "../../scraper/MO/normalize.utils";

// Cache en memoria para minimizar lecturas de proveedor
const provCache = new Map<string, number>();

async function getOrCreateProveedorId(proveedorModel: ModelDefined<any, any>, nombre: string, tx: Transaction): Promise<number> {
     const key = normalizeProductName(nombre);
     if (provCache.has(key)) return provCache.get(key)!;

     // Busca exacto por nombre (tienes unique en nombre)
     const [prov] = await proveedorModel.findOrCreate({
          where: { nombre },
          defaults: { nombre },
          transaction: tx,
     });

     const id = Number(prov.get("id"));
     provCache.set(key, id);
     return id;
}

/** Dado un arreglo ya normalizado de participaciones, computa:
 * - ganador (índice 0) y segundo (índice 1) si existen
 * - precio referencial = último precio de la lista (si existe)
 */
function pickGanadorSegundoYReferencia(parts: Participation[]) {
     const ganador = parts[0];
     const segundo = parts[1];
     const ref = parts.length ? parts[parts.length - 1] : undefined;

     return {
          ganador,
          segundo,
          precioReferencial: ref ? ref.precio_ofertado : null,
     };
}

/** Persistir una sola orden (upsert suave por (producto_raw + fecha_hist)) */
async function upsertOrden(models: Models, row: HistRow, tx: Transaction) {
     const { OrdenModel } = models;

     // Busca si ya existe una orden “igual” (heurística simple para evitar duplicados)
     const existente = await OrdenModel.findOne({
          where: {
               producto_raw: row.producto_raw,
               fecha_hist: row.fecha_hist ?? null,
          },
          transaction: tx,
     });

     const producto_norm = normalizeProductName(row.producto_raw);
     // Si no te dan fecha_cierre, usamos fecha_hist como fallback para cumplir el NOT NULL
     const fecha_cierre = addHoursToSqlDateTime(row.fecha_hist, 24) ?? row.fecha_hist;

     // Payload base (las que no tienes quedan null)
     const basePayload: any = {
          tipo_id: row.tipo_id ?? 1,
          entidad_id: null,
          entidad_nombre_raw: null,
          producto_raw: row.producto_raw,
          producto_norm,
          cantidad: row.cantidad ?? 0,
          fecha_cierre,
          fecha_hist: row.fecha_hist ?? null,
          oc_numero: null,
          precio_referencial: null, // lo seteamos luego
          categoria_id: row.categoria_id ?? null,
          marca_id: null,
          ganador_proveedor_id: null,
          precio_ganador: null,
          segundo_proveedor_id: null,
          precio_segundo: null,
     };

     if (!existente) {
          const creado = await OrdenModel.create(basePayload, { transaction: tx });
          return creado;
     } else {
          await existente.update(basePayload, { transaction: tx });
          return existente;
     }
}

/** Persistir participaciones (bulk con upsert) */
async function persistParticipaciones(models: Models, ordenId: number, parts: Participation[], tx: Transaction) {
     const { ParticipacionModel, ProveedorModel } = models;

     const items = [];
     for (const p of parts) {
          const provId = await getOrCreateProveedorId(ProveedorModel, p.proveedor_id, tx);
          items.push({
               orden_id: ordenId,
               proveedor_id: provId,
               // DECIMAL en model => string aquí
               precio_ofertado: toDecStr(p.precio_ofertado)!, // allowNull: false
               // DATE en model => Date aquí
               fecha_oferta: toDateLocal(p.fecha_oferta), // <- ahora es Date|null
          });
     }

     // Evita errores por duplicados (índice único orden_id + proveedor_id)
     await ParticipacionModel.bulkCreate(items, {
          transaction: tx,
          updateOnDuplicate: ["precio_ofertado", "fecha_oferta"],
     });
}

/** Actualiza campos de ganador/segundo/precios en la orden */
async function actualizarOrdenGanadores(models: Models, ordenId: number, parts: Participation[], tx: Transaction) {
     const { OrdenModel, ProveedorModel } = models;

     const { ganador, segundo, precioReferencial } = pickGanadorSegundoYReferencia(parts);

     let ganadorId: number | null = null;
     let segundoId: number | null = null;
     let precio_ganador: number | null = null;
     let precio_segundo: number | null = null;

     if (ganador) {
          ganadorId = await getOrCreateProveedorId(ProveedorModel, ganador.proveedor_id, tx);
          precio_ganador = ganador.precio_ofertado ?? null;
     }
     if (segundo) {
          segundoId = await getOrCreateProveedorId(ProveedorModel, segundo.proveedor_id, tx);
          precio_segundo = segundo.precio_ofertado ?? null;
     }

     await OrdenModel.update(
          {
               ganador_proveedor_id: ganadorId,
               precio_ganador: toDecStr(precio_ganador),
               segundo_proveedor_id: segundoId,
               precio_segundo: toDecStr(precio_segundo),
               precio_referencial: toDecStr(precioReferencial),
          },
          { where: { id: ordenId }, transaction: tx }
     );
}

/** Punto de entrada: persiste todas las rows del scraper */
export async function persistMOResults(sequelize: Sequelize, models: Models, rows: HistRow[]) {
     if (!rows?.length) return { ok: true, created: 0, updated: 0 };

     // peq. cache por corrida
     provCache.clear();

     return await sequelize.transaction(async (tx) => {
          let created = 0;
          let updated = 0;

          for (const row of rows) {
               // 1) Upsert orden base
               const orden = await upsertOrden(models, row, tx);
               const ordenId = Number(orden.get("id"));

               // Para métricas created/updated (heurístico por isNewRecord si aplica)
               if ((orden as any)._options?.isNewRecord) created++;
               else updated++;

               // 2) Participaciones (si vienen)
               const parts = row.participaciones ?? [];
               if (parts.length) {
                    await persistParticipaciones(models, ordenId, parts, tx);
                    await actualizarOrdenGanadores(models, ordenId, parts, tx);
               }
          }

          return { ok: true, created, updated };
     });
}

// Convierte number|null a string|null compatible con DECIMAL(14,2)
function toDecStr(n: number | null | undefined): string | null {
     if (n === null || n === undefined) return null;
     // Aseguramos 2 decimales como texto
     return Number(n).toFixed(2);
}

// "YYYY-MM-DD HH:mm:ss" -> Date (sin cambiar la hora)
// Usa hora local para que no haya corrimientos por zona horaria
function toDateLocal(sql: string | null | undefined): Date | null {
     if (!sql) return null;
     const m = sql.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
     if (!m) return null;
     const [, y, mo, d, h, mi, s] = m.map(Number);
     // new Date(año, mesBase0, día, hora, minuto, segundo) -> hora local
     return new Date(y, mo - 1, d, h, mi, s);
}
