const PDFDocument = require('pdfkit');

const generateSupplyPDF = (supply, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('Pharmacy Supply Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Supply ID: ${supply._id}`);
      doc.text(`Date: ${supply.date ? new Date(supply.date).toDateString() : 'N/A'}`);
      doc.text(`Vendor: ${supply.vendorId || 'N/A'}`);
      doc.moveDown();
      items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.medicineName || 'N/A'} - Qty: ${item.quantity || 0}`);
      });
      doc.moveDown();
      doc.text('Authorized Signature: ____________________');
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateSupplyPDF };
