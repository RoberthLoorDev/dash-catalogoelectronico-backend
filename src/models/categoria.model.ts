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
          },
          { tableName: "categorias", timestamps: false }
     ) as ModelDefined<CategoriaAttrs, CategoriaCreationAttrs>;
     return Categoria;
};
