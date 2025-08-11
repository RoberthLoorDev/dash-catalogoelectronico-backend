export type DateParts = { day: number | string; month: number | string; year: number | string };
export type RangeParams = { desde: DateParts; hasta: DateParts };

export type HistRow = {
     producto_raw: string;
     cantidad: number | null;
     fecha_hist: string;
};

export type CheckMOResult = {
     ok: boolean;
     reason?: string;
     table?: string;
     rows?: HistRow[];
};
