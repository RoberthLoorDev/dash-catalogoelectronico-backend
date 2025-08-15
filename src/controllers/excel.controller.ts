import { Request, Response } from "express";
import type { Models } from "../db/initModels";
import type { Sequelize } from "sequelize";
import { EnrichOrdenesService, EnrichBatchResult, EnrichInputRow } from "../service/excel.service";

export const enrichOrdenesController =
     (models: Models, sequelize: Sequelize) =>
     async (req: Request, res: Response): Promise<void> => {
          try {
               const payload = req.body;

               if (!Array.isArray(payload) || payload.length === 0) {
                    res.status(400).json({ ok: false, error: "El body debe ser un array con al menos 1 elemento" });
                    return;
               }

               const service = new EnrichOrdenesService(sequelize, models);
               const result: EnrichBatchResult = await service.processBatch(payload as EnrichInputRow[]);

               const allOk = result.items.every((i) => i.status === "updated");
               const allFail = result.items.every((i) => i.status !== "updated");
               const status = allOk ? 200 : allFail ? 422 : 207;

               res.status(status).json({ ok: true, ...result });
          } catch (err) {
               const msg = err instanceof Error ? err.message : "Error interno";
               console.error(err);
               res.status(500).json({ ok: false, error: msg });
          }
     };
