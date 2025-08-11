import dotenv from "dotenv";

dotenv.config();

export const dbConfig = {
     host: process.env.DB_HOST || "localhost",
     port: Number(process.env.DB_PORT) || 3306,
     username: process.env.DB_USER || "root",
     password: process.env.DB_PASSWORD || "",
     database: process.env.DB_NAME || "dashboard",
     dialect: (process.env.DB_DIALECT as any) || "mysql",
     webRuc: process.env.WEB_RUC ?? "",
     webUsuario: process.env.WEB_USUARIO ?? "",
     webClave: process.env.WEB_CLAVE ?? "",
};
