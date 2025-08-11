import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface MarcaAttrs {
     id: number;
     nombre: string;
}
export type MarcaCreationAttrs = Optional<MarcaAttrs, "id">;

export const defineMarcaModel = (sequelize: Sequelize) => {
     const Marca = sequelize.define(
          "marcas",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               nombre: { type: DataTypes.STRING(191), allowNull: false, unique: true },
          },
          { tableName: "marcas", timestamps: false }
     ) as ModelDefined<MarcaAttrs, MarcaCreationAttrs>;
     return Marca;
};
