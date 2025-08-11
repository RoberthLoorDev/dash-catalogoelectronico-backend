import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { validateFields } from "../utils/validateFields";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// simple: 3–20 chars, letras, números, _ . -
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,20}$/;

function sanitizeUser(u: any) {
     const json = typeof u.toJSON === "function" ? u.toJSON() : u;
     delete json.password_hash;
     return json;
}

export const register = (UsuarioModel: any) => async (req: Request, res: Response) => {
     try {
          const requiredFields = ["nombre", "email", "username", "password"];
          const missingFields = validateFields(req.body, requiredFields);
          if (missingFields.length > 0) {
               return res.status(400).json({
                    success: false,
                    message: `Faltan campos requeridos: ${missingFields.join(", ")}`,
                    data: { missingFields },
               });
          }

          const { nombre, email, username, password } = req.body;

          // ✔️ Validación de username
          if (!USERNAME_RE.test(String(username))) {
               return res.status(400).json({
                    success: false,
                    message: "Username inválido. Usa 3-20 caracteres: letras, números, punto, guion y guion_bajo.",
                    data: null,
               });
          }

          // ✔️ Unicidad email / username
          const exists = await UsuarioModel.findOne({
               where: { [Op.or]: [{ email }, { username }] },
          });
          if (exists) {
               const clash = exists.email === email ? "email" : exists.username === username ? "username" : "dato";
               return res.status(409).json({ success: false, message: `El ${clash} ya está en uso`, data: null });
          }

          const password_hash = await bcrypt.hash(password, 10);

          const nuevoUsuario = await UsuarioModel.create({
               nombre,
               email,
               username,
               password_hash,
          });

          return res.status(201).json({
               success: true,
               message: "Usuario registrado exitosamente",
               data: sanitizeUser(nuevoUsuario),
          });
     } catch (error) {
          return res.status(500).json({ success: false, message: "Error en el registro", data: error });
     }
};

export const login = (UsuarioModel: any) => async (req: Request, res: Response) => {
     try {
          const requiredFields = ["email", "password"];
          const missingFields = validateFields(req.body, requiredFields);
          if (missingFields.length > 0) {
               return res.status(400).json({
                    success: false,
                    message: `Faltan campos requeridos: ${missingFields.join(", ")}`,
                    data: { missingFields },
               });
          }

          const { email, password } = req.body;

          const usuario = await UsuarioModel.findOne({ where: { email } });
          if (!usuario) {
               return res.status(404).json({ success: false, message: "Usuario no encontrado", data: null });
          }

          const ok = await bcrypt.compare(password, usuario.password_hash);
          if (!ok) {
               return res.status(401).json({ success: false, message: "Contraseña incorrecta", data: null });
          }

          const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
               expiresIn: "1h",
          });

          return res.status(200).json({
               success: true,
               message: "Login exitoso",
               data: { token, usuario: sanitizeUser(usuario) },
          });
     } catch (error) {
          return res.status(500).json({ success: false, message: "Error en el login", data: error });
     }
};
