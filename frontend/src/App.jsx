import React from 'react';
import { Link } from 'react-router-dom';
import './csses/index.css';

function App() {
  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <h1>Akademik Dergi</h1>
          <span>Bilimsel Yayın Yönetim Platformu</span>
        </div>
        
        <div className="sidebar-content">
          <h2>Akademik Çalışmalarınızı Kolayca Yönetin</h2>
          <p>
            Makalelerinizi gönderin, hakem değerlendirmelerini takip edin ve 
            yayın süreçlerinizi tek bir platformdan yönetin.
          </p>
          
          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Kolay makale gönderimi</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Hızlı değerlendirme süreci</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Şeffaf hakem değerlendirmesi</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="main-heading">
          <h2>Kullanıcı Girişi</h2>
          <p>Lütfen sisteme giriş yapmak için rolünüzü seçin</p>
        </div>
        
        <div className="button-group">
          <Link to="/yazar" style={{ textDecoration: 'none' }}>
            <button className="yazar-giris">
              <div className="button-icon">📝</div>
              <div className="button-text">
                <h3>Yazar Girişi</h3>
                <p>Makalelerinizi gönderin ve durumlarını takip edin</p>
              </div>
            </button>
          </Link>
          
          <Link to="/hakem" style={{ textDecoration: 'none' }}>
            <button className="hakem-giris">
              <div className="button-icon">👁️</div>
              <div className="button-text">
                <h3>Hakem Girişi</h3>
                <p>Değerlendirmeniz için atanan makaleleri inceleyin</p>
              </div>
            </button>
          </Link>
          
          <Link to="/editor" style={{ textDecoration: 'none' }}>
            <button className="editor-giris">
              <div className="button-icon">📊</div>
              <div className="button-text">
                <h3>Editör Girişi</h3>
                <p>Yayın süreçlerini yönetin ve değerlendirmeleri izleyin</p>
              </div>
            </button>
          </Link>
          
          <Link to="/query" style={{ textDecoration: 'none' }}>
            <button className="sorgu-giris">
              <div className="button-icon">🔍</div>
              <div className="button-text">
                <h3>Sorgu Girişi</h3>
                <p>Makale durumunuzu ve değerlendirmeleri kontrol edin</p>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
