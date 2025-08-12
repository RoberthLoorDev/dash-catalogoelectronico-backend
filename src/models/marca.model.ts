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
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "marcas",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<MarcaAttrs, MarcaCreationAttrs>;
     return Marca;
};
