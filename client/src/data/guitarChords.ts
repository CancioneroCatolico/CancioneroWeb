import type { ChordDefinition, ChordPosition, InstrumentConfig } from '../types/chordDiagramTypes';
import { SHARP_TO_FLAT } from '../utils/musicTheory';

export const GUITAR_CONFIG: InstrumentConfig = {
    id: 'guitarra',
    name: 'Guitarra',
    strings: 6,
    tuning: ['MI', 'LA', 'RE', 'SOL', 'SI', 'MI']
};

// Notas raíz en orden cromático
const ROOTS = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];

// Calidades de acordes soportadas
export const QUALITIES = [
    { id: '', label: 'Mayor' },
    { id: 'm', label: 'Menor' },
    { id: '5', label: '5' },
    { id: '7', label: '7' },
    { id: 'm7', label: 'm7' },
    { id: 'maj7', label: 'maj7' },
    { id: 'sus4', label: 'sus4' }
];

type P = ChordPosition;
const p = (baseFret: number, frets: number[], fingers?: number[], barres?: P['barres'], label?: string): P =>
    ({ baseFret, frets, fingers, barres, label });

// ===== POSICIONES POR NOTA Y CALIDAD =====
// Formato compacto: { [nota]: { [calidad]: ChordPosition[] } }
const DATA: Record<string, Record<string, P[]>> = {
    'DO': {
        '': [p(1, [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0], undefined, 'Abierto'), p(3, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 3'), p(8, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 8')],
        'm': [p(3, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 3'), p(8, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 8'), p(3, [-1, -1, -1, 3, 2, 1], [0, 0, 0, 3, 2, 1], undefined, 'Traste 3')],
        '5': [p(3, [-1, 1, 3, 3, -1, -1], [0, 1, 3, 4, 0, 0], undefined, 'Traste 3'), p(8, [1, 3, 3, -1, -1, -1], [1, 3, 4, 0, 0, 0], undefined, 'Traste 8'), p(3, [-1, -1, -1, -1, 1, 3], [0, 0, 0, 0, 1, 3], undefined, 'Traste 3\'')],
        '7': [p(1, [-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0], undefined, 'Abierto'), p(3, [-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 3'), p(5, [4, 3, 1, 1, 1, 2], [4, 3, 1, 1, 1, 2], [{ fromString: 2, toString: 5, fret: 1 }], 'Cejilla 5')],
        'm7': [p(3, [-1, 1, 3, 1, 2, 1], [0, 1, 3, 1, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 3'), p(3, [-1, 1, 3, 1, 2, 4], [0, 1, 3, 1, 2, 4], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 3\'')],
        'maj7': [p(1, [-1, 3, 2, 0, 0, 0], [0, 2, 1, 0, 0, 0], undefined, 'Abierto'), p(1, [-1, 3, 2, 0, 0, 3], [0, 2, 1, 0, 0, 3], undefined, 'Abierto \'')],
        'sus4': [p(1, [-1, 3, 3, 0, 1, -1], [0, 3, 4, 0, 1, 1], undefined, 'Abierto'), p(3, [-1, 1, 3, 3, 4, - 1], [0, 1, 2, 3, 4, 0], undefined, 'Traste 3')],
    },
    'DO#': {
        '': [p(4, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 4'), p(9, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 9'), p(1, [-1, 4, 3, 1, 2, 1], [0, 4, 3, 1, 2, 1], [{ fromString: 3, toString: 5, fret: 1 }], 'Cejilla 1')],
        'm': [p(4, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 4'), p(9, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 9')],
        '5': [p(4, [-1, 1, 3, 3, -1, -1], [0, 1, 3, 4, -1, -1], undefined, 'Traste 4')],
        '7': [p(4, [-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 4'), p(3, [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4], undefined, 'Abierto')],
        'm7': [p(4, [-1, 1, 3, 1, 2, 1], [0, 1, 3, 1, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 4'), p(1, [-1, 4, 2, 1, 0, 0], [0, 4, 2, 1, 0, 0], undefined, 'Abierto')],
        'maj7': [p(4, [-1, 1, 3, 2, 3, 1], [0, 1, 3, 2, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 4'), p(1, [-1, 4, 3, 1, 1, 1], [0, 4, 3, 1, 1, 1], [{ fromString: 3, toString: 5, fret: 1 }], 'Cejilla 1')],
        'sus4': [p(4, [-1, 1, 1, 3, 4, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 4'), p(4, [-1, 1, 3, 3, 4, -1], [0, 1, 2, 3, 4, 0], undefined, 'Traste 4')],
    },
    'RE': {
        '': [p(1, [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2], undefined, 'Abierto'), p(5, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 5')],
        'm': [p(1, [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1], undefined, 'Abierto'), p(5, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 5')],
        '5': [p(5, [-1, 1, 3, 3, -1, -1], [0, 1, 3, 4, 0, 0], undefined, 'Traste 5')],
        '7': [p(1, [-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3], undefined, 'Abierto'), p(5, [-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 5')],
        'm7': [p(1, [-1, -1, 0, 2, 1, 1], [0, 0, 0, 3, 1, 2], undefined, 'Abierto'), p(5, [-1, 1, 3, 1, 2, 1], [0, 1, 3, 1, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 5')],
        'maj7': [p(1, [-1, -1, 0, 2, 2, 2], [0, 0, 0, 1, 2, 3], undefined, 'Abierto'), p(5, [-1, 1, 3, 2, 3, 1], [0, 1, 3, 2, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 5')],
        'sus4': [p(1, [-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3], undefined, 'Abierto'), p(5, [-1, 1, 3, 3, 4, -1], [0, 1, 2, 3, 4, 0], undefined, 'Traste 5')],
    },
    'RE#': {
        '': [p(1, [-1, -1, 1, 3, 4, 3], [0, 0, 1, 2, 4, 3], undefined, 'Abierto'), p(6, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 6')],
        'm': [p(1, [-1, -1, 1, 3, 4, 2], [0, 0, 1, 3, 4, 2], undefined, 'Abierto'), p(6, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 6')],
        '5': [p(6, [-1, 1, 3, 3, -1, -1], [0, 1, 3, 4, 0, 0], undefined, 'Traste 6')],
        '7': [p(6, [-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 6'), p(1, [-1, -1, 1, 3, 2, 3], [0, 0, 1, 3, 2, 4], undefined, 'Abierto')],
        'm7': [p(6, [-1, 1, 3, 1, 2, 1], [0, 1, 3, 1, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 6'), p(1, [-1, -1, 1, 3, 2, 2], [0, 0, 1, 4, 2, 3], undefined, 'Abierto')],
        'maj7': [p(1, [-1, -1, 1, 3, 3, 3], [0, 0, 1, 2, 3, 4], undefined, 'Abierto'), p(6, [-1, 1, 3, 2, 3, 1], [0, 1, 3, 2, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 6')],
        'sus4': [p(1, [-1, -1, 1, 3, 4, 4], [0, 0, 1, 2, 3, 4], undefined, 'Abierto'), p(6, [-1, 1, 3, 3, 4, -1], [0, 1, 2, 3, 4, 0], undefined, 'Traste 6')],
    },
    'MI': {
        '': [p(1, [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0], undefined, 'Abierto'), p(7, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 7')],
        'm': [p(1, [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0], undefined, 'Abierto'), p(7, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 7')],
        '5': [p(7, [-1, 1, 3, 3, -1, -1], [0, 1, 3, 4, 0, 0], undefined, 'Traste 7'), p(1, [0, 2, 2, 4, 0, 0], [0, 1, 2, 4, 0, 0], undefined, 'Abierto')],
        '7': [p(1, [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0], undefined, 'Abierto'), p(1, [0, 2, 2, 1, 3, 0], [0, 2, 3, 1, 4, 0], undefined, 'Variación 1'), p(1, [0, 2, 0, 1, 3, 0], [0, 2, 0, 1, 4, 0], undefined, 'Variación 2')],
        'm7': [p(1, [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0], undefined, 'Abierto')],
        'maj7': [p(1, [0, 2, 1, 1, 0, 0], [0, 3, 1, 2, 0, 0], undefined, 'Abierto'), p(7, [-1, 1, 3, 2, 3, 1], [0, 1, 3, 2, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 7')],
        'sus4': [p(1, [0, 2, 2, 2, 0, 0], [0, 2, 3, 4, 0, 0], undefined, 'Abierto'), p(7, [-1, 1, 3, 3, 4, -1], [0, 1, 2, 3, 4, 0], undefined, 'Traste 7')],
    },
    'FA': {
        '': [p(1, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 1'), p(1, [-1, -1, 3, 2, 1, 1], [0, 0, 3, 2, 1, 1], undefined, 'Simplificado')],
        'm': [p(1, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 1')],
        '5': [p(1, [1, 3, 3, -1, -1, -1], [1, 3, 4, 0, 0, 0], undefined, 'Abierto')],
        '7': [p(1, [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 1')],
        'm7': [p(1, [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 1')],
        'maj7': [p(1, [-1, 3, 3, 2, 1, 0], [0, 3, 4, 2, 1, 0], undefined, 'Abierto')],
        'sus4': [p(1, [1, 3, 3, 3, 1, 1], [1, 2, 3, 4, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 1')],
    },
    'FA#': {
        '': [p(2, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 2')],
        'm': [p(2, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 2')],
        '5': [p(1, [2, 4, 4, -1, -1, -1], [1, 3, 4, 0, 0, 0], undefined, 'Abierto')],
        '7': [p(2, [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 2')],
        'm7': [p(2, [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 2')],
        'maj7': [p(2, [1, 3, 2, 2, 1, 1], [1, 4, 2, 3, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 2')],
        'sus4': [p(2, [1, 3, 3, 3, 1, 1], [1, 2, 3, 4, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 2')],
    },
    'SOL': {
        '': [p(1, [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3], undefined, 'Abierto'), p(3, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 3')],
        'm': [p(3, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 3')],
        '5': [p(3, [1, 3, 3, -1, -1, -1], [1, 3, 4, 0, 0, 0], undefined, 'Traste 3')],
        '7': [p(1, [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1], undefined, 'Abierto'), p(3, [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 3')],
        'm7': [p(3, [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 3')],
        'maj7': [p(1, [3, 2, 0, 0, 0, 2], [3, 1, 0, 0, 0, 2], undefined, 'Abierto')],
        'sus4': [p(1, [3, -1, 0, 0, 1, 3], [3, 0, 0, 0, 1, 4], undefined, 'Abierto'), p(3, [1, 3, 3, 3, 1, 1], [1, 2, 3, 4, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 3')],
    },
    'SOL#': {
        '': [p(4, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 4')],
        'm': [p(4, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 4')],
        '5': [p(4, [1, 3, 3, -1, -1, -1], [1, 3, 4, 0, 0, 0], undefined, 'Traste 4')],
        '7': [p(4, [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 4')],
        'm7': [p(4, [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 4')],
        'maj7': [p(4, [1, 3, 2, 2, 1, 1], [1, 4, 2, 3, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 4')],
        'sus4': [p(4, [1, 3, 3, 3, 1, 1], [1, 2, 3, 4, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 4')],
    },
    'LA': {
        '': [p(1, [-1, 0, 2, 2, 2, 0], [0, 0, 2, 3, 4, 0], undefined, 'Abierto'), p(5, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 5')],
        'm': [p(1, [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0], undefined, 'Abierto'), p(5, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 5')],
        '5': [p(1, [-1, 0, 2, 2, -1, -1], [0, 0, 3, 4, 0, 0], undefined, 'Abierto')],
        '7': [p(1, [-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0], undefined, 'Abierto'), p(5, [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 5')],
        'm7': [p(1, [-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0], undefined, 'Abierto'), p(5, [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 5')],
        'maj7': [p(1, [-1, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0], undefined, 'Abierto')],
        'sus4': [p(1, [-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0], undefined, 'Abierto')],
    },
    'LA#': {
        '': [p(1, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 1'), p(6, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 6')],
        'm': [p(1, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 1'), p(6, [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 6')],
        '5': [p(1, [-1, 1, 3, 3, -1, -1], [0, 1, 3, 4, 0, 0], undefined, 'Abierto')],
        '7': [p(1, [-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 1'), p(6, [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 6')],
        'm7': [p(1, [-1, 1, 3, 1, 2, 1], [0, 1, 3, 1, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 1'), p(6, [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 6')],
        'maj7': [p(1, [-1, 1, 3, 2, 3, 1], [0, 1, 3, 2, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 1')],
        'sus4': [p(1, [-1, 1, 3, 3, 4, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 1')],
    },
    'SI': {
        '': [p(2, [-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 2'), p(7, [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [{ fromString: 0, toString: 5, fret: 1 }], 'Cejilla 7')],
        'm': [p(2, [-1, 1, 3, 3, 2, 1], [0, 1, 3, 4, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 2')],
        '5': [p(1, [-1, 2, 4, 4, -1, -1], [0, 1, 3, 4, 0, 0], undefined, 'Abierto')],
        '7': [p(1, [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4], undefined, 'Abierto'), p(2, [-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 2')],
        'm7': [p(2, [-1, 1, 3, 1, 2, 1], [0, 1, 3, 1, 2, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 2'), p(1, [-1, 2, 0, 2, 0, 2], [0, 2, 0, 3, 0, 4], undefined, 'Abierto')],
        'maj7': [p(2, [-1, 1, 3, 2, 3, 1], [0, 1, 3, 2, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 2')],
        'sus4': [p(2, [-1, 1, 3, 3, 4, 1], [0, 1, 2, 3, 4, 1], [{ fromString: 1, toString: 5, fret: 1 }], 'Cejilla 2')],
    },
};

// ===== CONSTRUIR ARRAY FINAL =====
function buildChordDefinitions(): ChordDefinition[] {
    const chords: ChordDefinition[] = [];
    for (const root of ROOTS) {
        const flatName = SHARP_TO_FLAT[root] || null;
        const rootData = DATA[root];
        if (!rootData) continue;

        for (const q of QUALITIES) {
            const positions = rootData[q.id];
            if (!positions || positions.length === 0) continue;

            chords.push({
                rootSharp: root,
                rootFlat: flatName,
                quality: q.id,
                displayNameSharp: root + q.id,
                displayNameFlat: flatName ? flatName + q.id : null,
                positions,
            });
        }
    }
    return chords;
}

export const GUITAR_CHORDS: ChordDefinition[] = buildChordDefinitions();

/** Busca un acorde por su nombre (soporta # y b). Ej: "SIbm", "LA#m", "DO", "REm7" */
export function findChord(chordName: string): ChordDefinition | undefined {
    // Separar raíz de calidad
    const rootMatch = chordName.match(/^(DO|RE|MI|FA|SOL|LA|SI)([#b]?)(.*)/);
    if (!rootMatch) return undefined;

    const rawRoot = rootMatch[1] + (rootMatch[2] || '');
    const quality = rootMatch[3] || '';

    // Normalizar bemoles a sostenidos para búsqueda
    const FLAT_MAP: Record<string, string> = {
        'DOb': 'SI', 'REb': 'DO#', 'MIb': 'RE#', 'FAb': 'MI',
        'SOLb': 'FA#', 'LAb': 'SOL#', 'SIb': 'LA#',
    };
    const normalizedRoot = FLAT_MAP[rawRoot] || rawRoot;

    return GUITAR_CHORDS.find(c => c.rootSharp === normalizedRoot && c.quality === quality);
}
