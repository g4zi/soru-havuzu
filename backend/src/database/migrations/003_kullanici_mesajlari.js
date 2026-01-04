import pool from '../../config/database.js';

export async function createUserMessages() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Kullanıcılar arası doğrudan mesajlaşma tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS kullanici_mesajlari (
        id SERIAL PRIMARY KEY,
        gonderen_id INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
        alici_id INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
        mesaj TEXT NOT NULL,
        dosya_url VARCHAR(500),
        okundu BOOLEAN DEFAULT false,
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_kullanici_mesajlari_gonderen ON kullanici_mesajlari(gonderen_id);
      CREATE INDEX IF NOT EXISTS idx_kullanici_mesajlari_alici ON kullanici_mesajlari(alici_id);
      CREATE INDEX IF NOT EXISTS idx_kullanici_mesajlari_okundu ON kullanici_mesajlari(okundu);
    `);

    await client.query('COMMIT');
    console.log('✅ Kullanıcı mesajları tablosu oluşturuldu');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Kullanıcı mesajları migration hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}
