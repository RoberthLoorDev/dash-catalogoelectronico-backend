import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface RolAttrs {
     id: number;
     nombre: string;
     descripcion?: string | null;
}
export type RolCreationAttrs = Optional<RolAttrs, "id" | "descripcion">;

export const defineRolModel = (sequelize: Sequelize) => {
     const Rol = sequelize.define(
          "roles",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               nombre: { type: DataTypes.STRING(191), allowNull: false, unique: true },
               descripcion: { type: DataTypes.TEXT, allowNull: true },
          },
          { tableName: "roles", timestamps: false }
     ) as ModelDefined<RolAttrs, RolCreationAttrs>;
     return Rol;
};
