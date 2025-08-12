import { ModelDefined } from "sequelize";
import { ProveedorAttrs, ProveedorCreationAttrs } from "../models/proveedor.model";

export async function crearProveedor(
     proveedorModel: ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>,
     data: Omit<ProveedorCreationAttrs, "id">
) {
     const existe = await proveedorModel.findOne({ where: { nombre: data.nombre } });
     if (existe) {
          return { success: false, message: "El proveedor ya está registrado." };
     }
     const proveedor = await proveedorModel.create(data);
     return { success: true, proveedor, message: "Proveedor creado exitosamente." };
}

export async function actualizarProveedor(
     proveedorModel: ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>,
     id: number,
     data: Partial<ProveedorAttrs>
) {
     const proveedor = await proveedorModel.findByPk(id);
     if (!proveedor) {
          return { success: false, message: "Proveedor no encontrado." };
     }
     await proveedor.update(data);
     return { success: true, proveedor, message: "Proveedor actualizado correctamente." };
}

export async function eliminarProveedor(proveedorModel: ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>, id: number) {
     const proveedor = await proveedorModel.findByPk(id);
     if (!proveedor) {
          return { success: false, message: "Proveedor no encontrado." };
     }
     await proveedor.destroy();
     return { success: true, message: "Proveedor eliminado correctamente." };
}

export async function obtenerProveedorPorId(proveedorModel: ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>, id: number) {
     const proveedor = await proveedorModel.findByPk(id);
     if (!proveedor) {
          return { success: false, message: "Proveedor no encontrado." };
     }
     return { success: true, proveedor };
}

export async function obtenerProveedores(proveedorModel: ModelDefined<ProveedorAttrs, ProveedorCreationAttrs>) {
     const proveedores = await proveedorModel.findAll();
     return { success: true, proveedores };
}
