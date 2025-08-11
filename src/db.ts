import { Sequelize } from "sequelize";
import { dbConfig } from "./config";

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
     host: dbConfig.host,
     port: dbConfig.port,
     dialect: dbConfig.dialect,
     logging: false,
});

export const connectDB = async () => {
     try {
          await sequelize.authenticate();
          console.log("✅ Conexión exitosa a la base de datos!");
     } catch (error) {
          console.error("❌ Error al conectar a la base de datos:", error);
     }
};

export default sequelize;
