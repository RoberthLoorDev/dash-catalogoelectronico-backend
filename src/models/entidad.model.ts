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
          },
          { tableName: "entidades", timestamps: false }
     ) as ModelDefined<EntidadAttrs, EntidadCreationAttrs>;
     return Entidad;
};
