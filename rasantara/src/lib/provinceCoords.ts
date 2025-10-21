// Representative coordinates (lng, lat) for provinces used in the dataset.
// Coordinates based on provincial capital cities for accurate marker placement.
// Total: 38 provinces of Indonesia

export interface ProvinceCoordinate {
  [key: string]: [number, number]; // [longitude, latitude]
}

const provinceCoords: ProvinceCoordinate = {
  // Sumatra (10 provinces)
  "Aceh": [95.3238, 5.5483],                           // Banda Aceh
  "Sumatra Utara": [98.6722, 3.5952],                  // Medan
  "Sumatra Barat": [100.3543, -0.9471],                // Padang
  "Riau": [101.4478, 0.5071],                          // Pekanbaru
  "Kepulauan Riau": [104.4589, 0.9167],                // Tanjung Pinang
  "Jambi": [103.6078, -1.6101],                        // Jambi
  "Sumatra Selatan": [104.7458, -2.9761],              // Palembang
  "Bangka Belitung": [106.1139, -2.1316],              // Pangkal Pinang
  "Bengkulu": [102.2656, -3.7956],                     // Bengkulu
  "Lampung": [105.2611, -5.4290],                      // Bandar Lampung

  // Jawa (6 provinces)
  "Banten": [106.1640, -6.1175],                       // Serang
  "DKI Jakarta": [106.8456, -6.2088],                  // Jakarta
  "Jawa Barat": [107.6191, -6.9175],                   // Bandung
  "Jawa Tengah": [110.4203, -6.9932],                  // Semarang
  "DI Yogyakarta": [110.3695, -7.7956],                // Yogyakarta
  "Jawa Timur": [112.7388, -7.2575],                   // Surabaya

  // Bali & Nusa Tenggara (3 provinces)
  "Bali": [115.2126, -8.6705],                         // Denpasar
  "Nusa Tenggara Barat": [116.1168, -8.5833],          // Mataram
  "Nusa Tenggara Timur": [123.6076, -10.1772],         // Kupang

  // Kalimantan (5 provinces)
  "Kalimantan Barat": [109.3425, -0.0263],             // Pontianak
  "Kalimantan Tengah": [113.9213, -2.2116],            // Palangka Raya
  "Kalimantan Selatan": [114.5916, -3.3194],           // Banjarmasin
  "Kalimantan Timur": [117.1436, -0.5022],             // Samarinda
  "Kalimantan Utara": [117.3625, 2.8333],              // Tanjung Selor

  // Sulawesi (6 provinces)
  "Sulawesi Utara": [124.8413, 1.4748],                // Manado
  "Sulawesi Tengah": [119.8707, -0.8999],              // Palu
  "Sulawesi Selatan": [119.4327, -5.1477],             // Makassar
  "Sulawesi Tenggara": [122.5159, -3.9689],            // Kendari
  "Gorontalo": [123.0644, 0.5436],                     // Gorontalo
  "Sulawesi Barat": [118.8889, -2.6667],               // Mamuju

  // Maluku (2 provinces)
  "Maluku": [128.1695, -3.6954],                       // Ambon
  "Maluku Utara": [127.5667, 0.7392],                  // Sofifi

  // Papua (6 provinces)
  "Papua": [140.7182, -2.5920],                        // Jayapura
  "Papua Barat": [134.0838, -0.8614],                  // Manokwari
  "Papua Tengah": [135.4960, -3.3569],                 // Nabire
  "Papua Pegunungan": [138.9387, -4.0955],             // Wamena
  "Papua Selatan": [140.4046, -8.4862],                // Merauke
  "Papua Barat Daya": [131.2547, -0.8650]              // Sorong
};

export default provinceCoords;
