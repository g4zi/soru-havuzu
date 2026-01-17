import pool from '../../config/database.js';

export const createMultipleBranslar = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Kullanıcı-Branş ilişki tablosu (çoklu branş için)
        await client.query(`
      CREATE TABLE IF NOT EXISTS kullanici_branslari (
        id SERIAL PRIMARY KEY,
        kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
        brans_id INTEGER REFERENCES branslar(id) ON DELETE CASCADE,
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(kullanici_id, brans_id)
      )
    `);

        // İndeks
        await client.query('CREATE INDEX IF NOT EXISTS idx_kullanici_branslari_kullanici ON kullanici_branslari(kullanici_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_kullanici_branslari_brans ON kullanici_branslari(brans_id)');

        // Mevcut tek branş verilerini yeni tabloya aktar
        await client.query(`
      INSERT INTO kullanici_branslari (kullanici_id, brans_id)
      SELECT id, brans_id FROM kullanicilar 
      WHERE brans_id IS NOT NULL
      ON CONFLICT (kullanici_id, brans_id) DO NOTHING
    `);

        await client.query('COMMIT');
        console.log('✅ Çoklu branş tablosu oluşturuldu ve mevcut veriler aktarıldı');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Çoklu branş migration hatası:', error);
        throw error;
    } finally {
        client.release();
    }
};
