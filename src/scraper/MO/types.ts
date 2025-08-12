export type DateParts = { day: number | string; month: number | string; year: number | string };
export type RangeParams = { desde: DateParts; hasta: DateParts };

export type HistRow = {
     producto_raw: string;
     cantidad: number | null;
     fecha_hist: string;
     categoria_id: number | null;
     participaciones?: Participation[];
};

export type CheckMOResult = {
     ok: boolean;
     reason?: string;
     table?: string;
     rows?: HistRow[];
};

export type Participation = {
     orden_id: number | null;
     proveedor_id: string;
     precio_ofertado: number;
     fecha_oferta: string; // "YYYY-MM-DD HH:mm:ss"
};
