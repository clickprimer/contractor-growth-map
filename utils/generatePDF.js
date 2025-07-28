import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePDF({ name, email, businessType, result }) {
  const doc = new jsPDF();
  const lineHeight = 8;
  let y = 20;

  // HEADER
  doc.setTextColor('#0068ff');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Contractor AI Marketing Map', 105, y, { align: 'center' });

  y += 10;
  doc.setTextColor('#002654');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'italic');
  doc.text('Customized for you by ClickPrimer', 105, y, { align: 'center' });

  // LEAD INFO
  y += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (name) doc.text(`Name: ${name}`, 20, y);
  if (email) doc.text(`Email: ${email}`, 20, y += lineHeight);
  if (businessType) doc.text(`Business Type: ${businessType}`, 20, y += lineHeight);

  // Parse GPT response into sections
  const sections = {
    strengths: '',
    weaknesses: '',
    nextSteps: '',
    offers: ''
  };

  if (result) {
    const lower = result.toLowerCase();
    const chunks = result.split(/(?:\n|^)(?=🛠|✨|🔧|📦|Your|\n###)/gi);
    chunks.forEach(chunk => {
      const lowerChunk = chunk.toLowerCase();
      if (lowerChunk.includes('strength') && !sections.strengths) sections.strengths = chunk.trim();
      else if (lowerChunk.includes('bottleneck') || lowerChunk.includes('missed') || lowerChunk.includes('weakness')) sections.weaknesses += chunk.trim() + '\n';
      else if (lowerChunk.includes('next step')) sections.nextSteps += chunk.trim() + '\n';
      else if (lowerChunk.includes('clickprimer match') || lowerChunk.includes('tool') || lowerChunk.includes('offer')) sections.offers += chunk.trim() + '\n';
    });
  }

  const addSection = (title, content) => {
    if (!content) return;
    y += lineHeight * 2;
    doc.setTextColor('#0068ff');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, y);
    y += 6;
    doc.setDrawColor('#0068ff');
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000');

    const lines = doc.splitTextToSize(content, 170);
    lines.forEach(line => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });
  };

  addSection('Your Marketing Strengths', sections.strengths);
  addSection('Your Bottlenecks & Missed Opportunities', sections.weaknesses);
  addSection('Recommended Next Steps to Accelerate Your Business', sections.nextSteps);
  addSection('Your ClickPrimer Matches', sections.offers);

  // CTA + Footer
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#0068ff');
  doc.setFontSize(12);
  doc.text('Need help implementing your AI Marketing Map?', 105, y, { align: 'center' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#002654');
  doc.text('Schedule a setup call: https://www.map.clickprimer.com/aimm-setup-call', 105, y, { align: 'center' });

  y += 6;
  doc.text('Call us: (208) 314-4088 or visit https://clickprimer.com/contact', 105, y, { align: 'center' });

  y += 10;
  doc.setFontSize(10);
  doc.setTextColor('#666666');
  doc.text('© ClickPrimer 2025. All Rights Reserved. Not for Distribution.', 105, y, { align: 'center' });

  doc.save('ClickPrimer-Marketing-Map.pdf');
}
