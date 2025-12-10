// src/types.ts
export interface Cancion {
    _id?: string; // Es opcional (?) porque al crearla aún no tiene ID
    titulo: string;
    autor: string;
    tonoBase: string;
    numeroCancion?: number; // Opcional al crear
    categorias: string[];
    videoUrl: string;
    letra: string[];
}