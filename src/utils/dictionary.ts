/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Kamus lokal kata-kata umum Bahasa Indonesia untuk kebutuhan sehari-hari
 * pasien dengan disabilitas motorik (kebutuhan dasar, kesehatan, kenyamanan, keluarga).
 */
export const INDONESIAN_DICTIONARY: string[] = [
  // Frasa/kata dasar
  'SAYA', 'MAU', 'TOLONG', 'MINTA', 'BISA', 'TIDAK', 'YA', 'SUDAH', 'BELUM',
  'TERIMA', 'KASIH', 'SAMA-SAMA', 'MOHON', 'MAAF', 'PERMISI', 'SEBENTAR', 'NANTI',
  'SEKARANG', 'HARI', 'INI', 'BESOK', 'KEMARIN', 'PAGI', 'SIANG', 'SORE', 'MALAM',

  // Kebutuhan fisik & makan/minum
  'HAUS', 'MINUM', 'AIR', 'HANGAT', 'DINGIN', 'MANIS', 'TEH', 'SUSU', 'JUS',
  'LAPAR', 'MAKAN', 'NASI', 'BUBUR', 'ROTI', 'SUP', 'BUAH', 'KENYANG', 'HABIS',
  'SENDOK', 'SEDOTAN', 'SUAP', 'TISU', 'LAP',

  // Kesehatan & rasa sakit
  'SAKIT', 'NYERI', 'PUSING', 'SESAK', 'GATAL', 'PEGAL', 'KRAM', 'MUAL',
  'MUNTAH', 'LEMAS', 'LELAH', 'CAPEK', 'BATUK', 'DAHAK', 'PANAS', 'DEMAM',
  'MENGGIGIL', 'SESAK NAFAS', 'LUKA', 'KEMBUNG', 'PERIH', 'BERAT',

  // Bagian tubuh
  'KEPALA', 'LEHER', 'DADA', 'PUNGGUNG', 'PERUT', 'PINGGANG', 'TANGAN', 'KAKI',
  'MATA', 'TELINGA', 'HIDUNG', 'MULUT', 'GIGI', 'TENGGOROKAN', 'BAHU', 'JARI',

  // Posisi & kenyamanan
  'DUDUK', 'BARING', 'TIDUR', 'BANGUN', 'MIRING', 'KIRI', 'KANAN', 'GESER',
  'NAIKKAN', 'TURUNKAN', 'TEGAK', 'BANTAL', 'SELIMUT', 'KASUR', 'POSISI',
  'GERAH', 'PENGAP', 'SEJUK', 'NYAMAN', 'TENANG', 'SAKIT SEKALI',

  // Kebersihan & toilet
  'TOILET', 'KAMAR MANDI', 'BUANG AIR', 'KENCING', 'PISPOT', 'POPOK', 'GANTI',
  'BERSIHKAN', 'WUDHU', 'CUCI', 'SIKAT GIGI', 'MANDI', 'KERAMAS', 'BASAH', 'KERING',

  // Tenaga medis & bantuan
  'DOKTER', 'SUSTER', 'PERAWAT', 'OBAT', 'SUNTIK', 'INFUS', 'OKSIGEN', 'NEBULIZER',
  'SUCTION', 'SEDOT DAHAK', 'TENSI', 'SUHU', 'DARURAT', 'BANTUAN', 'PANGGIL',

  // Lingkungan & benda
  'LAMPU', 'MATIKAN', 'NYALAKAN', 'KIPAS', 'AC', 'PINTU', 'JENDELA', 'BUKA',
  'TUTUP', 'TV', 'HP', 'TELEPON', 'KACAMATA', 'BEL', 'ALARM', 'JAM',

  // Keluarga & orang
  'KELUARGA', 'IBU', 'AYAH', 'ANAK', 'ISTRI', 'SUAMI', 'KAKAK', 'ADIK',
  'TEMAN', 'ORANG', 'SIAPA', 'DIMANA', 'KAPAN',

  // Perasaan & evaluasi
  'TAKUT', 'CEMAS', 'BINGUNG', 'SENANG', 'SEDIH', 'BOSAN', 'ENAK', 'TIDAK ENAK',
  'BAGUS', 'KURANG', 'CUKUP', 'LEBIH', 'LAGI', 'SELESAI', 'AMAN', 'BERSIH'
];

/**
 * Mencari saran kata (maksimal 3) berdasarkan kata yang sedang diketik
 */
export function getWordSuggestions(currentPrefix: string): string[] {
  const cleanPrefix = currentPrefix.trim().toUpperCase();

  if (!cleanPrefix) {
    // Jika belum ada kata yang diketik, tampilkan kata awal yang paling sering dipakai
    return ['SAYA', 'TOLONG', 'MAU'];
  }

  const matches = INDONESIAN_DICTIONARY.filter(word => 
    word.startsWith(cleanPrefix) && word !== cleanPrefix
  );

  // Jika cocok kurang dari 3, tambahkan kata yang mengandung prefix
  if (matches.length < 3) {
    const containsMatches = INDONESIAN_DICTIONARY.filter(
      word => word.includes(cleanPrefix) && !matches.includes(word) && word !== cleanPrefix
    );
    matches.push(...containsMatches);
  }

  // Ambil 3 pertama yang unik
  const result = Array.from(new Set(matches)).slice(0, 3);

  // Jika tetap kosong (misal kata tidak ada di kamus), berikan opsi fallback bantuan
  if (result.length === 0) {
    return ['TOLONG', 'SAYA', 'TERIMA KASIH'].filter(w => w !== cleanPrefix).slice(0, 3);
  }

  return result;
}
