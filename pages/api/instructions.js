
import fs from 'fs';
import path from 'path';

function loadInstructions() {
  const candidates = [
    path.join(process.cwd(), 'utils', 'gpt-instructions.txt'),
    path.join(process.cwd(), 'utils', 'gpt-instructions (1).txt'),
    path.join(process.cwd(), 'gpt-instructions.txt'),
    path.join(process.cwd(), 'gpt-instructions (1).txt')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf8');
        const match = txt.match(/#+\s*Welcome[\s\S]*?(?=\n#+|$)/i);
        if (match) return match[0].trim();
        return txt.slice(0, 1200).trim();
      }
    } catch {}
  }
  return "Great — here’s how this works: pick the best A–D option for each topic. If I need more detail, I’ll ask a quick follow-up. At the end, I’ll build your Contractor Growth Map with strengths, bottlenecks, and prioritized recommendations.";
}

export default function handler(req, res) {
  try {
    const text = loadInstructions();
    res.status(200).json({ text });
  } catch {
    res.status(200).json({ text: "Let's begin." });
  }
}
