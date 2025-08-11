import { DataTypes, ModelDefined, Sequelize } from "sequelize";

export interface TipoAttrs {
     id: number;
     nombre: string;
}
export type TipoCreationAttrs = TipoAttrs;

export const defineTipoModel = (sequelize: Sequelize) => {
     const Tipo = sequelize.define(
          "tipos",
          {
               id: { type: DataTypes.SMALLINT.UNSIGNED, primaryKey: true, allowNull: false },
               nombre: { type: DataTypes.STRING(191), allowNull: false, unique: true },
          },
          { tableName: "tipos", timestamps: false }
     ) as ModelDefined<TipoAttrs, TipoCreationAttrs>;
     return Tipo;
};
