import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const investigativeModel = "gemini-3-flash-preview";

export async function extractInvestigativeSignals(content: string, type: string) {
  const prompt = `
    You are an elite forensic intelligence analyst at AIVENTRA.
    Analyze the following ${type} evidence and extract investigative signals.
    
    Evidence Content:
    ${content}
    
    Return a JSON object with:
    1. entities: array of { label, type, properties } (types: person, location, timestamp, device, injury, observation)
    2. timeline_events: array of { timestamp, label, description, event_type }
    3. observations: array of critical investigative findings
    4. suspicions: any potential contradictions or oddities
    5. recommended_followup: what should the investigator do next?
    
    Be objective and technical. Use confidence markers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: investigativeModel,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return null;
  }
}

export async function reconstructScenario(caseSummary: string, evidence: any[]) {
  const prompt = `
    Analyze the following forensic evidence for case: ${caseSummary}.
    
    Evidence Base:
    ${JSON.stringify(evidence)}
    
    Generate 2-3 alternate reconstruction scenarios (Scenario A, Scenario B, etc.).
    For each scenario, provide:
    1. title
    2. probability_score (0-1)
    3. chronological_summary
    4. supporting_evidence_ids
    5. contradictions_found
    6. reasoning_chain
    
    Return as structured JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: investigativeModel,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Scenario Reconstruction Error:", error);
    return null;
  }
}
