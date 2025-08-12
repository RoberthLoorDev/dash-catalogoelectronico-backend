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
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "roles",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<RolAttrs, RolCreationAttrs>;
     return Rol;
};
