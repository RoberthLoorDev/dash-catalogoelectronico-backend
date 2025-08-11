import { Router } from "express";
import { register, login } from "../controllers/usuario.controller";
import type { Models } from "../db/initModels";

export default function (usuarioModel: Models["UsuarioModel"]) {
     const router = Router();
     router.post("/register", register(usuarioModel));
     router.post("/login", login(usuarioModel));
     return router;
}
