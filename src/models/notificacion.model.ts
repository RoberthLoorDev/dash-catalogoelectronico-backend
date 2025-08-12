import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface NotificacionAttrs {
     id: number;
     usuario_id?: number | null;
     mensaje: string;
     leido: boolean;
     created_at?: Date;
     titulo: string;
     tipo: string;
     enlace?: string | null;
}
export type NotificacionCreationAttrs = Optional<NotificacionAttrs, "id" | "usuario_id" | "leido" | "created_at" | "enlace">;

export const defineNotificacionModel = (sequelize: Sequelize) => {
     const Notificacion = sequelize.define(
          "notificaciones",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
               usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
               mensaje: { type: DataTypes.TEXT, allowNull: false },
               leido: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               delete_at: { type: DataTypes.DATE, allowNull: true },
               titulo: { type: DataTypes.STRING(191), allowNull: false },
               tipo: { type: DataTypes.STRING(100), allowNull: false },
               enlace: { type: DataTypes.STRING(191), allowNull: true },
          },
          {
               tableName: "notificaciones",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               deletedAt: "delete_at",
          }
     ) as ModelDefined<NotificacionAttrs, NotificacionCreationAttrs>;
     return Notificacion;
};
