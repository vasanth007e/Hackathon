import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Terminal, Sparkles, Briefcase, Activity, ChevronRight, Brain, Zap, ShieldCheck, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import AIInvestigatorChat from '@/components/investigation/AIInvestigatorChat';

export default function AIInvestigatorPage() {
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
      toast.error('AI link failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden select-none">
      <div className="h-10 border-b border-zinc-900 bg-black flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-3.5 h-3.5 text-primary/80 animate-pulse" />
              <h2 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Neural_Inference_Core</h2>
            </div>
            <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest hidden lg:block">Communicating with autonomous reasoning agents.</p>
          </div>

          {selectedCase && (
            <>
              <div className="h-4 w-px bg-zinc-900 mx-2" />
              <div className="flex items-center space-x-4 bg-zinc-900/30 border border-zinc-900 px-3 py-1 font-mono rounded-sm">
                 <Briefcase className="w-3 h-3 text-primary/40" />
                 <span className="text-[9px] text-zinc-500 uppercase tracking-tighter truncate max-w-[200px] font-medium">{selectedCase.name}</span>
                 <button 
                   onClick={() => setSelectedCase(null)}
                   className="text-[8px] text-zinc-800 hover:text-red-500 transition-colors uppercase font-black"
                 >
                   [DETACH]
                 </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        <AnimatePresence mode="wait">
          {!selectedCase ? (
            <motion.div 
               key="selector"
               initial={{ opacity: 0, scale: 0.99 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.99 }}
               className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar no-scrollbar"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
                  {cases.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => loadCaseData(c.id)}
                      className="group bg-zinc-950 border border-zinc-900 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/20 transition-all space-y-6 relative overflow-hidden h-64"
                    >
                       <div className="absolute top-0 right-0 p-2 opacity-10">
                          <Network className="w-8 h-8 text-zinc-800" />
                       </div>
                       <Brain className="w-10 h-10 text-zinc-800 group-hover:text-primary/30 transition-colors duration-500" />
                       <div className="space-y-1.5 relative z-10">
                          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors leading-tight px-4">{c.name}</h3>
                          <p className="text-[7px] font-mono text-zinc-800 uppercase tracking-[0.2em] group-hover:text-primary/40 transition-colors">Neural_Link_Available</p>
                       </div>
                       <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-3.5 h-3.5 text-primary/60" />
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
               <div className="flex-1 relative overflow-hidden flex flex-col bg-[radial-gradient(circle_at_center,rgba(229,255,0,0.01)_0%,transparent_100%)]">
                  <AIInvestigatorChat caseId={selectedCase.id} />
               </div>

               {/* Right Side Stats Sidebar */}
               <div className="w-[280px] border-l border-zinc-900 bg-zinc-950 p-6 space-y-10 shrink-0">
                  <div className="space-y-5">
                     <div className="flex items-center space-x-2">
                        <Activity className="w-3 h-3 text-primary/60" />
                        <h3 className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-700 font-black">Model_Telemetry</h3>
                     </div>
                     <div className="bg-black border border-zinc-900 p-5 space-y-6">
                        <div className="flex items-center justify-between">
                           <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest leading-none">Logic_Engine</span>
                           <span className="text-[9px] font-black text-primary/80 uppercase">Gemini_Core</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest leading-none">Cognitive_Load</span>
                           <span className="text-[9px] font-black text-zinc-500 uppercase">12%</span>
                        </div>
                        <div className="h-[px] w-full bg-zinc-900" />
                        <div className="flex items-center justify-between">
                           <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest leading-none">Inference_Uptime</span>
                           <span className="text-[9px] font-black text-emerald-900/60 uppercase">99.9%</span>
                        </div>
                     </div>
                  </div>

                  <div className="p-5 border border-primary/10 bg-primary/[0.02] space-y-4">
                     <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-primary/40" />
                        <h4 className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest font-black">Verification_Guard</h4>
                     </div>
                     <p className="text-[9px] font-mono text-zinc-600 uppercase leading-relaxed tracking-tighter">
                        Forensic inference is constrained by empirical metadata. All weights are cross-verified against primary telemetry.
                     </p>
                  </div>

                  <div className="pt-20 opacity-5">
                     <Zap className="w-10 h-10 text-primary animate-pulse" />
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4">
             <div className="relative">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
                <div className="absolute inset-0 border border-primary/20 rounded-full animate-ping" />
             </div>
             <p className="text-[9px] font-mono text-primary uppercase tracking-[0.5em] animate-pulse">Initializing_Inference_Sync...</p>
          </div>
        )}
      </div>
    </div>
  );
}
