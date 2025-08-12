import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface EntidadAttrs {
     id: number;
     nombre: string;
}
export type EntidadCreationAttrs = Optional<EntidadAttrs, "id">;

export const defineEntidadModel = (sequelize: Sequelize) => {
     const Entidad = sequelize.define(
          "entidades",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               nombre: { type: DataTypes.STRING(191), allowNull: false, unique: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "entidades",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<EntidadAttrs, EntidadCreationAttrs>;
     return Entidad;
};
