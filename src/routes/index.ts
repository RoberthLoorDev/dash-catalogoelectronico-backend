import { Router } from "express";
import usuarioRoute from "./usuario.route";
import scraperRoute from "./scraper.route";
import type { Models } from "../db/initModels";

export default function (models: Models) {
     const router = Router();
     router.use("/usuario", usuarioRoute(models.UsuarioModel));
     router.use("/scrape", scraperRoute);
     return router;
}
