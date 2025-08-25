import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../csses/LogPage.css";

function LogPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/logs");
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        } else {
          console.error("Logları çekerken hata oluştu");
        }
      } catch (error) {
        console.error("Bağlantı hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="log-page">
      <header className="page-header">
        <Link to="/editor">
          <button className="back-button">
            <span>&#8592;</span> Editör Sayfası
          </button>
        </Link>
        <h2 className="page-title">Log Sayfası</h2>
        <div className="header-icons">
          <Link to="/message" className="icon-link">
            <div className="icon-wrapper">
              <img src="src/resources/message.png" alt="Mesajlar" className="header-icon" />
            </div>
          </Link>
        </div>
      </header>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loglar yükleniyor...</p>
        </div>
      )}

      <div className="log-container">
        <div className="log-section">
          <h3 className="section-title">Log Kayıtları</h3>
          <div className="log-table-container">
            {logs.length > 0 ? (
              <table className="log-table">
                <thead>
                  <tr>
                    <th>İçerik</th>
                    <th>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.content}</td>
                      <td>{new Date(log.timeStamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-logs">
                <p>Henüz log kaydı bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogPage;
