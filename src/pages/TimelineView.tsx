import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Terminal, Clock, Briefcase, Activity, ChevronRight, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TimelineReconstruction from '@/components/investigation/TimelineReconstruction';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function TimelineView() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCases(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseTimeline = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedCase(data);
      }
    } catch (err) {
      toast.error('Temporal link failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden select-none">
      <div className="p-6 border-b border-zinc-900 bg-zinc-950/20 flex items-center justify-between z-10">
        <div className="flex items-center space-x-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
              <h2 className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Chronological_Event_Matrix</h2>
            </div>
            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Reconstructing event sequences across temporal dimensions.</p>
          </div>

          <div className="h-8 w-px bg-zinc-900 mx-2" />

          {selectedCase && (
            <div className="flex items-center space-x-4 bg-zinc-950 border border-zinc-900 px-4 py-2 font-mono">
               <Briefcase className="w-3.5 h-3.5 text-primary/60" />
               <span className="text-[10px] text-zinc-400 uppercase tracking-tighter truncate max-w-[200px]">Active_Thread: {selectedCase.name}</span>
               <button 
                 onClick={() => setSelectedCase(null)}
                 className="text-[9px] text-zinc-700 hover:text-red-500 transition-colors uppercase font-black"
               >
                 [DETACH]
               </button>
            </div>
          )}
        </div>

        {!selectedCase && (
           <div className="flex items-center bg-zinc-950 border border-zinc-900 px-4 h-10 space-x-4">
              <Filter className="w-3.5 h-3.5 text-zinc-800" />
              <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Sort: Temporal_DESC</span>
           </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        <AnimatePresence mode="wait">
          {!selectedCase ? (
            <motion.div 
               key="selector"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                  {cases.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => loadCaseTimeline(c.id)}
                      className="group bg-zinc-950 border border-zinc-900 p-8 flex flex-col space-y-6 cursor-pointer hover:border-primary/40 transition-all text-center items-center justify-center"
                    >
                       <Clock className="w-12 h-12 text-zinc-800 group-hover:text-primary/40 transition-colors duration-500" />
                       <div className="space-y-2">
                          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-tighter group-hover:text-primary transition-colors">{c.name}</h3>
                          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Mount_Temporal_Core</p>
                       </div>
                       <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4 text-primary" />
                       </div>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col bg-zinc-950"
            >
               <div className="flex-1 overflow-hidden relative">
                  <TimelineReconstruction timeline={selectedCase.timeline} />
               </div>
               
               {/* Global Feed overlay for timeline */}
               <div className="h-16 bg-black border-t border-zinc-900 flex items-center px-8 justify-between shrink-0 z-20">
                  <div className="flex items-center space-x-10 text-[9px] font-mono uppercase tracking-widest text-zinc-700">
                     <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-2 text-primary/40" /> PULSE_SYNC: STABLE</span>
                     <span>EVENTS: {selectedCase.timeline.length}</span>
                     <span>RANGE: 24.2H</span>
                  </div>
                  <div className="flex space-x-4">
                     <Button variant="ghost" className="h-8 text-[9px] uppercase font-black text-zinc-600 hover:text-primary">
                        Jump_to_Anomaly
                     </Button>
                     <Button variant="ghost" className="h-8 text-[9px] uppercase font-black text-primary hover:bg-primary/5">
                        Export_Sequence
                     </Button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
             <div className="flex space-x-2">
                {['T','I','M','E'].map((char, i) => (
                  <span key={i} className="text-primary font-black text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{char}</span>
                ))}
             </div>
             <p className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] animate-pulse">Syncing_Temporal_Registers...</p>
          </div>
        )}
      </div>
    </div>
  );
}
