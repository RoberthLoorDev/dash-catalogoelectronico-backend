import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface SesionAttrs {
     id: number;
     usuario_id: number;
     inicio_sesion?: Date;
     ip_address?: string | null;
}
export type SesionCreationAttrs = Optional<SesionAttrs, "id" | "inicio_sesion" | "ip_address">;

export const defineSesionModel = (sequelize: Sequelize) => {
     const Sesion = sequelize.define(
          "sesiones",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
               inicio_sesion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               ip_address: { type: DataTypes.STRING(191), allowNull: true },
          },
          { tableName: "sesiones", timestamps: false }
     ) as ModelDefined<SesionAttrs, SesionCreationAttrs>;
     return Sesion;
};
