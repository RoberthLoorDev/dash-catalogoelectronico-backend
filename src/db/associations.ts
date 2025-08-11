import type { Models } from "./initModels.js";

export const setupAssociations = (m: Models) => {
     const {
          Usuario,
          Rol,
          Accion,
          Incidencia,
          Notificacion,
          Categoria,
          Entidad,
          Marca,
          Proveedor,
          Tipo,
          Orden,
          Participacion,
          Sesion,
     } = m;

     Rol.hasMany(Usuario, { foreignKey: "role_id" });
     Usuario.belongsTo(Rol, { foreignKey: "role_id" });

     Usuario.hasMany(Accion, { foreignKey: "usuario_id" });
     Accion.belongsTo(Usuario, { foreignKey: "usuario_id" });

     Usuario.hasMany(Incidencia, { foreignKey: "usuario_id" });
     Incidencia.belongsTo(Usuario, { foreignKey: "usuario_id" });

     Usuario.hasMany(Notificacion, { foreignKey: "usuario_id" });
     Notificacion.belongsTo(Usuario, { foreignKey: "usuario_id" });

     Categoria.hasMany(Orden, { foreignKey: "categoria_id" });
     Orden.belongsTo(Categoria, { foreignKey: "categoria_id" });

     Entidad.hasMany(Orden, { foreignKey: "entidad_id" });
     Orden.belongsTo(Entidad, { foreignKey: "entidad_id" });

     Marca.hasMany(Orden, { foreignKey: "marca_id" });
     Orden.belongsTo(Marca, { foreignKey: "marca_id" });

     Tipo.hasMany(Orden, { foreignKey: "tipo_id" });
     Orden.belongsTo(Tipo, { foreignKey: "tipo_id" });

     Proveedor.hasMany(Orden, { foreignKey: "ganador_proveedor_id", as: "OrdenesGanadas" });
     Proveedor.hasMany(Orden, { foreignKey: "segundo_proveedor_id", as: "OrdenesSegundas" });
     Orden.belongsTo(Proveedor, { foreignKey: "ganador_proveedor_id", as: "Ganador" });
     Orden.belongsTo(Proveedor, { foreignKey: "segundo_proveedor_id", as: "Segundo" });

     Orden.hasMany(Participacion, { foreignKey: "orden_id" });
     Participacion.belongsTo(Orden, { foreignKey: "orden_id" });

     Proveedor.hasMany(Participacion, { foreignKey: "proveedor_id" });
     Participacion.belongsTo(Proveedor, { foreignKey: "proveedor_id" });

     Usuario.hasMany(Sesion, { foreignKey: "usuario_id" });
     Sesion.belongsTo(Usuario, { foreignKey: "usuario_id" });
};
