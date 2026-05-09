import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("aiventra.db");
const upload = multer({ dest: "uploads/" });

// Forensic Intelligence Orchestrator
class ForensicOrchestrator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async processEvidence(caseId: string, evidenceId: string, io: Server) {
    try {
      const evidence: any = db.prepare("SELECT * FROM evidence WHERE id = ?").get(evidenceId);
      const allEvidence: any[] = db.prepare("SELECT * FROM evidence WHERE case_id = ?").all(caseId);
      const caseData: any = db.prepare("SELECT * FROM cases WHERE id = ?").get(caseId);

      // Context construction
      const context = allEvidence.map(ev => `[${ev.type}] ${ev.title}: ${ev.content}`).join("\n");

      const prompt = `
        You are a Forensic Intelligence AI. You are analyzing new evidence for case "${caseData.name}".
        
        NEW EVIDENCE:
        Type: ${evidence.type}
        Title: ${evidence.title}
        Content: ${evidence.content}
        
        PREVIOUS CONTEXT:
        ${context}
        
        TASK:
        1. Extract new entities (people, locations, devices, events) found in the NEW EVIDENCE.
        2. Identify timeline events with precise (or estimated) timestamps from the NEW EVIDENCE.
        3. Determine relationships between entities, including potential contradictions with previous evidence.
        4. Generate 2-3 plausible simulation scenarios based on ALL available evidence.
        
        FORMAT: Return ONLY a JSON object:
        {
          "entities": [{"type": "person|location|device|event", "label": "Name", "properties": {}}],
          "timeline": [{"timestamp": "ISO8601 string", "label": "Short Title", "description": "Details", "type": "gps|witness|cctv|autopsy|document"}],
          "relationships": [{"source_item": "Entity Label", "target_item": "Entity Label", "type": "related_to", "strength": 0.0-1.0, "is_contradiction": boolean, "description": "Why"}],
          "scenarios": [{"name": "Scenario Title", "description": "Scenario Narrative", "probability": 0.0-1.0, "contradictions": ["Reason 1", "Reason 2"]}]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleaned);

      // Update Database
      db.transaction(() => {
        // 1. Entities
        for (const en of data.entities || []) {
          const id = "en_" + Math.random().toString(36).substr(2, 9);
          db.prepare("INSERT INTO entities (id, case_id, type, label, properties) VALUES (?, ?, ?, ?, ?)").run(
            id, caseId, en.type, en.label, JSON.stringify(en.properties || {})
          );
        }

        // 2. Timeline
        for (const t of data.timeline || []) {
          const id = "t_" + Math.random().toString(36).substr(2, 9);
          const ts = t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString();
          db.prepare("INSERT INTO timeline_events (id, case_id, timestamp, label, description, evidence_id, type) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
            id, caseId, ts, t.label, t.description, evidenceId, t.type
          );
        }

        // 3. Relationships
        const allEntities: any[] = db.prepare("SELECT * FROM entities WHERE case_id = ?").all(caseId);
        const getEntityId = (label: string) => allEntities.find(e => e.label.toLowerCase().includes(label.toLowerCase()))?.id;

        for (const rel of data.relationships || []) {
          const sourceId = getEntityId(rel.source_item);
          const targetId = getEntityId(rel.target_item);
          if (sourceId && targetId) {
            const id = "rel_" + Math.random().toString(36).substr(2, 9);
            db.prepare("INSERT INTO relationships (id, case_id, source_id, target_id, type, strength, is_contradiction) VALUES (?, ?, ?, ?, ?, ?, ?)")
              .run(id, caseId, sourceId, targetId, rel.type, rel.strength, rel.is_contradiction ? 1 : 0);
          }
        }

        // 4. Scenarios
        db.prepare("DELETE FROM simulation_scenarios WHERE case_id = ?").run(caseId);
        for (const s of data.scenarios || []) {
          const id = "sc_" + Math.random().toString(36).substr(2, 9);
          db.prepare("INSERT INTO simulation_scenarios (id, case_id, name, description, probability, contradictions) VALUES (?, ?, ?, ?, ?, ?)").run(
            id, caseId, s.name, s.description, s.probability, JSON.stringify(s.contradictions || [])
          );
        }

        // Mark evidence as processed
        db.prepare("UPDATE evidence SET status = 'processed' WHERE id = ?").run(evidenceId);
      })();

      // Broadcast updates
      io.emit(`case:${caseId}:update`, { evidenceId, status: 'processed' });

    } catch (error) {
      console.error("Orchestration Error:", error);
      db.prepare("UPDATE evidence SET status = 'error' WHERE id = ?").run(evidenceId);
      io.emit(`case:${caseId}:error`, { evidenceId, error: "AI Processing Failed" });
    }
  }
}

const orchestrator = new ForensicOrchestrator();

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'investigator'
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    creator_id TEXT,
    FOREIGN KEY(creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    type TEXT,
    title TEXT,
    content TEXT,
    metadata TEXT,
    trust_score REAL,
    anomaly_score REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    type TEXT,
    label TEXT,
    properties TEXT,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    source_id TEXT,
    target_id TEXT,
    type TEXT,
    strength REAL,
    is_contradiction BOOLEAN DEFAULT 0,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    timestamp DATETIME,
    label TEXT,
    description TEXT,
    evidence_id TEXT,
    type TEXT,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    name TEXT,
    description TEXT,
    probability REAL,
    contradictions TEXT, -- JSON string
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "forensic-secret-8877";

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.sendStatus(401);

      jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    } catch (err) {
      res.status(500).json({ error: "Authentication internal error" });
    }
  };

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, password, name } = req.body;
      const id = Math.random().toString(36).substr(2, 9);
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      db.prepare("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)").run(id, email, hashedPassword, name);
      const token = jwt.sign({ id, email }, JWT_SECRET);
      res.json({ token, user: { id, name, email } });
    } catch (e: any) {
      res.status(400).json({ error: e.message.includes("UNIQUE") ? "Email already exists" : e.message });
    }
  });

  // Cases API
  app.get("/api/cases", authenticateToken, (req: any, res) => {
    try {
      const cases = db.prepare("SELECT * FROM cases ORDER BY created_at DESC").all();
      res.json(cases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cases", authenticateToken, (req: any, res) => {
    try {
      const { name, description } = req.body;
      const id = "case_" + Math.random().toString(36).substr(2, 9);
      db.prepare("INSERT INTO cases (id, name, description, creator_id) VALUES (?, ?, ?, ?)").run(id, name, description, req.user.id);
      res.json({ id, name, description });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cases/:id", authenticateToken, (req, res) => {
    try {
      const caseData = db.prepare("SELECT * FROM cases WHERE id = ?").get(req.params.id);
      if (!caseData) return res.status(404).json({ error: "Case not found" });
      
      const evidence = db.prepare("SELECT * FROM evidence WHERE case_id = ?").all(req.params.id);
      const entities = db.prepare("SELECT * FROM entities WHERE case_id = ?").all(req.params.id);
      const relationships = db.prepare("SELECT * FROM relationships WHERE case_id = ?").all(req.params.id);
      const timeline = db.prepare("SELECT * FROM timeline_events WHERE case_id = ? ORDER BY timestamp ASC").all(req.params.id);
      const scenarios = db.prepare("SELECT * FROM simulation_scenarios WHERE case_id = ?").all(req.params.id);

      res.json({ 
        ...(caseData as object), 
        evidence, 
        entities, 
        relationships, 
        timeline,
        scenarios: scenarios.map((s: any) => ({
          ...s,
          contradictions: JSON.parse(s.contradictions || "[]")
        }))
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Evidence API
  app.post("/api/cases/:id/evidence", authenticateToken, upload.single("file"), async (req: any, res) => {
    try {
      const caseId = req.params.id;
      const { type, title, content } = req.body;
      const file = req.file;
      
      const id = "ev_" + Math.random().toString(36).substr(2, 9);
      const trust_score = 0.5 + Math.random() * 0.4;
      const anomaly_score = Math.random() * 0.3;
      
      let finalContent = content || "";
      if (file) {
        // In a real app we'd OCR/parse here. For now we assume the client might've sent content
        // or we use the filename as starting point if it's empty.
        finalContent = finalContent || `Uploaded file: ${file.originalname}`;
      }

      db.prepare(`
        INSERT INTO evidence (id, case_id, type, title, content, metadata, trust_score, anomaly_score, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, caseId, type || "document", title || (file ? file.originalname : "Untitled"), finalContent, JSON.stringify({ filename: file?.originalname }), trust_score, anomaly_score, "processing");

      // Trigger processing event via WS
      io.emit(`case:${caseId}:processing`, { id, title: title || file?.originalname, status: 'processing' });

      // Run Orchestration in background
      orchestrator.processEvidence(caseId, id, io);

      res.json({ id, title, status: "processing" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Investigator Chat
  app.post("/api/cases/:id/chat", authenticateToken, async (req: any, res) => {
    try {
      const { message } = req.body;
      const caseId = req.params.id;
      
      const caseData: any = db.prepare("SELECT * FROM cases WHERE id = ?").get(caseId);
      const evidence = db.prepare("SELECT * FROM evidence WHERE case_id = ?").all(caseId);
      const entities = db.prepare("SELECT * FROM entities WHERE case_id = ?").all(caseId);
      const timeline = db.prepare("SELECT * FROM timeline_events WHERE case_id = ? ORDER BY timestamp ASC").all(caseId);
      const relationships = db.prepare("SELECT * FROM relationships WHERE case_id = ?").all(caseId);
      
      const context = `
        Case: ${caseData.name}
        Desc: ${caseData.description}
        
        Entities: ${entities.map((e: any) => e.label).join(", ")}
        Timeline: ${timeline.map((t: any) => `[${t.timestamp}] ${t.label}`).join("; ")}
        Evidence Summary: ${evidence.map((ev: any) => ev.title).join(", ")}
        Key Relationships: ${relationships.map((r: any) => `${r.source_id} -> ${r.target_id} (${r.type})`).join("; ")}
      `;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        You are the AIVENTRA Lead Investigator.
        CONVERSATION CONTEXT:
        ${context}
        
        USER QUESTION:
        ${message}
        
        INSTRUCTIONS:
        1. Be decisive and analytical.
        2. Reference specific evidence titles or entities from the context.
        3. Mention potential contradictions if they exist.
        4. Keep responses professional and forensic in tone.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ response: response.text() });
      
      // Log message
      const msgId = "msg_" + Math.random().toString(36).substr(2, 9);
      db.prepare("INSERT INTO chat_messages (id, case_id, role, content) VALUES (?, ?, ?, ?)").run(msgId, caseId, "assistant", response.text());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DEV: Seed Mock Data
  app.post("/api/dev/seed", async (req, res) => {
    try {
      const caseId = "case_homicide_101";
      const userId = "agent_bond_007";
      
      // Clear existing for this case
      db.prepare("DELETE FROM cases WHERE id = ?").run(caseId);
      db.prepare("DELETE FROM evidence WHERE case_id = ?").run(caseId);
      db.prepare("DELETE FROM entities WHERE case_id = ?").run(caseId);
      db.prepare("DELETE FROM timeline_events WHERE case_id = ?").run(caseId);
      db.prepare("DELETE FROM relationships WHERE case_id = ?").run(caseId);

      // Seed Case
      db.prepare("INSERT INTO cases (id, name, description, creator_id) VALUES (?, ?, ?, ?)").run(
        caseId, 
        "Dockyard Warehouse Homicide Reconstruction", 
        "Post-mortem reconstruction of the incident at Pier 4. High contradiction risk in witness statements.",
        userId
      );

      // Seed Evidence
      const evidence = [
        { id: 'ev_1', type: 'autopsy', title: 'Autopsy Preliminary Notes', content: 'COD: Blunt force trauma to occipital region. estimated TOD: 21:30 - 22:30.' },
        { id: 'ev_2', type: 'witness', title: 'Witness Statement: Security Guard', content: 'Observed victim entering warehouse at 21:15. Left post for patrol at 21:20.' },
        { id: 'ev_3', type: 'gps', title: 'Victim Phone GPS Log', metadata: { lat: 12.91, lng: 80.21, path: [{lat: 12.91, lng: 80.21, t: '21:12'}, {lat: 12.912, lng: 80.215, t: '21:18'}] } },
        { id: 'ev_4', type: 'cctv', title: 'CCTV Entry Exit Log', content: 'Motion detected at North Gate at 21:45. Signature unrecognizable.' }
      ];

      for (const ev of evidence) {
        db.prepare(`
          INSERT INTO evidence (id, case_id, type, title, content, metadata, trust_score, anomaly_score) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(ev.id, caseId, ev.type, ev.title, ev.content || '', JSON.stringify(ev.metadata || {}), 0.8, 0.1);
      }

      // Seed Entities
      const entities = [
        { id: 'en_1', type: 'person', label: 'Victim: Marcus V.' },
        { id: 'en_2', type: 'location', label: 'Warehouse Pier 4' },
        { id: 'en_3', type: 'person', label: 'Guard: Elias P.' },
        { id: 'en_4', type: 'device', label: 'Mobile Device (Primary)' }
      ];

      for (const en of entities) {
        db.prepare("INSERT INTO entities (id, case_id, type, label) VALUES (?, ?, ?, ?)").run(en.id, caseId, en.type, en.label);
      }

      // Seed Relationships
      db.prepare("INSERT INTO relationships (id, case_id, source_id, target_id, type, strength) VALUES (?, ?, ?, ?, ?, ?)")
        .run('rel_1', caseId, 'en_1', 'en_2', 'was_at', 0.9);
      db.prepare("INSERT INTO relationships (id, case_id, source_id, target_id, type, strength, is_contradiction) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run('rel_2', caseId, 'en_3', 'en_1', 'witnessed', 0.4, 1);

      // Seed Timeline
      const timeline = [
        { id: 't_1', timestamp: '2025-08-11T21:12:00', label: 'GPS Entry Detected', description: 'Victim device signals entrance into Pier 4 perimeter.', type: 'gps' },
        { id: 't_2', timestamp: '2025-08-11T21:15:00', label: 'Visual Sighting', description: 'Security guard reports seeing victim enter Warehouse.', type: 'witness' },
        { id: 't_3', timestamp: '2025-08-11T21:45:00', label: 'CCTV Motion', description: 'Unidentified figure exits Pier 4 gate.', type: 'cctv' },
        { id: 't_4', timestamp: '2025-08-11T22:05:00', label: 'Manual Lock Trigger', description: 'Bio-metric override detected on secondary hatch.', type: 'system' }
      ];

      for (const t of timeline) {
        db.prepare("INSERT INTO timeline_events (id, case_id, timestamp, label, description, type) VALUES (?, ?, ?, ?, ?, ?)")
          .run(t.id, caseId, t.timestamp, t.label, t.description, t.type);
      }

      // Seed some Witness statements
      db.prepare("INSERT INTO evidence (id, case_id, type, title, content, trust_score, anomaly_score) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run('ev_wit_1', caseId, 'witness', 'Elias Thorne Statement', 'I was patrolling Pier 4 at 21:00. Heard a crash at 21:05.', 0.88, 0.05);
      db.prepare("INSERT INTO evidence (id, case_id, type, title, content, trust_score, anomaly_score) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run('ev_wit_2', caseId, 'witness', 'Sarah Vance Statement', 'Saw a dark figure moving rapidly towards the containers at 21:40.', 0.65, 0.45);

      res.json({ success: true, caseId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    socket.on("join-case", (caseId) => {
      socket.join(`case:${caseId}`);
      console.log(`Socket joined case: ${caseId}`);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`AIVENTRA Engine running on http://localhost:${PORT}`);
    
    // Create default agent for demo
    const agentId = "agent_bond_007";
    const agentEmail = "agent.bond@aiventra.io";
    const agentPassword = bcrypt.hashSync("investigator_2026", 10);
    try {
      db.prepare("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)").run(agentId, agentEmail, agentPassword, "Agent Bond");
      console.log("Default investigative agent provisioned.");
    } catch(e) {}
  });
}

startServer();
