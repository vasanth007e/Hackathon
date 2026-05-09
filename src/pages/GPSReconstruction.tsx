import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Navigation, Clock, ShieldAlert, Cpu, Activity, Zap, Radio } from 'lucide-react';
import { motion } from 'motion/react';

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapEffects() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function GPSReconstruction() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<[number, number][]>([
    [12.91, 80.21],
    [12.912, 80.215],
    [12.915, 80.22],
    [12.913, 80.225],
    [12.91, 80.23],
  ]);

  useEffect(() => {
    // In a real app, fetch GPS metadata from evidence
    setTimeout(() => setLoading(false), 1000);
  }, [id]);

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-black text-primary font-mono select-none">
       <Activity className="w-12 h-12 mb-6 animate-pulse" />
       <p className="text-[10px] uppercase tracking-[0.5em] font-black">INITIALIZING_GEOSPATIAL_CORE...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Stats & Steps */}
        <div className="w-[380px] border-r border-zinc-900 bg-black flex flex-col z-10 custom-scrollbar overflow-y-auto">
          <div className="p-6 space-y-10">
            <div className="space-y-4">
               <div className="flex items-center space-x-2">
                  <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Trajectory_Telemetry</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950 border border-zinc-900 group hover:border-primary/20 transition-all">
                     <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest mb-2">Distance_Recon</p>
                     <p className="text-xl font-black text-zinc-100 tracking-tighter">1.42 <span className="text-zinc-600">KM</span></p>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-zinc-900 group hover:border-red-900/40 transition-all">
                     <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest mb-2">Dissonant_Stops</p>
                     <p className="text-xl font-black text-red-600 tracking-tighter">02</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Path_Sequence_Manifest</h3>
               <div className="space-y-3">
                  {positions.map((p, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-black border border-zinc-900 hover:border-primary/30 group transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-zinc-950 flex items-center justify-center border border-zinc-900 text-[10px] font-black group-hover:text-primary transition-colors">
                           {i + 1}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tight group-hover:text-primary transition-colors">NODE_POINT_Z{i+100}</p>
                          <p className="text-[8px] font-mono text-zinc-700 mt-0.5 tracking-tighter">{p[0].toFixed(4)}, {p[1].toFixed(4)}</p>
                        </div>
                      </div>
                      <Clock className="w-3.5 h-3.5 text-zinc-800 group-hover:text-primary/50 transition-all" />
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="p-5 border border-red-950 bg-red-950/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                  <ShieldAlert className="w-12 h-12 text-red-600" />
               </div>
               <div className="flex items-center text-red-600 mb-3">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">KINETIC_ANOMALY_DETECTED</span>
               </div>
               <p className="text-[11px] text-zinc-500 font-mono leading-relaxed uppercase tracking-tighter">
                  Calculated velocity between Node 3 & 4 exceeds human capabilities (72km/h). Tracking entity likely utilized unlogged transit unit.
               </p>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-black">
           <MapContainer 
            center={[12.912, 80.218]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            className="z-0 grayscale contrast-125 brightness-75 invert-[0.1]"
           >
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapEffects />
            <Polyline positions={positions} color="#d4ff00" weight={2} opacity={0.5} dashArray="8, 12" />
            
            {positions.map((pos, i) => (
              <Marker key={i} position={pos}>
                <Popup className="tactical-popup">
                  <div className="font-mono text-[10px] p-2 bg-black text-primary border border-zinc-800">
                    <p className="font-black uppercase mb-2 border-b border-zinc-900 pb-1">SEQ_POINT_{i+1}</p>
                    <p className="text-zinc-500 uppercase tracking-tighter">TIME: 21:{12 + i * 2}:44</p>
                    <p className="text-zinc-700 uppercase tracking-tighter mt-1 italic">LAT: {pos[0]}</p>
                    <p className="text-zinc-700 uppercase tracking-tighter italic">LNG: {pos[1]}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Intelligence Overlays */}
          <div className="absolute top-8 left-8 flex flex-col space-y-3 z-10 pointer-events-none">
             <div className="bg-black/90 border border-zinc-900 p-3 px-5 flex items-center space-x-4">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Global_Tactical_Grid</span>
                <div className="flex items-center space-x-1.5 grayscale">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                   <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Signal_Lock</span>
                </div>
             </div>
             <div className="flex space-x-3">
                <div className="bg-black/80 border border-zinc-900 p-2 px-3 text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                   AZIMUTH: 184.22
                </div>
                <div className="bg-black/80 border border-zinc-900 p-2 px-3 text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                   EL_V: 12.0
                </div>
             </div>
          </div>

          <div className="absolute top-8 right-8 p-5 bg-black/90 border border-zinc-900 z-10 w-56 space-y-5">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Neural_Link_Status</span>
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(212,255,0,0.4)] animate-pulse" />
             </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">Satellite_Core</p>
                   <p className="text-[8px] font-mono text-primary font-bold">98%</p>
                </div>
                <div className="h-[2px] w-full bg-zinc-950 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '98%' }}
                     className="h-full bg-primary/40 shadow-[0_0_10px_rgba(212,255,0,0.5)]"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">Geo_Precision</p>
                   <p className="text-[8px] font-mono text-primary font-bold">±0.4M</p>
                </div>
                <div className="h-[2px] w-full bg-zinc-950 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '94%' }}
                     className="h-full bg-primary"
                   />
                </div>
             </div>
          </div>

          {/* BOTTOM_HUD */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-14 bg-black/90 border border-primary/20 flex items-center px-8 space-x-12 z-10 backdrop-blur-md">
             <div className="flex items-center space-x-3 group">
                <Navigation className="w-4 h-4 text-primary group-hover:animate-spin transition-all" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Cursor_Pos</span>
                   <span className="text-[10px] font-black text-zinc-300 tracking-tighter">12.9122 / 80.2155</span>
                </div>
             </div>
             <div className="w-px h-6 bg-zinc-900" />
             <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Last_Update</span>
                   <span className="text-[10px] font-black text-zinc-300 tracking-tighter">Just now</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
