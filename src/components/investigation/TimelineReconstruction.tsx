import { motion } from 'motion/react';
import { Clock, Navigation, Zap, FileText, Activity } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  label: string;
  description: string;
  type: string;
}

export default function TimelineReconstruction({ timeline = [] }: { timeline: TimelineEvent[] }) {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto bg-black custom-scrollbar">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 sticky top-0 bg-black z-20">
        <div className="flex flex-col">
           <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Chronological_Sequence</h3>
           <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest mt-1">v2.4_temporal_mapping</span>
        </div>
        <div className="flex space-x-6">
           <div className="flex items-center text-[8px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-1 border border-zinc-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_rgba(16,185,129,0.4)]" /> Verified
           </div>
           <div className="flex items-center text-[8px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-1 border border-zinc-900">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 shadow-[0_0_5px_rgba(239,68,68,0.4)]" /> Conflict
           </div>
        </div>
      </div>

      <div className="relative pl-6 space-y-8">
        {/* Continuous Timeline Line */}
        <div className="absolute left-[3px] top-4 bottom-4 w-[1px] bg-zinc-900" />

        {timeline.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-800 font-mono text-[9px] uppercase tracking-widest space-y-4">
             <Activity className="w-8 h-8 opacity-10" />
             <span>Temporal_Stream_Empty</span>
          </div>
        ) : (
          timeline.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-10 group"
            >
              {/* Event Marker */}
              <div className="absolute left-[0px] top-6 w-2 h-2 bg-zinc-950 border border-zinc-900 group-hover:bg-primary group-hover:border-black transition-all z-10" />
              <div className="absolute left-[5px] top-7 w-4 h-[1px] bg-zinc-900 group-hover:bg-primary/40 transition-all" />
              
              <div className="bg-zinc-950/20 border border-zinc-900 p-4 group-hover:border-primary/20 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 opacity-5">
                   <span className="text-[40px] font-mono font-black italic select-none">T-{i+1}</span>
                </div>

                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-primary font-black tracking-widest">
                       {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <div className="h-3 w-px bg-zinc-800" />
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                       {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-1.5 bg-black border border-zinc-900 group-hover:border-primary/30 transition-colors">
                    {event.type === 'gps' && <Navigation className="w-3.5 h-3.5 text-primary" />}
                    {event.type === 'witness' && <Zap className="w-3.5 h-3.5 text-primary" />}
                    {event.type === 'metadata' && <FileText className="w-3.5 h-3.5 text-primary" />}
                    {!['gps', 'witness', 'metadata'].includes(event.type) && <Activity className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </div>
                
                <h4 className="text-xs font-black text-zinc-100 uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">{event.label}</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-mono opacity-80 max-w-2xl">{event.description}</p>
                
                <div className="mt-4 pt-3 border-t border-zinc-900/40 flex items-center justify-between">
                   <div className="flex items-center text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                      <Clock className="w-3 h-3 mr-2 text-zinc-800" /> Confidence_score: <span className="text-primary ml-1 font-bold">0.89</span>
                   </div>
                   <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-mono text-zinc-800 uppercase px-1.5 py-0.5 bg-zinc-900 border border-zinc-800">Linked_CID: {event.id.slice(-4)}</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
