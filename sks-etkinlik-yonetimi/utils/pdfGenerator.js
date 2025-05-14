const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePDF = async (event) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfPath = path.join(__dirname, '../public/pdfs', `etkinlik-onay-${event._id}.pdf`);
      
      // Klasörün varlığını kontrol et, yoksa oluştur
      const dir = path.dirname(pdfPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(pdfPath);
      
      doc.pipe(writeStream);
      
      // PDF Başlık
      doc.fontSize(20).text('ETKİNLİK ONAY BELGESİ', { align: 'center' });
      doc.moveDown();
      
      // Üniversite logosu eklenebilir
      // doc.image('path/to/logo.png', { width: 150, align: 'center' });
      // doc.moveDown();
      
      // Etkinlik bilgileri
      doc.fontSize(14).text(`Etkinlik Adı: ${event.title}`);
      doc.moveDown(0.5);
      
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date(event.date).toLocaleDateString('tr-TR', dateOptions);
      doc.text(`Etkinlik Tarihi: ${formattedDate}`);
      doc.moveDown(0.5);
      
      doc.text(`Topluluk: ${event.unit.name || 'Belirtilmemiş'}`);
      doc.moveDown(0.5);
      
      doc.text(`Oluşturan: ${event.createdBy.name || 'Belirtilmemiş'}`);
      doc.moveDown(0.5);
      
      const adminApprovalDate = event.adminApprovedAt ? 
        new Date(event.adminApprovedAt).toLocaleDateString('tr-TR', dateOptions) : 
        'Henüz Onaylanmadı';
      doc.text(`Admin Onay Tarihi: ${adminApprovalDate}`);
      doc.moveDown(0.5);
      
      const sksApprovalDate = event.sksApprovedAt ? 
        new Date(event.sksApprovedAt).toLocaleDateString('tr-TR', dateOptions) : 
        'Henüz Onaylanmadı';
      doc.text(`SKS Onay Tarihi: ${sksApprovalDate}`);
      doc.moveDown(0.5);
      
      // Açıklama
      doc.moveDown();
      doc.fontSize(12).text(`Etkinlik Açıklaması:`, { underline: true });
      doc.moveDown(0.5);
      doc.text(event.description || '');
      doc.moveDown();
      
      // Onay metni ve imza alanları
      doc.moveDown(2);
      doc.fontSize(10).text(
        'Bu belge, yukarıda belirtilen etkinliğin ilgili birimler tarafından onaylandığını gösterir.',
        { align: 'center' }
      );
      
      doc.moveDown(2);
      
      // İmza alanları
      doc.fontSize(12);
      doc.text('Admin Onayı', 150, 650, { width: 100, align: 'center' });
      doc.text('SKS Onayı', 350, 650, { width: 100, align: 'center' });
      
      doc.moveTo(100, 680).lineTo(200, 680).stroke();
      doc.moveTo(300, 680).lineTo(400, 680).stroke();
      
      // Tarih ve Sayı
      doc.fontSize(10).text(`Belge No: SKS-${event._id.toString().substr(-5)}`, 50, 730);
      doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 400, 730, { align: 'right' });
      
      doc.end();
      
      writeStream.on('finish', () => {
        resolve(pdfPath);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
