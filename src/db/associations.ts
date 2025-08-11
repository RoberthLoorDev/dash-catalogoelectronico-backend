import type { Models } from "./initModels.js";

export const setupAssociations = (m: Models) => {
     const {
          UsuarioModel,
          RolModel,
          AccionModel,
          IncidenciaModel,
          NotificacionModel,
          CategoriaModel,
          EntidadModel,
          MarcaModel,
          ProveedorModel,
          TipoModel,
          OrdenModel,
          ParticipacionModel,
          SesionModel,
     } = m;

     RolModel.hasMany(UsuarioModel, { foreignKey: "role_id" });
     UsuarioModel.belongsTo(RolModel, { foreignKey: "role_id" });

     UsuarioModel.hasMany(AccionModel, { foreignKey: "usuario_id" });
     AccionModel.belongsTo(UsuarioModel, { foreignKey: "usuario_id" });

     UsuarioModel.hasMany(IncidenciaModel, { foreignKey: "usuario_id" });
     IncidenciaModel.belongsTo(UsuarioModel, { foreignKey: "usuario_id" });

     UsuarioModel.hasMany(NotificacionModel, { foreignKey: "usuario_id" });
     NotificacionModel.belongsTo(UsuarioModel, { foreignKey: "usuario_id" });

     CategoriaModel.hasMany(OrdenModel, { foreignKey: "categoria_id" });
     OrdenModel.belongsTo(CategoriaModel, { foreignKey: "categoria_id" });

     EntidadModel.hasMany(OrdenModel, { foreignKey: "entidad_id" });
     OrdenModel.belongsTo(EntidadModel, { foreignKey: "entidad_id" });

     MarcaModel.hasMany(OrdenModel, { foreignKey: "marca_id" });
     OrdenModel.belongsTo(MarcaModel, { foreignKey: "marca_id" });

     TipoModel.hasMany(OrdenModel, { foreignKey: "tipo_id" });
     OrdenModel.belongsTo(TipoModel, { foreignKey: "tipo_id" });

     ProveedorModel.hasMany(OrdenModel, { foreignKey: "ganador_proveedor_id", as: "OrdenesGanadas" });
     ProveedorModel.hasMany(OrdenModel, { foreignKey: "segundo_proveedor_id", as: "OrdenesSegundas" });
     OrdenModel.belongsTo(ProveedorModel, { foreignKey: "ganador_proveedor_id", as: "Ganador" });
     OrdenModel.belongsTo(ProveedorModel, { foreignKey: "segundo_proveedor_id", as: "Segundo" });

     OrdenModel.hasMany(ParticipacionModel, { foreignKey: "orden_id" });
     ParticipacionModel.belongsTo(OrdenModel, { foreignKey: "orden_id" });

     ProveedorModel.hasMany(ParticipacionModel, { foreignKey: "proveedor_id" });
     ParticipacionModel.belongsTo(ProveedorModel, { foreignKey: "proveedor_id" });

     UsuarioModel.hasMany(SesionModel, { foreignKey: "usuario_id" });
     SesionModel.belongsTo(UsuarioModel, { foreignKey: "usuario_id" });
};
