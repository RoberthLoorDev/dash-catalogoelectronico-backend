import { Router } from "express";
import usuarioRoute from "./usuario.route";
import type { Models } from "../db/initModels";

export default function (models: Models) {
     const router = Router();
     router.use("/usuario", usuarioRoute(models.UsuarioModel));
     return router;
}
