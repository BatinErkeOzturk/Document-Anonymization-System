import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../csses/ReviewerPage.css";

function ReviewerPage() {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [score, setScore] = useState("");
  const [selectedArticle, setSelectedArticle] = useState("");
  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewerId, setReviewerId] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (!reviewerId) return;

    const fetchReviewsAndArticles = async () => {
      setIsLoading(true);
      try {
        const reviewResponse = await fetch(
          `http://localhost:8080/api/reviews/byReviewer?reviewerId=${reviewerId}`
        );
        const reviewData = await reviewResponse.json();

        if (reviewData && Array.isArray(reviewData)) {
          setReviews(reviewData);
          const articleResponse = await fetch(
            `http://localhost:8080/api/articles`
          );
          const articleData = await articleResponse.json();

          console.log(articleData);

          const filteredArticles = articleData.filter((article) =>
            reviewData.some((review) => review.articleId === article.id)
          );

          setArticles(filteredArticles); 
        }
      } catch (error) {
        console.error("Error fetching reviews and articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewsAndArticles();
  }, [reviewerId, triggerFetch]);

  const getSelectedArticleObject = () => {
    return articles.find((article) => article.id === selectedArticle);
  };

  const handleArticleChange = (event) => {
    setSelectedArticle(event.target.value);
  };

  const handleDownloadArticle = () => {
    if (!selectedArticle) {
      alert("Lütfen indirilecek bir makale seçin.");
      return;
    }

    console.log("Seçilen Makale:", selectedArticle);

    const trackingNumber = getSelectedArticleObject()?.trackingNumber;

    if (!trackingNumber) {
      alert("Seçilen makale için tracking number bulunamadı.");
      return;
    }

    setIsLoading(true);
    fetch(`http://localhost:8080/api/articles/download/${trackingNumber}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Yanıtı:", data);
        setIsLoading(false);
        if (data && data.filePath) {
          const link = document.createElement("a");
          link.href = data.filePath;
          link.download = `${selectedArticle.title}.pdf`;
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

  const handleSearch = async () => {
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/reviewers?email=${email}`
      );
      const data = await response.json();

      if (data.id) {
        console.log(data.id);
        setReviewerId(data.id);
      } else {
        alert("Reviewer bulunamadı.");
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim() || !score || !selectedArticle) {
      alert("Lütfen tüm alanları doldurduğunuzdan emin olun.");
      return;
    }

    setIsLoading(true);
    try {
      const reviewData = {
        comments: comment,
        rating: parseInt(score),
      };

      console.log(selectedArticle);
      console.log(reviewerId);

      const response = await fetch(
        `http://localhost:8080/api/reviews/update?articleId=${selectedArticle}&reviewerId=${reviewerId}&status=REVIEWED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        }
      );

      const message = await response.text();
      if (message) {
        alert("Değerlendirmeniz başarıyla gönderildi!");
        setTriggerFetch((prev) => !prev);

        setComment("");
        setScore("");
        setSelectedArticle("");
        setIsLoading(false);
      } else {
        alert(`Hata: ${data.message || "Bir şeyler yanlış gitti."}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Submission error:", error);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="reviewer-page">
      <header className="page-header">
        <Link to="/">
          <button className="back-button">
            <span>&#8592;</span> Ana Sayfa
          </button>
        </Link>
        <h2 className="page-title">Hakem Sayfası</h2>
      </header>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>İşleminiz gerçekleştiriliyor...</p>
        </div>
      )}

      <div className="reviewer-container">
        <div className="search-section">
          <div className="form-row">
            <label htmlFor="email">Mail:</label>
            <div className="search-input-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Hakem e-posta adresi"
              />
              <button className="search-button" onClick={handleSearch}>
                <p>Ara</p>
              </button>
            </div>
          </div>
        </div>

        <div className="review-form-section">
          <h3 className="section-title">Makale Değerlendirme</h3>
          <div className="review-form">
            <div className="form-row">
              <label htmlFor="article">Makale Seçici:</label>
              <div className="article-select-container">
                <select
                  id="article"
                  value={selectedArticle}
                  onChange={handleArticleChange}
                  className="article-select"
                >
                  <option value="">Makale seçiniz</option>
                  {articles
                    .filter(
                      (article) =>
                        article.title.includes("Anonim") &&
                        article.status === "UNDER_REVIEW"
                    )
                    .map((article) => (
                      <option key={article.id} value={article.id}>
                        {article.title}
                      </option>
                    ))}
                </select>
                <button
                  className="download-button"
                  onClick={handleDownloadArticle}
                  disabled={!selectedArticle}
                >
                  <span className="download-icon">&#8595;</span> İndir
                </button>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="comment">Yorum:</label>
              <input
                type="text"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Makale hakkında değerlendirmeniz"
              />
            </div>

            <div className="form-row score-row">
              <label htmlFor="score">Puan:</label>
              <input
                type="number"
                id="score"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="1-10 arası"
              />
              <button className="submit-button" onClick={handleSubmit}>
                Gönder
              </button>
            </div>
          </div>
        </div>

        <div className="past-reviews-section">
          <h3 className="section-title">Değerlendirmelerim</h3>
          <div className="reviews-table-container">
            {reviews.length > 0 ? (
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>Değerlendirme ID</th>
                    <th>Makale Adı</th>{" "}
                    <th>Yorum</th>
                    <th>Puan</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const article = articles.find(
                      (article) => article.id === review.articleId
                    );

                    if (article && !article.title.includes("Anonim") && (article.status === "REVIEWED" || article.status === "COMPLETED")) {
                      return (
                        <tr key={review.id}>
                          <td>{review.id}</td>
                          <td>{article.title}</td>{" "}
                          <td>{review.comments}</td>
                          <td>{review.rating}/10</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-reviews">
                <p>Henüz değerlendirmeniz bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewerPage;
