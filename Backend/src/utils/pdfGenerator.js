const PDFDocument = require('pdfkit');

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toISOString().split('T')[0];
};

const generateSupplyPDF = (supply, items = []) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Supply Note', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text(`Supply ID: ${supply._id}`);
      doc.text(`Invoice Number: ${supply.invoiceNumber || '-'}`);
      doc.text(`Vendor: ${supply.vendorId?.name || '-'}`);
      doc.text(`Batch Number: ${supply.batchNumber || '-'}`);
      doc.text(`Supply Date: ${formatDate(supply.supplyDate)}`);
      doc.text(`Expiry Date: ${formatDate(supply.expiryDate)}`);
      doc.moveDown(1);

      const columns = [
        { label: 'Medicine', x: 40, width: 220 },
        { label: 'Batch', x: 260, width: 100 },
        { label: 'Qty', x: 360, width: 60 },
        { label: 'Price', x: 420, width: 70 },
        { label: 'Total', x: 490, width: 80 },
      ];

      const startY = doc.y;
      doc.fontSize(10).fillColor('#000000');
      columns.forEach((col) => doc.text(col.label, col.x, startY, { width: col.width }));
      doc.moveTo(40, startY + 16).lineTo(560, startY + 16).stroke();
      doc.moveDown(1);

      let total = 0;
      items.forEach((item) => {
        const y = doc.y;
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const lineTotal = quantity * price;
        total += lineTotal;
        doc.text(item.medicineName || item.name || '-', 40, y, { width: 220 });
        doc.text(item.batchNumber || supply.batchNumber || '-', 260, y, { width: 100 });
        doc.text(String(quantity), 360, y, { width: 60 });
        doc.text(`Rs. ${price}`, 420, y, { width: 70 });
        doc.text(`Rs. ${lineTotal}`, 490, y, { width: 80 });
      });

      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Grand Total: Rs. ${total}`, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = { generateSupplyPDF };