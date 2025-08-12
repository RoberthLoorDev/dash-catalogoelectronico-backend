import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface CategoriaAttrs {
     id: number;
     nombre: string;
}
export type CategoriaCreationAttrs = Optional<CategoriaAttrs, "id">;

export const defineCategoriaModel = (sequelize: Sequelize) => {
     const Categoria = sequelize.define(
          "categorias",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               nombre: { type: DataTypes.STRING(191), allowNull: false, unique: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "categorias",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<CategoriaAttrs, CategoriaCreationAttrs>;
     return Categoria;
};
