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
          },
          { tableName: "proveedores", timestamps: false }
     ) as ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>;
     return Proveedor;
};
