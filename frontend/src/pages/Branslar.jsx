import { useState, useEffect } from 'react';
import { bransAPI, ekipAPI } from '../services/api';

export default function Branslar() {
  const [branslar, setBranslar] = useState([]);
  const [ekipler, setEkipler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrans, setEditingBrans] = useState(null);
  const [formData, setFormData] = useState({
    brans_adi: '',
    ekip_id: '',
    aciklama: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bransResponse, ekipResponse] = await Promise.all([
        bransAPI.getAll(),
        ekipAPI.getAll(),
      ]);
      setBranslar(bransResponse.data.data);
      setEkipler(ekipResponse.data.data);
    } catch (error) {
      alert('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrans) {
        await bransAPI.update(editingBrans.id, formData);
        alert('Branş güncellendi!');
      } else {
        await bransAPI.create(formData);
        alert('Branş oluşturuldu!');
      }
      setShowModal(false);
      setFormData({ brans_adi: '', ekip_id: '', aciklama: '' });
      setEditingBrans(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'İşlem başarısız');
    }
  };

  const handleEdit = (brans) => {
    setEditingBrans(brans);
    setFormData({
      brans_adi: brans.brans_adi,
      ekip_id: brans.ekip_id,
      aciklama: brans.aciklama || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu branşı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await bransAPI.delete(id);
      alert('Branş silindi');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Silme işlemi başarısız');
    }
  };

  const openNewModal = () => {
    setEditingBrans(null);
    setFormData({ brans_adi: '', ekip_id: '', aciklama: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Branş Yönetimi</h1>
        <button onClick={openNewModal} className="btn btn-primary">
          + Yeni Branş
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : branslar.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Henüz branş yok</h3>
          <p className="mt-1 text-sm text-gray-500">Önce bir ekip oluşturun, sonra branş ekleyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branslar.map((brans) => (
            <div key={brans.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{brans.brans_adi}</h3>
                  <p className="text-sm text-gray-500">{brans.ekip_adi}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(brans)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(brans.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Sil
                  </button>
                </div>
              </div>
              
              {brans.aciklama && (
                <p className="text-gray-600 text-sm mb-4">{brans.aciklama}</p>
              )}
              
              <div className="text-sm">
                <span className="text-gray-500">Soru Sayısı:</span>
                <span className="ml-2 font-medium">{brans.soru_sayisi || 0}</span>
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
              {editingBrans ? 'Branş Düzenle' : 'Yeni Branş'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branş Adı *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.brans_adi}
                  onChange={(e) => setFormData({ ...formData, brans_adi: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ekip *
                </label>
                <select
                  required
                  className="input"
                  value={formData.ekip_id}
                  onChange={(e) => setFormData({ ...formData, ekip_id: e.target.value })}
                >
                  <option value="">Ekip Seçin</option>
                  {ekipler.map((ekip) => (
                    <option key={ekip.id} value={ekip.id}>
                      {ekip.ekip_adi}
                    </option>
                  ))}
                </select>
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
                  {editingBrans ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
