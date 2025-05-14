SKS Etkinlik Yönetimi - Proje Dokümantasyonu
📘 Proje Tanımı
SKS Etkinlik Yönetimi sistemi, üniversite bünyesindeki etkinliklerin dijital ortamda oluşturulmasını, onay süreçlerinin yürütülmesini ve birimlerle ilişkilendirilmesini sağlayan tam kapsamlı bir web uygulamasıdır.
🚀 Özellikler
- Kullanıcı girişi ve kaydı
- Etkinlik oluşturma, listeleme ve detay görüntüleme
- Yönetim, Admin ve SKS rolleriyle onay süreçleri
- Birim ve kullanıcı yönetimi
- PDF çıktısı oluşturma (SKS onayından sonra)
- Rol tabanlı yetkilendirme ve yönlendirme
- Şifre değiştirme ekranı
🛠️ Kullanılan Teknolojiler
Frontend: React.js, React Router DOM, MUI, Axios, Framer Motion
Backend: Node.js, Express.js, MongoDB (Mongoose), JWT, Nodemailer, PDFKit
👤 Kullanıcı Rolleri
- Kullanıcı (user): Etkinlik oluşturabilir.
- Admin: Birimindeki etkinlikleri onaylar.
- SKS: Admin onaylı etkinlikleri onaylar ve PDF oluşturur.
- Yönetim (management): Kullanıcı ve birim yönetimi yapar.
📁 Proje Klasör Yapısı
SKS-ETKINLIK-YONETIMI/
├── client/ (React uygulaması)	
├── controllers/ (Sunucu işlemleri)
├── models/ (MongoDB modelleri)
├── routes/ (API rotaları)
├── middleware/ (JWT vs.)
├── utils/ (Mail ve PDF işlemleri)
└── server.js
🔐 .env Ortam Değişkenleri
PORT=5000
MONGO_URI=mongodb+srv://<kullanıcı>:<şifre>@cluster.mongodb.net/sks-db
JWT_SECRET=secret_key
CLIENT_URL=http://localhost:3000
EMAIL_USER=mail@example.com
EMAIL_PASS=email_sifresi
💾 Veritabanı Bağlantısı
MongoDB Atlas üzerinde barındırılan veritabanına bağlantı, backend projesinin kök dizinindeki .env dosyasında belirtilen `MONGO_URI` kullanılarak sağlanır. Örnek bağlantı: 
mongodb+srv://admin:password@cluster0.mongodb.net/sks-db?retryWrites=true&w=majority
Backend sunucusu (server.js), uygulama başlatılırken bu URI ile MongoDB’ye bağlanır. Bağlantı başarısız olursa terminalde hata mesajı görüntülenir.
📦 Kurulum
1. Proje dizinine girin:
cd SKS-ETKINLIK-YONETIMI
2. Sunucuyu başlatın:
npm install && npm start
3. Client dizininde frontend başlatın:
cd client && npm install && npm start
📄 Lisans
Bu proje açık kaynaklıdır ve eğitim amaçlı geliştirilmiştir.
