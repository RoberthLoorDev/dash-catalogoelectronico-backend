import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface UsuarioAttrs {
     id: number;
     nombre: string;
     email: string;
     password_hash: string;
     email_verificado: boolean;
     created_at?: Date;
     updated_at?: Date;
     deleted_at?: Date | null;
     username: string;
     role_id?: number | null;
}
export type UsuarioCreationAttrs = Optional<
     UsuarioAttrs,
     "id" | "email_verificado" | "created_at" | "updated_at" | "deleted_at" | "role_id"
>;

export const defineUsuarioModel = (sequelize: Sequelize) => {
     const Usuario = sequelize.define(
          "usuarios",
          {
               id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },

               nombre: { type: DataTypes.STRING(191), allowNull: false },
               email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
               password_hash: { type: DataTypes.STRING(191), allowNull: false },
               email_verificado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
               username: { type: DataTypes.STRING(191), allowNull: false, unique: true },
               role_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

               created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
               deleted_at: { type: DataTypes.DATE, allowNull: true },
          },
          {
               tableName: "usuarios",
               timestamps: true,
               createdAt: "created_at",
               updatedAt: "updated_at",
               paranoid: true,
               deletedAt: "deleted_at",
          }
     ) as ModelDefined<UsuarioAttrs, UsuarioCreationAttrs>;
     return Usuario;
};
