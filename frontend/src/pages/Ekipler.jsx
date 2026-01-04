import { useState, useEffect } from 'react';
import { ekipAPI } from '../services/api';

export default function Ekipler() {
  const [ekipler, setEkipler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEkip, setEditingEkip] = useState(null);
  const [formData, setFormData] = useState({
    ekip_adi: '',
    aciklama: '',
  });

  useEffect(() => {
    loadEkipler();
  }, []);

  const loadEkipler = async () => {
    try {
      const response = await ekipAPI.getAll();
      setEkipler(response.data.data);
    } catch (error) {
      alert('Ekipler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEkip) {
        await ekipAPI.update(editingEkip.id, formData);
        alert('Ekip güncellendi!');
      } else {
        await ekipAPI.create(formData);
        alert('Ekip oluşturuldu!');
      }
      setShowModal(false);
      setFormData({ ekip_adi: '', aciklama: '' });
      setEditingEkip(null);
      loadEkipler();
    } catch (error) {
      alert(error.response?.data?.error || 'İşlem başarısız');
    }
  };

  const handleEdit = (ekip) => {
    setEditingEkip(ekip);
    setFormData({
      ekip_adi: ekip.ekip_adi,
      aciklama: ekip.aciklama || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu ekibi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await ekipAPI.delete(id);
      alert('Ekip silindi');
      loadEkipler();
    } catch (error) {
      alert(error.response?.data?.error || 'Silme işlemi başarısız');
    }
  };

  const openNewModal = () => {
    setEditingEkip(null);
    setFormData({ ekip_adi: '', aciklama: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ekip Yönetimi</h1>
        <button onClick={openNewModal} className="btn btn-primary">
          + Yeni Ekip
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : ekipler.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Henüz ekip yok</h3>
          <p className="mt-1 text-sm text-gray-500">Yeni ekip oluşturun</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ekipler.map((ekip) => (
            <div key={ekip.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{ekip.ekip_adi}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(ekip)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(ekip.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sil
                  </button>
                </div>
              </div>
              
              {ekip.aciklama && (
                <p className="text-gray-600 text-sm mb-4">{ekip.aciklama}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Branş Sayısı:</span>
                  <span className="ml-2 font-medium">{ekip.brans_sayisi || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Kullanıcı:</span>
                  <span className="ml-2 font-medium">{ekip.kullanici_sayisi || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {editingEkip ? 'Ekip Düzenle' : 'Yeni Ekip'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ekip Adı *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.ekip_adi}
                  onChange={(e) => setFormData({ ...formData, ekip_adi: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows="3"
                  className="input"
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEkip ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
