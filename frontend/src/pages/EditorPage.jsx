import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../csses/EditorPage.css";

function EditorPage() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [downloadPdf, setDownloadPdf] = useState("");
  const [assignPdf, setAssignPdf] = useState("");
  const [selectedReferee, setSelectedReferee] = useState("");
  const [referees, setReferees] = useState([]);
  const [sendToAuthorPdf, setSendToAuthorPdf] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = () => {
    setIsLoading(true);
    fetch("http://localhost:8080/api/articles")
      .then((response) => response.json())
      .then((data) => {
        setPdfFiles(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Dosya listesi alınamadı:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (assignPdf) {
      const selectedArticle = pdfFiles.find(
        (pdf) => pdf.trackingNumber === assignPdf
      );

      if (selectedArticle) {
        const interestField = selectedArticle.interest_field || "";
        fetch(
          `http://localhost:8080/api/reviewers/by-field?interestField=${encodeURIComponent(
            interestField
          )}`
        )
          .then((response) => response.json())
          .then((data) => {
            setReferees(data);
          })
          .catch((error) => {
            console.error("Hakem listesi alınamadı:", error);
          });
      }
    } else {
      setReferees([]);
    }
  }, [assignPdf, pdfFiles]);

  const handleAssignField = () => {
    if (!selectedPdf) {
      alert("Lütfen bir makale seçin.");
      return;
    }

    setIsLoading(true);
    fetch("http://localhost:8080/api/articles/assign-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: selectedPdf }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Alan atandı: " + data.message);
        console.log(data);
        fetchArticles();
      })
      .catch((error) => {
        console.error("Alan atanırken hata oluştu:", error);
        setIsLoading(false);
      });
  };

  const handleDownload = () => {
    if (!downloadPdf) {
      alert("Lütfen indirilecek bir makale seçin.");
      return;
    }

    setIsLoading(true);
    fetch(`http://localhost:8080/api/articles/download/${downloadPdf}`)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data && data.filePath) {
          const link = document.createElement("a");
          link.href = data.filePath;
          link.download = `${downloadPdf}.pdf`;
          link.click();
        } else {
          alert("Dosya bulunamadı.");
        }
      })
      .catch((error) => {
        console.error("Dosya indirilemedi:", error);
        setIsLoading(false);
      });
  };

  const handleAnonymize = () => {
    if (!selectedPdf) {
      alert("Lütfen anonimleştirilecek bir makale seçin.");
      return;
    }

    setIsLoading(true);
    fetch("http://localhost:8080/api/articles/anonymize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: selectedPdf }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data && data.filePath) {
          alert("Makale anonimleştirildi ve başarıyla kaydedildi.");
          fetchArticles();
        } else {
          alert("Anonimleştirme başarısız oldu.");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Anonimleştirme hatası:", error);
        alert("Anonimleştirme işlemi sırasında bir hata oluştu.");
      });
  };

  const handleSendToReferee = () => {
    if (!assignPdf || !selectedReferee) {
      alert("Lütfen makale ve hakem seçin.");
      return;
    }

    const selectedArticle = pdfFiles.find(
      (pdf) => pdf.trackingNumber === assignPdf
    );

    if (!selectedArticle) {
      alert("Seçilen makale bulunamadı.");
      return;
    }

    const articleId = selectedArticle.id;

    fetch(
      `http://localhost:8080/api/reviews/assign?articleId=${articleId}&reviewerId=${selectedReferee}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        alert("Makale hakeme başarıyla atandı.");

        setAssignPdf("");
        setSelectedReferee("");

        fetchArticles();
      })
      .catch((error) => {
        console.error("Hakem atama işlemi başarısız:", error);
        alert("Hakem atama işlemi sırasında bir hata oluştu.");
      });
  };

  const handleSendToAuthor = () => {
    if (!sendToAuthorPdf) {
      alert("Lütfen yazara gönderilecek makale seçin.");
      return;
    }

    setIsLoading(true);

    fetch(`http://localhost:8080/api/articles/${sendToAuthorPdf}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "COMPLETED",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Durum güncellenirken hata oluştu.");
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
        alert("Makale yazara başarıyla gönderildi.");
        fetchArticles();
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Makale yazara gönderilemedi:", error);
        alert("Makale yazara gönderilirken bir hata oluştu.");
      });
  };

  return (
    <div className="editor-page">
      <header className="page-header">
        <Link to="/">
          <button className="back-button">
            <span>&#8592;</span> Ana Sayfa
          </button>
        </Link>
        <h2 className="page-title">Editör Sayfası</h2>
        <div className="header-icons">
          <Link to="/message" className="icon-link">
            <div className="icon-wrapper">
              <img
                src="src/resources/message.png"
                alt="Mesajlar"
                className="header-icon"
              />
            </div>
          </Link>
          <Link to="/log" className="icon-link">
            <div className="icon-wrapper">
              <img
                src="src/resources/log.png"
                alt="Loglar"
                className="header-icon"
              />
            </div>
          </Link>
        </div>
      </header>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>İşlem yapılıyor...</p>
        </div>
      )}

      <div className="content-container">
        <div className="editor-section">
          <h3 className="section-title">Tüm Makaleler</h3>
          <div className="form-group">
            <label>Makale Seçici</label>
            <select
              value={downloadPdf}
              onChange={(e) => setDownloadPdf(e.target.value)}
              className="editor-select"
            >
              <option value="">Bir makale seçin</option>
              {pdfFiles.map((pdf, index) => (
                <option key={`dl-${index}`} value={pdf.trackingNumber}>
                  {pdf.title}
                </option>
              ))}
            </select>
          </div>
          <button className="editor-button" onClick={handleDownload}>
            İndir
          </button>
        </div>

        <div className="editor-section">
          <h3 className="section-title">Yazarların Gönderdiği Makaleler</h3>
          <div className="form-group">
            <label>Makale Seçici</label>
            <select
              value={selectedPdf}
              onChange={(e) => setSelectedPdf(e.target.value)}
              className="editor-select"
            >
              <option value="">Bir makale seçin</option>
              {pdfFiles
                .filter((pdf) => !pdf.title.endsWith(" - Anonim"))
                .map((pdf, index) => (
                  <option key={`sel-${index}`} value={pdf.trackingNumber}>
                    {pdf.title} - {pdf.interest_field || "Alan atanmamış"}
                  </option>
                ))}
            </select>
          </div>
          <div className="button-group">
            <button className="editor-button" onClick={handleAssignField}>
              Alan Ata
            </button>
            <button className="editor-button" onClick={handleAnonymize}>
              Anonimleştir
            </button>
          </div>
        </div>

        <div className="editor-section">
          <h3 className="section-title">Hakeme Gönderilecek Makale</h3>
          <div className="form-group">
            <label>Makale Seçici</label>
            <select
              value={assignPdf}
              onChange={(e) => setAssignPdf(e.target.value)}
              className="editor-select"
            >
              <option value="">Bir makale seçin</option>
              {pdfFiles
                .filter((pdf) => pdf.status === "ANONYMIZED")
                .map((pdf, index) => (
                  <option key={`assign-${index}`} value={pdf.trackingNumber}>
                    {pdf.title} - {pdf.interest_field || "Alan atanmamış"}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label>Hakem Seçici</label>
            <select
              value={selectedReferee}
              onChange={(e) => setSelectedReferee(e.target.value)}
              className="editor-select"
            >
              <option value="">Bir hakem seçin</option>
              {referees.length > 0 ? (
                referees.map((referee) => (
                  <option key={referee.id} value={referee.id}>
                    {referee.email} - {referee.interestField}
                  </option>
                ))
              ) : (
                <option disabled>Uygun hakem bulunamadı</option>
              )}
            </select>
          </div>

          <button className="editor-button" onClick={handleSendToReferee}>
            Hakeme Gönder
          </button>
        </div>

        <div className="editor-section">
          <h3 className="section-title">Yazara Gönderilecek Makale</h3>
          <div className="form-group">
            <label>Makale Seçici</label>
            <select
              value={sendToAuthorPdf}
              onChange={(e) => setSendToAuthorPdf(e.target.value)}
              className="editor-select"
            >
              <option value="">Bir makale seçin</option>
              {pdfFiles
                .filter(
                  (pdf) =>
                    pdf.status === "REVIEWED" && !pdf.title.includes("Anonim")
                )
                .map((pdf, index) => (
                  <option key={`author-${index}`} value={pdf.trackingNumber}>
                    {pdf.title}
                  </option>
                ))}
            </select>
          </div>
          <button className="editor-button" onClick={handleSendToAuthor}>
            Yazara Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
