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
     const UsuarioModel = defineUsuarioModel(sequelize);
     const RolModel = defineRolModel(sequelize);
     const AccionModel = defineAccionModel(sequelize);
     const IncidenciaModel = defineIncidenciaModel(sequelize);
     const NotificacionModel = defineNotificacionModel(sequelize);
     const CategoriaModel = defineCategoriaModel(sequelize);
     const EntidadModel = defineEntidadModel(sequelize);
     const MarcaModel = defineMarcaModel(sequelize);
     const ProveedorModel = defineProveedorModel(sequelize);
     const TipoModel = defineTipoModel(sequelize);
     const OrdenModel = defineOrdenModel(sequelize);
     const ParticipacionModel = defineParticipacionModel(sequelize);
     const SesionModel = defineSesionModel(sequelize);

     return {
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
     };
}

export type Models = ReturnType<typeof initModels>;
