import { Router } from "express";
import usuarioRoute from "./usuario.route";
import scraperRoute from "./scraper.route";
import enrichRoute from "./excel.route";
import type { Models } from "../db/initModels";
import sequelize from "../db";

export default function (models: Models) {
     const router = Router();
     router.use("/usuario", usuarioRoute(models.UsuarioModel));
     router.use("/scrape", scraperRoute);
     router.use("/ordenes", enrichRoute(models, sequelize));
     return router;
}
