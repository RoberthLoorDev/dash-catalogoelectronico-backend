import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface IncidenciaAttrs {
     id: number;
     titulo: string;
     descripcion: string;
     fecha_hora: Date;
     usuario_id?: number | null;
     estado: string;
     prioridad: string;
     external_id?: string | null;
}
export type IncidenciaCreationAttrs = Optional<
     IncidenciaAttrs,
     "id" | "fecha_hora" | "usuario_id" | "estado" | "prioridad" | "external_id"
>;

export const defineIncidenciaModel = (sequelize: Sequelize) => {
     const Incidencia = sequelize.define(
          "incidencias",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               titulo: { type: DataTypes.STRING(191), allowNull: false },
               descripcion: { type: DataTypes.TEXT, allowNull: false },
               fecha_hora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "abierto" },
               prioridad: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "media" },
               external_id: { type: DataTypes.STRING(191), allowNull: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "incidencias",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<IncidenciaAttrs, IncidenciaCreationAttrs>;
     return Incidencia;
};
