import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { soruAPI } from '../services/api';
import MesajKutusu from '../components/MesajKutusu';

export default function SoruDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [soru, setSoru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dizgiNotu, setDizgiNotu] = useState('');
  const [showMesajlar, setShowMesajlar] = useState(false);

  useEffect(() => {
    loadSoru();
  }, [id]);

  const loadSoru = async () => {
    try {
      const response = await soruAPI.getById(id);
      setSoru(response.data.data);
    } catch (error) {
      alert('Soru yüklenemedi');
      navigate('/sorular');
    } finally {
      setLoading(false);
    }
  };

  const handleDizgiTamamla = async () => {
    try {
      await soruAPI.dizgiTamamla(id, { notlar: dizgiNotu });
      alert('Dizgi tamamlandı!');
      loadSoru();
    } catch (error) {
      alert(error.response?.data?.error || 'Dizgi tamamlama başarısız');
    }
  };

  const handleSil = async () => {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await soruAPI.delete(id);
      alert('Soru silindi');
      navigate('/sorular');
    } catch (error) {
      alert(error.response?.data?.error || 'Silme işlemi başarısız');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!soru) return null;

  const getDurumBadge = (durum) => {
    const badges = {
      beklemede: 'badge badge-warning',
      dizgide: 'badge badge-info',
      tamamlandi: 'badge badge-success',
      revize_gerekli: 'badge badge-error',
    };
    const labels = {
      beklemede: 'Beklemede',
      dizgide: 'Dizgide',
      tamamlandi: 'Tamamlandı',
      revize_gerekli: 'Revize Gerekli',
    };
    return <span className={badges[durum]}>{labels[durum]}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Soru Detayları */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Soru Detayı</h1>
              <p className="mt-2 text-gray-600">Soru #{soru.id}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => navigate('/sorular')} className="btn btn-secondary">
                ← Geri
              </button>
              {(user?.rol === 'admin' || soru.olusturan_kullanici_id === user?.id) && (
                <button onClick={handleSil} className="btn btn-danger">
                  Sil
                </button>
              )}
            </div>
          </div>

      {/* Soru Bilgileri */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getDurumBadge(soru.durum)}
            {soru.zorluk_seviyesi && (
              <span className="badge bg-gray-100 text-gray-800">
                {soru.zorluk_seviyesi}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {new Date(soru.olusturulma_tarihi).toLocaleString('tr-TR')}
          </p>
        </div>

        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-3">Soru Metni</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{soru.soru_metni}</p>
        </div>

        {soru.fotograf_url && (
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3">Fotoğraf</h4>
            <img
              src={soru.fotograf_url}
              alt="Soru fotoğrafı"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Branş:</span>
              <span className="ml-2 font-medium">{soru.brans_adi}</span>
            </div>
            <div>
              <span className="text-gray-500">Ekip:</span>
              <span className="ml-2 font-medium">{soru.ekip_adi}</span>
            </div>
            <div>
              <span className="text-gray-500">Oluşturan:</span>
              <span className="ml-2 font-medium">{soru.olusturan_ad}</span>
              {soru.olusturan_email && (
                <span className="ml-1 text-gray-400">({soru.olusturan_email})</span>
              )}
            </div>
            {soru.dizgici_ad && (
              <div>
                <span className="text-gray-500">Dizgici:</span>
                <span className="ml-2 font-medium">{soru.dizgici_ad}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dizgi İşlemleri */}
      {user?.rol === 'dizgici' && soru.durum === 'dizgide' && soru.dizgici_id === user.id && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Dizgi Tamamla</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar (Opsiyonel)
              </label>
              <textarea
                rows="4"
                className="input"
                placeholder="Dizgi hakkında notlar..."
                value={dizgiNotu}
                onChange={(e) => setDizgiNotu(e.target.value)}
              />
            </div>
            <button onClick={handleDizgiTamamla} className="btn btn-primary">
              Dizgiyi Tamamla
            </button>
          </div>
        </div>
      )}

      {/* Dizgi Geçmişi */}
      {soru.dizgi_gecmisi && soru.dizgi_gecmisi.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Dizgi Geçmişi</h3>
          <div className="space-y-3">
            {soru.dizgi_gecmisi.map((gecmis) => (
              <div key={gecmis.id} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{gecmis.dizgici_ad}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(gecmis.tamamlanma_tarihi).toLocaleString('tr-TR')}
                  </span>
                </div>
                {gecmis.notlar && (
                  <p className="mt-1 text-sm text-gray-600">{gecmis.notlar}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
        </div>

        {/* Sağ Panel - Mesajlaşma */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="card p-0 overflow-hidden">
              <button
                onClick={() => setShowMesajlar(!showMesajlar)}
                className="w-full px-4 py-3 bg-primary-600 text-white font-semibold flex items-center justify-between hover:bg-primary-700 transition"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Mesajlaşma
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${showMesajlar ? 'rotate-180' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showMesajlar && (
                <div className="h-[600px]">
                  <MesajKutusu
                    soruId={id}
                    soruSahibi={{ ad_soyad: soru.olusturan_ad }}
                    dizgici={{ ad_soyad: soru.dizgici_ad }}
                  />
                </div>
              )}
            </div>

            {/* Hızlı Bilgi */}
            {!showMesajlar && (
              <div className="card mt-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💬 İpucu</h4>
                <p className="text-sm text-blue-800">
                  Soru hakkında dizgici veya soru yazıcı ile mesajlaşabilirsiniz.
                  Mesajlaşma butonuna tıklayın.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
