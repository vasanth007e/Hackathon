import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Terminal, FileText, Briefcase, Activity, ChevronRight, User, MessageSquare, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function WitnessLogs() {
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
      toast.error('Evidence link failure');
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
              <MessageSquare className="w-4 h-4 text-primary animate-pulse" />
              <h2 className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Witness_Statement_Archive</h2>
            </div>
            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Indexing and analyzing verbal testimony metadata.</p>
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
                      className="group bg-zinc-950 border border-zinc-900 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 transition-all space-y-6"
                    >
                       <FileText className="w-12 h-12 text-zinc-800 group-hover:text-primary/40 transition-colors duration-500" />
                       <div className="space-y-2">
                          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-tighter group-hover:text-primary transition-colors">{c.name}</h3>
                          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Access_Witness_Database</p>
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
               <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
                  {selectedCase.evidence.filter((e: any) => e.type === 'witness').length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-zinc-900 font-mono text-[9px] uppercase tracking-widest space-y-4">
                       <MessageSquare className="w-8 h-8 opacity-10" />
                       <span>Testimony_Vault_Empty</span>
                    </div>
                  ) : (
                    selectedCase.evidence
                      .filter((e: any) => e.type === 'witness')
                      .map((wit: any, i: number) => (
                        <motion.div
                          key={wit.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-zinc-950 border border-zinc-900 p-8 flex items-start space-x-8 group hover:border-primary/20 transition-all"
                        >
                           <div className="w-16 h-16 bg-black border border-zinc-900 flex items-center justify-center shrink-0">
                              <User className="w-8 h-8 text-zinc-800 group-hover:text-primary transition-colors" />
                           </div>
                           <div className="flex-1 space-y-6">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-4">
                                    <span className="text-sm font-black text-zinc-300 uppercase tracking-tight">{wit.title}</span>
                                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest bg-zinc-900 px-2 py-0.5">Verified_Subject</span>
                                 </div>
                                 <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">ID_REF: {wit.id.slice(-6)}</span>
                              </div>
                              <div className="relative">
                                 <p className="text-sm font-light text-zinc-500 leading-relaxed italic border-l-2 border-primary/20 pl-6 lowercase tracking-tight">
                                    "{wit.content}"
                                 </p>
                              </div>
                              <div className="flex items-center space-x-8 pt-4">
                                 <div className="flex items-center space-x-2">
                                    <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Sentiment:</span>
                                    <span className="text-[9px] font-bold text-primary/60 uppercase">NEUTRAL</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Reliability:</span>
                                    <span className="text-[9px] font-bold text-emerald-900 uppercase">{(wit.trust_score * 100).toFixed(0)}%</span>
                                 </div>
                              </div>
                           </div>
                           <Button variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-primary transition-all">
                              Cross_Ref
                           </Button>
                        </motion.div>
                      ))
                  )}
               </div>

               {/* Right Stats Sidebar */}
               <div className="w-[300px] border-l border-zinc-900 bg-black p-6 space-y-10 shrink-0">
                  <div className="space-y-4">
                     <div className="flex items-center space-x-2">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Verbal_Telemetry</h3>
                     </div>
                     <div className="bg-zinc-950 border border-zinc-900 p-4 space-y-4">
                        <div>
                           <p className="text-[8px] font-mono text-zinc-800 uppercase mb-1">Total_Statements</p>
                           <p className="text-xl font-black text-zinc-100 tracking-tighter">03</p>
                        </div>
                        <div className="h-px bg-zinc-900" />
                        <div>
                           <p className="text-[8px] font-mono text-zinc-800 uppercase mb-1">Mean_Certainty</p>
                           <p className="text-xl font-black text-emerald-900 tracking-tighter">82.4%</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-5 bg-zinc-900/10 border border-zinc-900 space-y-4">
                     <Database className="w-6 h-6 text-zinc-800" />
                     <h4 className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Archive_Integrity</h4>
                     <p className="text-[9px] font-mono text-zinc-800 uppercase leading-relaxed tracking-tighter">
                        Witness logs are cryptographically hashed and linked to temporal event sequence IDs to prevent back-dated testimony tampering.
                     </p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
             <MessageSquare className="w-16 h-16 text-primary animate-pulse" />
             <p className="text-[10px] font-mono text-primary uppercase tracking-[0.6em] animate-pulse">Retrieving_Testimony_Data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
