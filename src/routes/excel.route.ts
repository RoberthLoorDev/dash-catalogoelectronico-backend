import { Router } from "express";
import type { Models } from "../db/initModels";
import type { Sequelize } from "sequelize";
import { enrichOrdenesController } from "../controllers/excel.controller";
export default function enrichRoute(models: Models, sequelize: Sequelize) {
     const router = Router();

     router.post("/enrich", enrichOrdenesController(models, sequelize));

     return router;
}
