import { useState, useEffect } from 'react';
import { userAPI, ekipAPI, bransAPI } from '../services/api';

export default function Kullanicilar() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [ekipler, setEkipler] = useState([]);
  const [branslar, setBranslar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEkip, setSelectedEkip] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEkip) {
      loadBranslar(selectedEkip);
    }
  }, [selectedEkip]);

  const loadData = async () => {
    try {
      const [userResponse, ekipResponse] = await Promise.all([
        userAPI.getAll(),
        ekipAPI.getAll(),
      ]);
      setKullanicilar(userResponse.data.data);
      setEkipler(ekipResponse.data.data);
    } catch (error) {
      alert('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadBranslar = async (ekipId) => {
    try {
      const response = await bransAPI.getAll(ekipId);
      setBranslar(response.data.data);
    } catch (error) {
      console.error('Branşlar yüklenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await userAPI.delete(id);
      alert('Kullanıcı silindi');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Silme işlemi başarısız');
    }
  };

  const getRolBadge = (rol) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      soru_yazici: 'bg-blue-100 text-blue-800',
      dizgici: 'bg-green-100 text-green-800',
    };
    const labels = {
      admin: 'Admin',
      soru_yazici: 'Soru Yazıcı',
      dizgici: 'Dizgici',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[rol]}`}>
        {labels[rol]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : kullanicilar.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Henüz kullanıcı yok</h3>
          <p className="mt-1 text-sm text-gray-500">Kayıt sayfasından yeni kullanıcılar ekleyebilirsiniz</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ekip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Branş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kullanicilar.map((kullanici) => (
                <tr key={kullanici.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {kullanici.ad_soyad}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{kullanici.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRolBadge(kullanici.rol)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {kullanici.ekip_adi || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {kullanici.brans_adi || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        kullanici.aktif
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {kullanici.aktif ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(kullanici.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
