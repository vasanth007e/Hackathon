import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Terminal, AlertCircle, Briefcase, Activity, ChevronRight, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ContradictionsPage() {
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

  const loadCaseData = async (id: string) => {
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
      toast.error('Dissonance sync failure');
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
              <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
              <h2 className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Neural_Dissonance_Triage</h2>
            </div>
            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Identifying logic gaps and cross-evidence contradictions.</p>
          </div>

          <div className="h-8 w-px bg-zinc-900 mx-2" />

          {selectedCase && (
            <div className="flex items-center space-x-4 bg-zinc-950 border border-zinc-900 px-4 py-2 font-mono">
               <Briefcase className="w-3.5 h-3.5 text-red-900" />
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
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => loadCaseData(c.id)}
                      className="group bg-zinc-950 border border-zinc-900 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-900/40 transition-all space-y-6"
                    >
                       <ShieldAlert className="w-12 h-12 text-zinc-800 group-hover:text-red-900/40 transition-colors duration-500" />
                       <div className="space-y-2">
                          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-tighter group-hover:text-red-500 transition-colors">{c.name}</h3>
                          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Analyze_Dissonance</p>
                       </div>
                       <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4 text-red-600" />
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
              className="flex-1 flex p-8 gap-8 overflow-y-auto custom-scrollbar"
            >
               <div className="flex-1 space-y-6">
                  {selectedCase.relationships.filter((r: any) => r.is_contradiction).length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-zinc-900 font-mono text-[9px] uppercase tracking-widest space-y-4">
                       <ShieldAlert className="w-8 h-8 opacity-10" />
                       <span>No_Dissonance_Detected</span>
                    </div>
                  ) : (
                    selectedCase.relationships
                      .filter((r: any) => r.is_contradiction)
                      .map((alert: any, i: number) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-zinc-950 border border-zinc-900 p-6 flex items-start space-x-6 group hover:border-red-900/40 transition-all cursor-pointer"
                        >
                           <div className="p-4 bg-red-950/20 border border-red-900 text-red-500">
                              <Zap className="w-6 h-6" />
                           </div>
                           <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.2em]">LOGIC_GAP_{alert.id.slice(-4)}</span>
                                 <span className="text-[8px] font-black uppercase px-2 py-0.5 border text-red-500 border-red-900 bg-red-950/50">CRITICAL_PRIORITY</span>
                              </div>
                              <p className="text-sm font-black text-zinc-400 uppercase tracking-tight group-hover:text-red-500 transition-colors uppercase">
                                {alert.description || alert.type}
                              </p>
                              <div className="flex items-center space-x-4 opacity-40">
                                 <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.1em]">Target_Edge: {alert.source_id} &lt;-&gt; {alert.target_id}</span>
                                 <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.1em]">Certainty: 0.94</span>
                              </div>
                           </div>
                           <Button variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-950/20 rounded-none px-6">
                              Resolve_Dissonance
                           </Button>
                        </motion.div>
                      ))
                  )}
               </div>

               {/* Right Stats Sidebar */}
               <div className="w-[340px] space-y-8 shrink-0">
                  <div className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col space-y-6">
                     <div className="flex items-center space-x-2">
                        <Cpu className="w-3.5 h-3.5 text-red-600" />
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Dissonance_Scan_Core</h3>
                     </div>
                     <div className="space-y-6">
                        <div>
                           <div className="flex justify-between mb-2">
                              <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Global_Stability</span>
                              <span className="text-[8px] font-mono text-red-600 font-bold">82%</span>
                           </div>
                           <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                              <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: '82%' }} />
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between mb-2">
                              <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Sync_Accuracy</span>
                              <span className="text-[8px] font-mono text-emerald-900 font-bold">98.2%</span>
                           </div>
                           <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                              <div className="h-full bg-emerald-900" style={{ width: '98%' }} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-red-950/5 border border-red-900/20 p-8 space-y-4">
                     <ShieldAlert className="w-8 h-8 text-red-900" />
                     <h3 className="text-xs font-black text-red-800 uppercase tracking-widest">Operational Alert</h3>
                     <p className="text-[10px] font-mono text-red-900/60 leading-relaxed uppercase tracking-tighter">
                        Multiple high-severity contradictions detected in thread reconstruction. AI confidence layer suggests manual override of witness statements.
                     </p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
             <AlertCircle className="w-16 h-16 text-red-600 animate-pulse" />
             <p className="text-[10px] font-mono text-red-600 uppercase tracking-[0.6em] animate-pulse">Scanning_Dissonance_Layers...</p>
          </div>
        )}
      </div>
    </div>
  );
}
