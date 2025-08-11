import express from "express";
import "dotenv/config";
import { connectDB } from "./src/db";
import sequelize from "./src/db";
import { initModels } from "./src/db/initModels";
import routes from "./src/routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get("/health", (_req, res) => {
     res.json({ ok: true, service: "api", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
     res.send("API Express + TypeScript lista 🚀");
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
     const status = err?.status || 500;
     res.status(status).json({ error: err?.message || "Unexpected error" });
});

connectDB()
     .then(async () => {
          console.log("🟢 Base de datos conectada correctamente");
          const models = initModels(sequelize);
          await sequelize.sync();
          console.log("📦 Tablas sincronizadas correctamente");
          app.use("/api", routes(models));
     })
     .catch(() => {
          console.log("🔴 No se pudo conectar a la base de datos");
     });

app.listen(PORT, () => {
     console.log(`API escuchando en http://localhost:${PORT}`);
});
