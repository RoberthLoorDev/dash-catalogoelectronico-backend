import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface ParticipacionAttrs {
     id: number;
     orden_id: number;
     proveedor_id: number;
     precio_ofertado: string; // DECIMAL
     fecha_oferta?: Date | null;
     created_at?: Date;
}
export type ParticipacionCreationAttrs = Optional<ParticipacionAttrs, "id" | "fecha_oferta" | "created_at">;

export const defineParticipacionModel = (sequelize: Sequelize) => {
     const Participacion = sequelize.define(
          "participaciones",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               orden_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
               proveedor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
               precio_ofertado: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
               fecha_oferta: { type: DataTypes.DATE, allowNull: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "participaciones",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
               indexes: [{ name: "uniq_orden_proveedor", unique: true, fields: ["orden_id", "proveedor_id"] }],
          }
     ) as ModelDefined<ParticipacionAttrs, ParticipacionCreationAttrs>;
     return Participacion;
};
