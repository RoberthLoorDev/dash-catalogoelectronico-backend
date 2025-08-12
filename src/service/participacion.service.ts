import { ModelDefined } from "sequelize";
import { ParticipacionAttrs, ParticipacionCreationAttrs } from "../models/participacion.model";

export async function crearParticipacion(
     participacionModel: ModelDefined<ParticipacionAttrs, ParticipacionCreationAttrs>,
     data: Omit<ParticipacionCreationAttrs, "id">
) {
     const existe = await participacionModel.findOne({ where: { orden_id: data.orden_id, proveedor_id: data.proveedor_id } });
     if (existe) {
          return { success: false, message: "La participación ya está registrada para ese proveedor y orden." };
     }
     const participacion = await participacionModel.create(data);
     return { success: true, participacion, message: "Participación creada exitosamente." };
}

export async function actualizarParticipacion(
     participacionModel: ModelDefined<ParticipacionAttrs, ParticipacionCreationAttrs>,
     id: number,
     data: Partial<ParticipacionAttrs>
) {
     const participacion = await participacionModel.findByPk(id);
     if (!participacion) {
          return { success: false, message: "Participación no encontrada." };
     }
     await participacion.update(data);
     return { success: true, participacion, message: "Participación actualizada correctamente." };
}

export async function eliminarParticipacion(
     participacionModel: ModelDefined<ParticipacionAttrs, ParticipacionCreationAttrs>,
     id: number
) {
     const participacion = await participacionModel.findByPk(id);
     if (!participacion) {
          return { success: false, message: "Participación no encontrada." };
     }
     await participacion.destroy();
     return { success: true, message: "Participación eliminada correctamente." };
}

export async function obtenerParticipacionPorId(
     participacionModel: ModelDefined<ParticipacionAttrs, ParticipacionCreationAttrs>,
     id: number
) {
     const participacion = await participacionModel.findByPk(id);
     if (!participacion) {
          return { success: false, message: "Participación no encontrada." };
     }
     return { success: true, participacion };
}

export async function obtenerParticipaciones(participacionModel: ModelDefined<ParticipacionAttrs, ParticipacionCreationAttrs>) {
     const participaciones = await participacionModel.findAll();
     return { success: true, participaciones };
}
