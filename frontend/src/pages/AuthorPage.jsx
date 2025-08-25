import { Link } from "react-router-dom";
import { useState } from "react";
import "../csses/AuthorPage.css";

function AuthorPage() {
  const [email, setEmail] = useState("");
  const [authorExists, setAuthorExists] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState(null);
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("Dosya Seçilmedi");

  const checkAuthorExists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/authors/email/${email}`);
      
      if (!response.ok) {
        throw new Error("Yazar bulunamadı.");
      }
  
      const jsonData = await response.json();
      setAuthorExists(true);
      setAuthorId(jsonData.id);
      alert("Yazar bulundu.");

      fetchArticles(jsonData.id);
    } catch (error) {
      console.error("Hata:", error);
      setAuthorId("");
      setAuthorExists(false);
      alert("Yazar bulunamadı.");

      fetchArticles("");
    }
    setLoading(false);
  };  
  
  const fetchArticles = async (authorId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/articles/author/${authorId}`);
      if (response.ok) {
        const data = await response.json();
        const filteredArticles = data.filter(
          article => article.status !== 'ANONYMIZED' && !article.title.toLowerCase().includes('anonim')
        );
        setArticles(filteredArticles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Makale çekme hatası:", error);
      setArticles([]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !authorId) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    if (title.toLowerCase().includes("anonim")) {
      alert("Makale başlığında 'Anonim' kelimesi geçemez.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("authorId", authorId);
  
    try {
      const response = await fetch("http://localhost:8080/api/articles/upload", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Makale başarıyla yüklendi:", data);
        alert(`Makale başarıyla yüklendi! Takip numarası: ${data.trackingNumber}`);

        fetchArticles(authorId);
        setFile(null);
        setTitle("");
        setSelectedFileName("Dosya Seçilmedi");
      } else {
        const errorText = await response.text();
        console.error("Makale yükleme başarısız:", errorText);
        alert("Makale yükleme başarısız: " + errorText);
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
      alert("Bağlantı hatası: Sunucuya ulaşılamıyor.");
    }
  };  

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSelectedFileName(selectedFile.name);
    } else {
      setFile(null);
      setSelectedFileName("Dosya Seçilmedi");
    }
  };

  const handleSendMessage = async () => {
    if (!email || !message) {
      alert("E-posta ve mesaj alanları doldurulmalıdır.");
      return;
    }

    const newMessage = {
      senderEmail: email,
      receiverEmail: "batinerkeozturk@example.com",
      content: message
    };

    try {
      const response = await fetch("http://localhost:8080/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        console.log("Mesaj başarıyla gönderildi!");
        setMessage("");
        alert("Mesaj başarıyla gönderildi!");
      } else {
        alert("Mesaj gönderme başarısız!");
        console.error("Mesaj gönderme başarısız:", response.status);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  return (
    <div className="author-page">
      <header className="page-header">
        <Link to="/">
          <button className="back-button">
            <span>&#8592;</span> Ana Sayfa
          </button>
        </Link>
        <h2 className="page-title">Yazar Sayfası</h2>
      </header>

      <div className="content-container">
        <div className="left-panel">
          <div className="author-info-section">
            <h3 className="section-title">Yazar Bilgileri</h3>
            <div className="form-group">
              <label>E-posta Adresi</label>
              <div className="search-input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi girin"
                />
                <button className="search-button" onClick={checkAuthorExists} disabled={loading}>
                  {loading ? "..." : "Ara"}
                </button>
              </div>
              {authorExists === true && <div className="status-badge success">Yazar Bulundu</div>}
              {authorExists === false && <div className="status-badge error">Yazar Bulunamadı</div>}
            </div>
          </div>

          <div className="upload-section">
            <h3 className="section-title">Makale Yükleme</h3>
            <div className="form-group">
              <label>Makale Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Makalenizin başlığını girin"
              />
            </div>
            <div className="form-group">
              <label>PDF Dosyası</label>
              <div className="file-upload">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <span className="file-button">Dosya Seç</span>
                  <span className="file-name">{selectedFileName}</span>
                </label>
              </div>
            </div>
            <button 
              className="upload-button" 
              onClick={handleUpload}
              disabled={!file || !title || !authorId}
            >
              Makale Yükle
            </button>
          </div>
        </div>

        <div className="right-panel">
          <div className="message-section">
            <h3 className="section-title">Editöre Mesaj Gönder</h3>
            <div className="form-group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesajınızı buraya yazın..."
                rows="4"
              ></textarea>
            </div>
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={!email || !message}
            >
              Mesaj Gönder
            </button>
          </div>
        </div>
      </div>

      <div className="articles-section">
        <h3 className="section-title">Makalelerim</h3>
        <div className="articles-container">
          {articles.length > 0 ? (
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Durum</th>
                  <th>Takip No</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>{article.title}</td>
                    <td>
                      <span className={`status-pill ${article.status.toLowerCase()}`}>
                        {article.status}
                      </span>
                    </td>
                    <td>{article.trackingNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-articles">
              <p>Henüz makaleniz bulunmamaktadır.</p>
              <p className="hint">Yeni bir makale yüklemek için yukarıdaki formu kullanabilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthorPage;
