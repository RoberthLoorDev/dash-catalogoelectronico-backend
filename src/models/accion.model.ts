import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface AccionAttrs {
     id: number;
     usuario_id: number;
     accion: string;
     descripcion?: string | null;
     fecha_hora: Date;
     tipo: string;
     titulo?: string | null;
     external_id?: string | null;
     datos_anteriores?: object | null;
}
export type AccionCreationAttrs = Optional<
     AccionAttrs,
     "id" | "descripcion" | "fecha_hora" | "titulo" | "external_id" | "datos_anteriores"
>;

export const defineAccionModel = (sequelize: Sequelize) => {
     const Accion = sequelize.define(
          "acciones",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
               accion: { type: DataTypes.TEXT, allowNull: false },
               descripcion: { type: DataTypes.TEXT, allowNull: true },
               fecha_hora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               tipo: { type: DataTypes.STRING(191), allowNull: false },
               titulo: { type: DataTypes.STRING(191), allowNull: true },
               external_id: { type: DataTypes.STRING(191), allowNull: true },
               datos_anteriores: { type: DataTypes.JSON, allowNull: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "acciones",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<AccionAttrs, AccionCreationAttrs>;
     return Accion;
};
