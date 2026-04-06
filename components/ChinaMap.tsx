"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { useState } from "react";

const GEO_URL =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/china/china-provinces.json";

export interface MarcadorProveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  lat: number;
  lng: number;
}

interface ChinaMapProps {
  onProvinciaClick?: (nombre: string) => void;
  marcadores?: MarcadorProveedor[];
}

export default function ChinaMap({ onProvinciaClick, marcadores = [] }: ChinaMapProps) {
  const [tooltip, setTooltip] = useState<MarcadorProveedor | null>(null);

  return (
    <div className="w-full h-full bg-[#060e1a] relative">
      {/* Título superpuesto */}
      <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-3 pointer-events-none">
        <span className="text-xs md:text-sm text-[#FFDE00]/70 tracking-widest uppercase font-mono">
          República Popular China
        </span>
      </div>

      {/* Tooltip de marcador */}
      {tooltip && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-[#111827] border border-[#FFDE00]/40 rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="font-semibold text-[#FFDE00]">{tooltip.nombreEmpresa}</p>
            <p className="text-gray-400">{tooltip.nombreContacto}</p>
          </div>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [104, 35],
          scale: 620,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() =>
                    onProvinciaClick?.(
                      geo.properties.NAME_1 || geo.properties.name || "Provincia"
                    )
                  }
                  style={{
                    default: {
                      fill: "#1a2744",
                      stroke: "#DE2910",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#DE2910",
                      stroke: "#FFDE00",
                      strokeWidth: 0.8,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#8B0000",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Marcadores de proveedores */}
          {marcadores.map((m) => (
            <Marker
              key={m.id}
              coordinates={[m.lng, m.lat]}
              onMouseEnter={() => setTooltip(m)}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Anillo exterior pulsante */}
              <circle r={8} fill="#FFDE00" fillOpacity={0.15} stroke="#FFDE00" strokeWidth={0.5} />
              {/* Punto central */}
              <circle r={4} fill="#FFDE00" stroke="#111827" strokeWidth={1} style={{ cursor: "pointer" }} />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Leyenda marcadores */}
      {marcadores.length > 0 && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-[#0d1117]/80 border border-white/10 rounded-lg px-2.5 py-1.5">
          <circle className="w-2 h-2 rounded-full bg-[#FFDE00]" />
          <span className="text-xs text-gray-400">
            {marcadores.length} proveedor{marcadores.length > 1 ? "es" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
