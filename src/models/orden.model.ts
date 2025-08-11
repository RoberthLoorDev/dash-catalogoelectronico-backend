import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface OrdenAttrs {
     id: number;
     tipo_id: number;
     entidad_id?: number | null;
     entidad_nombre_raw?: string | null;
     producto_raw: string;
     producto_norm: string;
     cantidad: number;
     fecha_cierre: Date;
     fecha_hist?: Date | null;
     oc_numero?: string | null;
     precio_referencial?: string | null; // DECIMAL
     categoria_id?: number | null;
     marca_id?: number | null;
     ganador_proveedor_id?: number | null;
     precio_ganador?: string | null; // DECIMAL
     segundo_proveedor_id?: number | null;
     precio_segundo?: string | null; // DECIMAL
     created_at?: Date;
     updated_at?: Date;
}
export type OrdenCreationAttrs = Optional<
     OrdenAttrs,
     | "id"
     | "entidad_id"
     | "entidad_nombre_raw"
     | "fecha_hist"
     | "oc_numero"
     | "precio_referencial"
     | "categoria_id"
     | "marca_id"
     | "ganador_proveedor_id"
     | "precio_ganador"
     | "segundo_proveedor_id"
     | "precio_segundo"
     | "created_at"
     | "updated_at"
>;

export const defineOrdenModel = (sequelize: Sequelize) => {
     const Orden = sequelize.define(
          "ordenes",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               tipo_id: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
               entidad_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               entidad_nombre_raw: { type: DataTypes.TEXT, allowNull: true },
               producto_raw: { type: DataTypes.TEXT, allowNull: false },
               producto_norm: { type: DataTypes.TEXT, allowNull: false },
               cantidad: { type: DataTypes.INTEGER, allowNull: false },
               fecha_cierre: { type: DataTypes.DATE, allowNull: false },
               fecha_hist: { type: DataTypes.DATE, allowNull: true },
               oc_numero: { type: DataTypes.STRING(191), allowNull: true },
               precio_referencial: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
               categoria_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               marca_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               ganador_proveedor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               precio_ganador: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
               segundo_proveedor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               precio_segundo: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
          },
          { tableName: "ordenes", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
     ) as ModelDefined<OrdenAttrs, OrdenCreationAttrs>;
     return Orden;
};
