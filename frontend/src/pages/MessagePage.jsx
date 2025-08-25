import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../csses/MessagePage.css";

function MessagePage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error("Mesajları çekerken hata oluştu");
        }
      } catch (error) {
        console.error("Bağlantı hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  return (
    <div className="message-page">
      <header className="page-header">
        <Link to="/editor">
          <button className="back-button">
            <span>&#8592;</span> Editör Sayfası
          </button>
        </Link>
        <h2 className="page-title">Mesaj Sayfası</h2>
        <div className="header-icons">
          <Link to="/log" className="icon-link">
            <div className="icon-wrapper">
              <img src="src/resources/log.png" alt="Loglar" className="header-icon" />
            </div>
          </Link>
        </div>
      </header>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Mesajlar yükleniyor...</p>
        </div>
      )}
      
      <div className="message-container">
        <div className="message-section">
          <h3 className="section-title">Mesaj Kayıtları</h3>
          <div className="message-table-container">
            {messages.length > 0 ? (
              <table className="message-table">
                <thead>
                  <tr>
                    <th>Gönderen</th>
                    <th>Mesaj</th>
                    <th>Gönderme Saati</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message, index) => (
                    <tr key={index}>
                      <td>{message.senderEmail}</td>
                      <td>{message.content}</td>
                      <td>{new Date(message.sentAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-messages">
                <p>Henüz mesaj bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagePage;
