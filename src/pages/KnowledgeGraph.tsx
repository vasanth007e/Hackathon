import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Terminal, Network, Search, Briefcase, Activity, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InvestigationGraph from '@/components/investigation/InvestigationGraph';
import { toast } from 'sonner';

export default function KnowledgeGraphPage() {
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
        // Default to first case for demo if needed, but better to let user select
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseGraph = async (id: string) => {
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
      toast.error('Neural link failure');
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
              <Network className="w-4 h-4 text-primary animate-pulse" />
              <h2 className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Knowledge_Schema_Recon</h2>
            </div>
            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Visualizing semantic entity relationships across investigation clusters.</p>
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
           <div className="flex items-center space-x-4 bg-zinc-950 border border-zinc-900 px-4 h-10">
              <Search className="w-3.5 h-3.5 text-zinc-800" />
              <input 
                type="text" 
                placeholder="FIND_ENTITY_NODES..." 
                className="bg-transparent border-none focus:ring-0 text-[10px] font-mono text-zinc-600 uppercase placeholder:text-zinc-800 w-48"
              />
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
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => loadCaseGraph(c.id)}
                      className="group bg-zinc-950 border border-zinc-900 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 transition-all space-y-6"
                    >
                       <Network className="w-12 h-12 text-zinc-800 group-hover:text-primary/40 transition-colors duration-500" />
                       <div className="space-y-2">
                          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-tighter group-hover:text-primary transition-colors">{c.name}</h3>
                          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Connect_Neural_Layer</p>
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
              className="flex-1 flex"
            >
               <div className="flex-1 relative">
                  <InvestigationGraph entities={selectedCase.entities} relationships={selectedCase.relationships} />
               </div>

               {/* Stats Sidebar */}
               <div className="w-[300px] border-l border-zinc-900 bg-black flex flex-col p-6 space-y-10 shrink-0">
                  <div className="space-y-4">
                     <div className="flex items-center space-x-2">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Graph_Analytics</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-950 border border-zinc-900 p-4">
                           <p className="text-[8px] font-mono text-zinc-800 uppercase mb-2">Total_Nodes</p>
                           <p className="text-xl font-black text-zinc-100 tracking-tighter">{selectedCase.entities.length}</p>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-900 p-4">
                           <p className="text-[8px] font-mono text-zinc-800 uppercase mb-2">Edge_Density</p>
                           <p className="text-xl font-black text-zinc-100 tracking-tighter">0.82</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest border-b border-zinc-900 pb-2">High_Centrality_Entities</h4>
                     <div className="space-y-2">
                        {selectedCase.entities.slice(0, 4).map((e: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-900 hover:border-primary/20 transition-all cursor-pointer group">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase group-hover:text-primary transition-colors">{e.name}</span>
                              <span className="text-[8px] font-mono text-zinc-800">RANK: {i+1}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
             <div className="w-20 h-[1px] bg-primary animate-pulse" />
             <p className="text-[10px] font-mono text-primary uppercase tracking-[0.6em] animate-pulse">Syncing_Neural_Nodes...</p>
          </div>
        )}
      </div>
    </div>
  );
}
