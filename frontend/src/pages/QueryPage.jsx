import { useState } from 'react';
import { Link } from 'react-router-dom';
import "../csses/QueryPage.css";

function QueryPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [queryResult, setQueryResult] = useState({
    article: '',
    reviewerComment: '',
    reviewerScore: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  const handleQuery = async () => {
    if (!trackingNumber.trim()) return;
  
    setIsLoading(true);
  
    try {
      const response = await fetch(`http://localhost:8080/api/articles/get/${trackingNumber}`);
      
      if (!response.ok) {
        throw new Error("Makale bulunamadı.");
      }
  
      const data = await response.json();

      if (data.status !== "COMPLETED") {
        alert("Makale henüz tamamlanmadı. Değerlendirme süreci devam ediyor.");
        setIsLoading(false);
        return;
      }  
      
      setQueryResult({
        article: data.article || "Bilinmeyen Makale",
        reviewerComment: data.reviewerComment || "Henüz değerlendirilmedi",
        reviewerScore: data.reviewerScore || "N/A",
      });
  
      setHasQueried(true);
    } catch (error) {
      console.error("Sorgulama hatası:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="query-page">
      <header className="page-header">
        <Link to="/">
          <button className="back-button">
            <span>&#8592;</span> Ana Sayfa
          </button>
        </Link>
        <h2 className="page-title">Sorgulama Sayfası</h2>
      </header>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Sorgulanıyor...</p>
        </div>
      )}
      
      <div className="query-container">
        <div className="query-section">
          <h3 className="section-title">Makale Sorgula</h3>
          <div className="query-form">
            <div className="form-group">
              <label htmlFor="trackingNumber">Takip Numarası:</label>
              <input 
                type="text" 
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Makale takip numarasını giriniz"
              />
            </div>
            <button className="query-button" onClick={handleQuery}>
              Sorgula
            </button>
          </div>
        </div>
        
        <div className="results-section">
          <h3 className="section-title">Bilgiler</h3>
          {hasQueried ? (
            <div className="results-content">
              <div className="form-group">
                <label htmlFor="article">Makale:</label>
                <input 
                  type="text" 
                  id="article"
                  value={queryResult.article}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="reviewerComment">Hakem Yorumu:</label>
                <input 
                  type="text" 
                  id="reviewerComment"
                  value={queryResult.reviewerComment}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="reviewerScore">Hakem Puanı:</label>
                <input 
                  type="text" 
                  id="reviewerScore"
                  value={queryResult.reviewerScore + "/10"}
                  readOnly
                />
              </div>
            </div>
          ) : (
            <div className="empty-results">
              <p>Sorgulama yapılmadı. Lütfen bir takip numarası girin ve "Sorgula" düğmesine tıklayın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueryPage;
