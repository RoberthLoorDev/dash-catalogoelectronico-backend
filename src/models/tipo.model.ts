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
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "tipos",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<TipoAttrs, TipoCreationAttrs>;
     return Tipo;
};
