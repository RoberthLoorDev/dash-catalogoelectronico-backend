import { Sequelize } from "sequelize";
import { defineUsuarioModel } from "../models/usuario.model";
import { defineRolModel } from "../models/rol.model";
import { defineAccionModel } from "../models/accion.model";
import { defineIncidenciaModel } from "../models/incidencia.model";
import { defineNotificacionModel } from "../models/notificacion.model";
import { defineCategoriaModel } from "../models/categoria.model";
import { defineEntidadModel } from "../models/entidad.model";
import { defineMarcaModel } from "../models/marca.model";
import { defineProveedorModel } from "../models/proveedor.model";
import { defineTipoModel } from "../models/tipo.model";
import { defineOrdenModel } from "../models/orden.model";
import { defineParticipacionModel } from "../models/participacion.model";
import { defineSesionModel } from "../models/sesion.model";

export function initModels(sequelize: Sequelize) {
     const Usuario = defineUsuarioModel(sequelize);
     const Rol = defineRolModel(sequelize);
     const Accion = defineAccionModel(sequelize);
     const Incidencia = defineIncidenciaModel(sequelize);
     const Notificacion = defineNotificacionModel(sequelize);
     const Categoria = defineCategoriaModel(sequelize);
     const Entidad = defineEntidadModel(sequelize);
     const Marca = defineMarcaModel(sequelize);
     const Proveedor = defineProveedorModel(sequelize);
     const Tipo = defineTipoModel(sequelize);
     const Orden = defineOrdenModel(sequelize);
     const Participacion = defineParticipacionModel(sequelize);
     const Sesion = defineSesionModel(sequelize);

     return {
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
     };
}

export type Models = ReturnType<typeof initModels>;
