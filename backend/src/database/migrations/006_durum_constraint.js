import pool from '../../config/database.js';

export const updateDurumConstraint = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Eski constraint'i kaldır ve yenisini ekle
        await client.query(`
      ALTER TABLE sorular 
      DROP CONSTRAINT IF EXISTS sorular_durum_check
    `);

        await client.query(`
      ALTER TABLE sorular 
      ADD CONSTRAINT sorular_durum_check 
      CHECK (durum IN ('beklemede', 'dizgide', 'tamamlandi', 'revize_gerekli'))
    `);

        await client.query('COMMIT');
        console.log('✅ Durum constraint güncellendi (revize_gerekli eklendi)');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Durum constraint güncelleme hatası:', error);
        throw error;
    } finally {
        client.release();
    }
};
