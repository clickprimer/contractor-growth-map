import jsPDF from 'jspdf';

export function generatePDF({ name, businessType, answers, result }) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor('#0068ff');
  doc.text('Your Marketing Blueprint', 20, 20);

  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`Name: ${name}`, 20, 30);
  doc.text(`Business Type: ${businessType}`, 20, 37);

  doc.text('Your Quiz Answers:', 20, 50);
  let y = 60;
  for (const [key, value] of Object.entries(answers)) {
    doc.text(`${key}: ${value}`, 25, y);
    y += 7;
  }

  doc.text('GPT Advice:', 20, y + 10);
  const lines = doc.splitTextToSize(result, 170);
  doc.text(lines, 20, y + 20);

  doc.save('marketing-map.pdf');
}
