import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('agent.bond@aiventra.io');
  const [password, setPassword] = useState('investigator_2026');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: 'Agent Bond' })
      });
      
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="w-[400px] glass-panel tactical-border z-10">
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full border border-primary/20 animate-pulse-glow">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tighter uppercase text-white">
              AIVENTRA <span className="text-primary/60 font-thin">OS</span>
            </CardTitle>
            <CardDescription className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Investigative Reasoning Platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Credential ID / Email</label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="investigator@aiventra.io" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/40 border-zinc-800 focus-visible:ring-primary h-10 pl-10"
                  />
                  <Fingerprint className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Cryptographic Access Key</label>
                <div className="relative">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-zinc-800 focus-visible:ring-primary h-10 pl-10"
                  />
                  <Cpu className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs h-11"
                disabled={loading}
              >
                {loading ? "Decrypting..." : isRegistering ? "Request Access" : "Initiate Unlock"}
              </Button>
              <Button 
                variant="link" 
                type="button"
                className="text-[10px] uppercase text-zinc-500 tracking-wider hover:text-primary transition-colors"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? "Already authorized? Sign in" : "New Investigator? Request credentials"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      {/* Forensic detail */}
      <div className="absolute bottom-10 left-10 text-[8px] font-mono text-zinc-700 tracking-[0.2em] uppercase max-w-sm leading-relaxed">
        Terminal Access Session: {new Date().toISOString()}<br />
        Encryption: AES-256-GCM / Forensic Reconstruction Layer Active<br />
        System Ready / Awaiting Investigative Validation
      </div>
    </div>
  );
}
