import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  FileText, Clock, MessageSquare, 
  Map as MapIcon, Share2, Download, AlertCircle,
  Activity, ArrowLeft, Upload, Zap, Filter, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';

// Subcomponents
import EvidenceVault from '@/components/investigation/EvidenceVault';
import InvestigationGraph from '@/components/investigation/InvestigationGraph';
import TimelineReconstruction from '@/components/investigation/TimelineReconstruction';
import AIInvestigatorChat from '@/components/investigation/AIInvestigatorChat';
import ProcessingFeed from '@/components/investigation/ProcessingFeed';

export default function CaseWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('graph');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchCaseData();
    
    // Initialize Socket
    socketRef.current = io();
    socketRef.current.emit('join-case', id);
    
    // Real-time forensic updates
    socketRef.current.on(`case:${id}:update`, (update) => {
      console.log("Forensic update received:", update);
      fetchCaseData(); // Refresh all data when AI completes analysis
      toast.success("FORENSIC_INTELLIGENCE_SYNCED", {
        description: "Knowledge graph and timeline updated with new insights."
      });
    });

    socketRef.current.on(`case:${id}:processing`, (data) => {
      toast.info("PROCESSING_EVIDENCE", {
        description: `Analyzing ${data.title}...`
      });
    });
    
    return () => {
      socketRef.current?.off(`case:${id}:update`);
      socketRef.current?.off(`case:${id}:processing`);
      socketRef.current?.disconnect();
    };
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCaseData(data);
      } else {
        toast.error(data.error || "Failed to load case data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading case data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/cases/${id}/evidence`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success("INGEST_INITIATED", {
          description: `${file.name} sent to forensic analysis pipeline.`
        });
        setIsUploadOpen(false);
      } else {
        toast.error("INGEST_REJECTED");
      }
    } catch (err) {
      toast.error("INGEST_FAILURE");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !caseData) {
    return <div className="h-screen w-full flex items-center justify-center bg-background text-primary font-mono animate-pulse uppercase tracking-[0.5em]">RECONSTRUCTING NEURAL ASSETS...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      {/* TACTICAL SUB-HEADER */}
      <div className="h-10 border-b border-zinc-900 flex items-center justify-between px-6 bg-black shrink-0 z-30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(229,255,0,0.4)]" />
            <span className="text-[9px] font-mono text-primary font-black uppercase tracking-[0.2em]">Live_Analysis</span>
          </div>
          <div className="h-3 w-px bg-zinc-900" />
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest truncate max-w-[400px]">Node_Reference: {caseData.name}</p>
        </div>

        <div className="flex items-center space-x-1">
           <Button variant="ghost" size="sm" className="h-7 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-all px-3 rounded-none" onClick={() => navigate(`/gps/${id}`)}>
             <MapIcon className="w-2.5 h-2.5 mr-2" /> Recon
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-all px-3 rounded-none" onClick={() => navigate(`/simulation/${id}`)}>
             <Zap className="w-2.5 h-2.5 mr-2" /> Simul
           </Button>
           <div className="h-3 w-px bg-zinc-900 mx-2" />
           <Button size="sm" className="h-7 bg-primary text-black text-[9px] font-black uppercase tracking-widest px-4 hover:bg-primary/80 rounded-none transform skew-x-[-12deg]">
             <span className="skew-x-[12deg] flex items-center"><Download className="w-2.5 h-2.5 mr-2" /> Export</span>
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Evidence Vault */}
        <div className="w-[280px] border-r border-zinc-900 flex flex-col bg-zinc-950 shrink-0">
          <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-black">
            <h3 className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 font-bold">Evidence_Vault</h3>
            <div className="flex space-x-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-primary/60 hover:text-primary hover:bg-transparent"
                onClick={() => setIsUploadOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-700 hover:text-zinc-500 hover:bg-transparent">
                <Filter className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
            <EvidenceVault evidence={caseData.evidence} />
          </div>
        </div>

        {/* UPLOAD MODAL */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-900 p-0 overflow-hidden">
             <DialogHeader className="p-6 bg-black border-b border-zinc-900">
                <DialogTitle className="text-sm font-black italic uppercase tracking-tighter text-white">INGEST_NEW_EVIDENCE</DialogTitle>
                <DialogDescription className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                   Autonomous analyzer will extract entities and correlate timestamps.
                </DialogDescription>
             </DialogHeader>
             <div className="p-8 flex flex-col items-center justify-center space-y-6">
                <div className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 p-10 hover:border-primary/20 transition-all cursor-pointer relative group">
                   <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload} 
                      disabled={uploading}
                   />
                   <Upload className={cn("w-10 h-10 mb-4 transition-all", uploading ? "text-primary animate-bounce" : "text-zinc-800 group-hover:text-primary/40")} />
                   <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest text-center">
                      {uploading ? 'Processing_Signal...' : 'Drop_File_Or_Click'}
                   </p>
                </div>
                <div className="w-full space-y-2">
                   <div className="flex justify-between text-[7px] font-mono text-zinc-700 uppercase tracking-widest">
                      <span>Inference_Engine_Ready</span>
                      <span>STABLE</span>
                   </div>
                   <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                      {uploading && <div className="h-full bg-primary animate-[upload_2s_infinite]" />}
                   </div>
                </div>
             </div>
          </DialogContent>
        </Dialog>

        {/* CENTER: Knowledge Graph & Timeline */}
        <div className="flex-1 flex flex-col relative bg-black overflow-hidden">
          <div className="absolute top-4 left-4 z-20 flex p-0.5 bg-black/80 border border-zinc-900 rounded-sm backdrop-blur-md">
             <Button 
                variant={activeTab === 'graph' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('graph')} 
                className={cn(
                    "text-[8px] uppercase font-black tracking-widest h-6 px-3 rounded-none transition-all",
                    activeTab === 'graph' ? "bg-primary text-black" : "text-zinc-600 hover:text-primary hover:bg-transparent"
                )}
             >
                Global_Map
             </Button>
             <Button 
                variant={activeTab === 'timeline' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('timeline')} 
                className={cn(
                    "text-[8px] uppercase font-black tracking-widest h-6 px-3 rounded-none transition-all",
                    activeTab === 'timeline' ? "bg-primary text-black" : "text-zinc-600 hover:text-primary hover:bg-transparent"
                )}
             >
                Chronology
             </Button>
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {activeTab === 'graph' ? (
                <motion.div 
                  key="graph"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full"
                >
                  <InvestigationGraph entities={caseData.entities} relationships={caseData.relationships} />
                </motion.div>
              ) : (
                <motion.div 
                  key="timeline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full bg-black"
                >
                  <TimelineReconstruction timeline={caseData.timeline} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM: Realtime Processing Feed */}
          <div className="h-32 border-t border-zinc-900 bg-zinc-950 z-20 overflow-hidden flex flex-col shrink-0">
            <ProcessingFeed caseId={id!} socket={socketRef.current} />
          </div>
        </div>

        {/* RIGHT PANEL: AI Investigator & Contradictions */}
        <div className="w-[340px] border-l border-zinc-900 flex flex-col bg-zinc-950 shrink-0">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="px-4 border-b border-zinc-900 bg-black">
              <TabsList className="bg-transparent h-10 w-full justify-start space-x-6 p-0 border-none">
                <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full text-[9px] uppercase font-black tracking-widest px-0 transition-all">
                  <MessageSquare className="w-3 h-3 mr-2" />
                  Terminal_AI
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:bg-transparent data-[state=active]:text-red-500 border-b-2 border-transparent data-[state=active]:border-red-500 rounded-none h-full text-[9px] uppercase font-black tracking-widest px-0 transition-all">
                  <AlertCircle className="w-3 h-3 mr-2" />
                  Conflicts
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 focus-visible:ring-0">
              <AIInvestigatorChat caseId={id!} />
            </TabsContent>

            <TabsContent value="alerts" className="flex-1 overflow-y-auto m-0 p-5 space-y-5 focus-visible:ring-0 custom-scrollbar no-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest font-black italic">Active_Telemetry_Conflicts</h4>
                
                {caseData.relationships.filter((r: any) => r.is_contradiction).length > 0 ? (
                  caseData.relationships.filter((r: any) => r.is_contradiction).map((rel: any, idx: number) => (
                    <div key={idx} className="p-3 border border-red-900/30 bg-red-950/5 relative group hover:border-red-600/30 transition-all">
                      <div className="absolute top-0 right-0 p-1">
                          <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                      </div>
                      <div className="flex items-center text-red-700 mb-2">
                          <AlertCircle className="w-3 h-3 mr-2" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{rel.type || 'Contradiction_Detected'}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed group-hover:text-zinc-400">
                        {rel.description || `Inconsistency between identified entities detected by forensic engine.`}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-10 opacity-40">
                    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">No primary contradictions resolved currently.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
