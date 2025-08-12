import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface ProveedorAttrs {
     id: number;
     nombre: string;
}
export type ProveedorCreationAttrs = Optional<ProveedorAttrs, "id">;

export const defineProveedorModel = (sequelize: Sequelize) => {
     const Proveedor = sequelize.define(
          "proveedores",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               nombre: { type: DataTypes.STRING(191), allowNull: false, unique: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          { tableName: "proveedores", timestamps: true, createdAt: "created_at", updatedAt: "updated_at", deletedAt: "delete_at" }
     ) as ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>;
     return Proveedor;
};
