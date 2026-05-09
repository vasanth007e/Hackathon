import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Quote, Zap, Activity, Fingerprint, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'agent' | 'user';
  content: string;
  reasoning?: string[];
  reference_ids?: string[];
}

export default function AIInvestigatorChat({ caseId }: { caseId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: 'AIVENTRA AI INVESTigative OS v4.2 INITIALIZED. Cross-referencing forensic node clusters. Neural reasoning core status: NOMINAL.',
      reasoning: ['Neural index synched', 'Evidence manifold expanded', 'Dissonance engine armed']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentInput })
      });

      const data = await response.json();
      if (response.ok) {
        const agentMsg: Message = {
          id: Date.now().toString(),
          role: 'agent',
          content: data.response,
          reasoning: ['Context Analysis Complete', 'Evidence Correlation Sync', 'Neural Inference Match']
        };
        setMessages(prev => [...prev, agentMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: "ERROR: NEURAL_DISCONNECT. RE-ESTABLISHING UPLINK..."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
       <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none overflow-hidden font-mono text-[80px] font-black italic break-all flex items-center justify-center -rotate-12">
           AIVENTRA_OS_CORE_SYST_SEC_A11
       </div>

      <ScrollArea className="flex-1 p-4 relative z-10 custom-scrollbar" viewportRef={scrollRef}>
        <div className="space-y-8">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center space-x-2 text-[8px] font-mono uppercase tracking-[0.3em] px-1 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse text-zinc-700' : 'text-zinc-600'}`}>
                   {msg.role === 'agent' ? <Fingerprint className="w-3 h-3 text-primary animate-pulse" /> : <User className="w-3 h-3 text-zinc-800" />}
                   <span>{msg.role === 'agent' ? 'Sys_Neural_Copilot' : 'Lead_Inv_Session'}</span>
                </div>
                
                <div className={`p-4 border shadow-2xl relative overflow-hidden ${
                  msg.role === 'user' 
                  ? 'bg-zinc-950 border-zinc-900 text-zinc-400 rounded-bl-xl' 
                  : 'bg-black border-zinc-900 text-zinc-100 rounded-br-xl'
                }`}>
                  <div className="absolute top-0 right-0 p-1">
                     <div className={`w-1 h-1 rounded-full ${msg.role === 'agent' ? 'bg-primary' : 'bg-zinc-800'}`} />
                  </div>

                  <p className={`text-[11px] leading-relaxed ${msg.role === 'agent' ? 'font-mono uppercase tracking-tight' : 'font-sans'}`}>
                    {msg.content}
                  </p>
                  
                  {msg.reasoning && (
                    <div className="mt-5 pt-4 border-t border-zinc-900 space-y-3">
                      <p className="text-[9px] font-black text-primary flex items-center uppercase tracking-[0.2em]">
                        <Zap className="w-3 h-3 mr-2" />
                        Neural_Chain_Ref
                      </p>
                      <ul className="space-y-2 pl-1">
                        {msg.reasoning.map((r, i) => (
                          <li key={i} className="flex items-start text-[9px] text-zinc-600 font-mono tracking-tighter uppercase group">
                            <span className="mr-3 text-primary/30 font-bold">[{i+1}]</span>
                            <span className="group-hover:text-primary/60 transition-colors">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.reference_ids && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {msg.reference_ids.map(id => (
                         <div key={id} className="px-2 py-0.5 bg-zinc-950 border border-zinc-900 rounded text-[8px] font-mono text-zinc-700 group cursor-crosshair hover:text-primary transition-all uppercase">
                            Linked_Dat: {id}
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-black border border-zinc-900 p-3 rounded-xl rounded-tl-none">
                 <div className="flex space-x-2">
                   <div className="w-1 h-1 bg-primary/60 rounded-full animate-ping" />
                   <span className="text-[8px] font-mono text-primary/60 uppercase tracking-[0.4em] animate-pulse">Computing...</span>
                 </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-900 bg-black/95 z-20">
        <div className="relative group">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT QUERY OR CMD..."
            className="bg-black border-zinc-900 focus-visible:ring-primary h-14 text-[10px] font-mono uppercase tracking-[0.2em] pr-12 group-hover:border-primary/20 transition-all rounded-none placeholder:text-zinc-900"
          />
          <Button 
            onClick={handleSend}
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-3 h-8 w-8 text-primary hover:bg-primary/10 transition-all rounded-none"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[7px] font-mono text-zinc-900 uppercase tracking-[0.4em] px-1 select-none">
           <span className="flex items-center">
              <Activity className="w-2.5 h-2.5 mr-1" />
              Latency: 0.04ms
           </span>
           <span className="flex items-center text-primary/30">
              <ShieldCheck className="w-2.5 h-2.5 mr-1" />
              Auth_Level: SYSTEM_ADMIN
           </span>
        </div>
      </div>
    </div>
  );
}
