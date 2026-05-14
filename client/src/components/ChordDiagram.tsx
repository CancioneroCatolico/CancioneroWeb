import type { ChordPosition } from '../types/chordDiagramTypes';

interface ChordDiagramProps {
    position: ChordPosition;
    chordName: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    strings?: number;
    showLabel?: boolean;
}

const SIZES = {
    sm: { width: 80, height: 100, dotR: 5, fontSize: 9, nameFontSize: 11, nutH: 4, topMargin: 24 },
    md: { width: 130, height: 160, dotR: 8, fontSize: 13, nameFontSize: 15, nutH: 6, topMargin: 32 },
    lg: { width: 200, height: 240, dotR: 12, fontSize: 18, nameFontSize: 20, nutH: 8, topMargin: 45 },
    xl: { width: 300, height: 360, dotR: 18, fontSize: 28, nameFontSize: 30, nutH: 12, topMargin: 65 },
};

export function ChordDiagram({ position, chordName, size = 'md', strings = 6, showLabel = true }: ChordDiagramProps) {
    const cfg = SIZES[size];
    const fretCount = 5;

    // Márgenes internos
    const padL = size === 'sm' ? 26 : size === 'lg' ? 46 : size === 'xl' ? 66 : 36; // Mayor espacio para números de traste (ej: 8, 10, 12)
    const padR = cfg.dotR + 4; // Margen dinámico para que no se corte el círculo de la 1ra cuerda
    const padTop = cfg.topMargin; // espacio para X/O arriba
    const padBot = showLabel ? (size === 'sm' ? 20 : 30) : 10;

    const gridW = cfg.width - padL - padR;
    const gridH = cfg.height - padTop - padBot;
    const stringSpacing = gridW / (strings - 1);
    const fretSpacing = gridH / fretCount;

    const totalW = cfg.width;
    const totalH = cfg.height;

    const isNut = position.baseFret === 1;

    // Posiciones X de cada cuerda (6ta=izq, 1ra=der)
    const stringX = (s: number) => padL + s * stringSpacing;
    // Posiciones Y de cada traste
    const fretY = (f: number) => padTop + f * fretSpacing;

    return (
        <div className="chord-diagram-container">
            <svg
                className="chord-diagram"
                viewBox={`0 0 ${totalW} ${totalH}`}
                width={totalW}
                height={totalH}
                aria-label={`Diagrama de acorde ${chordName}`}
            >
                {/* === CEJUELA O INDICADOR DE TRASTE === */}
                {isNut ? (
                    <rect
                        className="chord-diagram-nut"
                        x={padL - 1}
                        y={padTop - cfg.nutH}
                        width={gridW + 2}
                        height={cfg.nutH}
                        rx={1}
                    />
                ) : (
                    <text
                        className="chord-diagram-fret-label"
                        x={padL - (size === 'sm' ? 14 : size === 'lg' ? 24 : size === 'xl' ? 34 : 18)}
                        y={fretY(0) + fretSpacing / 2 + cfg.fontSize * 0.4}
                        fontSize={cfg.fontSize * 1.4}
                        textAnchor="middle"
                        fill="var(--text-secondary)"
                    >
                        {position.baseFret}
                    </text>
                )}

                {/* === TRASTES (líneas horizontales) === */}
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                    <line
                        key={`fret-${i}`}
                        className="chord-diagram-fret"
                        x1={padL}
                        y1={fretY(i)}
                        x2={padL + gridW}
                        y2={fretY(i)}
                        strokeWidth={i === 0 && !isNut ? 2 : 1}
                    />
                ))}

                {/* === CUERDAS (líneas verticales) === */}
                {Array.from({ length: strings }, (_, i) => (
                    <line
                        key={`string-${i}`}
                        className="chord-diagram-string"
                        x1={stringX(i)}
                        y1={padTop}
                        x2={stringX(i)}
                        y2={fretY(fretCount)}
                    />
                ))}

                {/* === CEJILLA (barre) === */}
                {position.barres?.map((barre, idx) => {
                    const fromX = stringX(barre.fromString);
                    const toX = stringX(barre.toString);
                    const y = fretY(barre.fret) - fretSpacing / 2;
                    const barreR = cfg.dotR * 0.9;
                    const bHeight = cfg.dotR * 2.2; // Más alto para parecerse a la imagen
                    const bY = y - bHeight / 2;
                    const fingerNum = position.fingers?.[barre.fromString];

                    return (
                        <g key={`barre-${idx}`}>
                            <rect
                                className="chord-diagram-barre"
                                x={Math.min(fromX, toX) - barreR}
                                y={bY}
                                width={Math.abs(toX - fromX) + barreR * 2}
                                height={bHeight}
                                rx={bHeight / 2}
                            />
                            {fingerNum && fingerNum > 0 && (
                                <text
                                    className="chord-diagram-dot-text"
                                    x={(fromX + toX) / 2}
                                    y={y + cfg.fontSize * 0.3}
                                    fontSize={cfg.fontSize * 0.75}
                                    textAnchor="middle"
                                >
                                    {fingerNum}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* === PUNTOS DE DEDOS === */}
                {position.frets.map((fret, i) => {
                    if (fret <= 0) return null; // muda o al aire se manejan aparte

                    // Si está cubierto por una cejilla, no dibujamos el punto individual
                    const isPartOfBarre = position.barres?.some(b =>
                        fret === b.fret &&
                        i >= Math.min(b.fromString, b.toString) &&
                        i <= Math.max(b.fromString, b.toString)
                    );
                    if (isPartOfBarre) return null;

                    const cx = stringX(i);
                    const cy = fretY(fret) - fretSpacing / 2;
                    const finger = position.fingers?.[i];
                    return (
                        <g key={`dot-${i}`}>
                            <circle
                                className="chord-diagram-dot"
                                cx={cx}
                                cy={cy}
                                r={cfg.dotR}
                            />
                            {finger && finger > 0 && (
                                <text
                                    className="chord-diagram-dot-text"
                                    x={cx}
                                    y={cy + cfg.fontSize * 0.3}
                                    fontSize={cfg.fontSize * 0.7}
                                    textAnchor="middle"
                                >
                                    {finger}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* === X (muda) y O (al aire) === */}
                {position.frets.map((fret, i) => {
                    const x = stringX(i);
                    const y = padTop - cfg.nutH - (size === 'sm' ? 8 : 12); // Más separado del diagrama
                    const symbolSize = size === 'sm' ? 3.5 : 5;

                    if (fret === -1) {
                        // X - muda
                        return (
                            <g key={`mute-${i}`}>
                                <line className="chord-diagram-mute" x1={x - symbolSize} y1={y - symbolSize} x2={x + symbolSize} y2={y + symbolSize} strokeWidth={1.8} />
                                <line className="chord-diagram-mute" x1={x + symbolSize} y1={y - symbolSize} x2={x - symbolSize} y2={y + symbolSize} strokeWidth={1.8} />
                            </g>
                        );
                    }
                    if (fret === 0) {
                        // O - al aire
                        return (
                            <circle
                                key={`open-${i}`}
                                className="chord-diagram-open"
                                cx={x}
                                cy={y}
                                r={symbolSize}
                                strokeWidth={1.5}
                            />
                        );
                    }
                    return null;
                })}

                {/* === NOMBRE DEL ACORDE === */}
                {showLabel && (
                    <text
                        className="chord-diagram-name"
                        x={totalW / 2}
                        y={totalH - (size === 'sm' ? 4 : 8)}
                        fontSize={cfg.nameFontSize}
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {chordName}
                    </text>
                )}
            </svg>

            {/* Etiqueta de posición (debajo del SVG) */}
            {showLabel && position.label && (
                <div className="chord-diagram-pos-label">
                    {position.label}
                </div>
            )}
        </div>
    );
}
