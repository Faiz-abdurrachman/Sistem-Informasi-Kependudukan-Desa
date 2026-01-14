/**
 * Script Testing Validasi Administratif
 * 
 * Script ini untuk test validasi administratif secara manual
 * 
 * Usage:
 * 1. Pastikan backend server sudah running
 * 2. Update TOKEN di bawah dengan token yang valid
 * 3. Run: node test-admin-validation.js
 */

const BASE_URL = 'http://localhost:5000/api';

// UPDATE TOKEN INI DENGAN TOKEN YANG VALID (dapatkan dari POST /api/auth/login)
let TOKEN = 'YOUR_TOKEN_HERE';

// Helper function untuk HTTP request
async function request(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test scenarios
async function testCreatePendudukAktifShouldReject() {
  log('\n=== TEST 1: Create Penduduk dengan Status AKTIF (HARUS DITOLAK) ===', 'blue');
  
  const pendudukData = {
    nik: '3201010101010001',
    nama: 'Test User Aktif',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1990-01-01',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'PNS',
    statusPerkawinan: 'Belum Kawin',
    alamat: 'Jl. Test',
    rt: '001',
    rw: '001',
    desa: 'Test Desa',
    kecamatan: 'Test Kecamatan',
    kabupaten: 'Test Kabupaten',
    provinsi: 'Test Provinsi',
    statusKependudukan: 'Aktif' // ⚠️ STATUS AKTIF TANPA KK
  };
  
  const result = await request('POST', '/penduduk', pendudukData, TOKEN);
  
  if (result.status === 400 && result.data && result.data.success === false) {
    log('✅ PASSED: Request ditolak dengan status 400', 'green');
    log(`Message: ${result.data.message}`, 'yellow');
    if (result.data.details) {
      log(`Details: ${result.data.details}`, 'yellow');
    }
    return true;
  } else {
    log('❌ FAILED: Seharusnya ditolak dengan status 400', 'red');
    log(`Actual status: ${result.status}`, 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'red');
    return false;
  }
}

async function testCreatePendudukNonAktifShouldAllow() {
  log('\n=== TEST 2: Create Penduduk dengan Status BUKAN AKTIF (DIIZINKAN) ===', 'blue');
  
  const pendudukData = {
    nik: `320101010101${Date.now().toString().slice(-4)}`, // Unique NIK
    nama: 'Test User Pindah',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1990-01-01',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'PNS',
    statusPerkawinan: 'Belum Kawin',
    alamat: 'Jl. Test',
    rt: '001',
    rw: '001',
    desa: 'Test Desa',
    kecamatan: 'Test Kecamatan',
    kabupaten: 'Test Kabupaten',
    provinsi: 'Test Provinsi',
    statusKependudukan: 'Pindah' // ✅ BUKAN AKTIF = DIIZINKAN
  };
  
  const result = await request('POST', '/penduduk', pendudukData, TOKEN);
  
  if (result.status === 201 && result.data && result.data.success === true) {
    log('✅ PASSED: Request diterima dengan status 201', 'green');
    return result.data.data.penduduk.id; // Return ID untuk test selanjutnya
  } else {
    log('❌ FAILED: Seharusnya diterima dengan status 201', 'red');
    log(`Actual status: ${result.status}`, 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'red');
    return null;
  }
}

async function testUpdateStatusToAktifWithoutKKShouldReject(pendudukId) {
  if (!pendudukId) {
    log('\n⚠️ SKIP: Test 3 (pendudukId tidak tersedia)', 'yellow');
    return false;
  }
  
  log('\n=== TEST 3: Update Status menjadi AKTIF tanpa KK (HARUS DITOLAK) ===', 'blue');
  
  const result = await request('PUT', `/penduduk/${pendudukId}`, { statusKependudukan: 'Aktif' }, TOKEN);
  
  if (result.status === 400 && result.data && result.data.success === false) {
    log('✅ PASSED: Request ditolak dengan status 400', 'green');
    log(`Message: ${result.data.message}`, 'yellow');
    return true;
  } else {
    log('❌ FAILED: Seharusnya ditolak dengan status 400', 'red');
    log(`Actual status: ${result.status}`, 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'red');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n🧪 TESTING VALIDASI ADMINISTRATIF', 'blue');
  log('='.repeat(50), 'blue');
  
  if (TOKEN === 'YOUR_TOKEN_HERE') {
    log('\n❌ ERROR: Token belum diupdate!', 'red');
    log('Silakan update TOKEN di file ini dengan token yang valid.', 'yellow');
    log('Dapatkan token dari: POST /api/auth/login', 'yellow');
    return;
  }
  
  const results = [];
  
  // Test 1: Create Penduduk Aktif (should reject)
  results.push(await testCreatePendudukAktifShouldReject());
  
  // Test 2: Create Penduduk Non-Aktif (should allow)
  const pendudukId = await testCreatePendudukNonAktifShouldAllow();
  results.push(pendudukId !== null);
  
  // Test 3: Update Status to Aktif without KK (should reject)
  results.push(await testUpdateStatusToAktifWithoutKKShouldReject(pendudukId));
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(50), 'blue');
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  log(`Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✅ SEMUA TEST PASSED!', 'green');
  } else {
    log('\n⚠️ Beberapa test gagal. Periksa implementasi.', 'yellow');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Error: fetch tidak tersedia. Gunakan Node.js 18+ atau install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

