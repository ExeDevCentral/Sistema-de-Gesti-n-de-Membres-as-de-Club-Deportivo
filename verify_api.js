// using native fetch
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('--- Starting API Verification (Rosario Central) ---');

    // 0. Login
    console.log('\n🔑 0. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('\n--- 1. Get All Socios (Should include seeded data) ---');
    const allSociosRes = await fetch(`${BASE_URL}/socios?limit=100`, { headers });
    const allSociosData = await allSociosRes.json();
    const allSocios = allSociosData.data || [];
    console.log(`Loaded ${allSocios.length} socios.`);
    console.log('Sample Socio:', allSocios[0]);

    if (allSocios.length < 100) {
        console.error('ERROR: Seed data not loaded correctly.');
    }

    console.log('\n--- 2. Create a Socio ---');
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const socioRes = await fetch(`${BASE_URL}/socios`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            nombre: 'Nuevo Canalla',
            apellido: 'Test',
            dni: `8${String(randomSuffix).padStart(7, '0')}`,
            email: `canalla.${randomSuffix}@central.com`,
            telefono: '123456789'
        })
    });
    const socio = await socioRes.json();
    console.log('Created Socio:', socio);

    if (!socio.id) {
        console.error('FAILED: Socio ID missing');
        return;
    }

    console.log('\n--- 3. Create a Partido ---');
    const partidoRes = await fetch(`${BASE_URL}/partidos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            socioId: socio.id,
            date: '2026-03-01',
            rival: 'Newells'
        })
    });
    const partido = await partidoRes.json();
    console.log('Created Partido:', partido);

    console.log('\n--- 4. Fail to Create Partido (Invalid Socio) ---');
    const failRes = await fetch(`${BASE_URL}/partidos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            socioId: '65cb9d8f3a3c2b1a0d9e8f7a', // Valid ObjectId format but likely non-existent
            date: '2026-03-01',
            rival: 'Should fail'
        })
    });
    if (failRes.status === 404) {
        console.log('SUCCESS: Correctly returned 404 for invalid socio');
    } else {
        console.error('FAILED: Expected 404, got', failRes.status);
    }

    console.log('\n--- 5. Get All Partidos ---');
    const allPartidosRes = await fetch(`${BASE_URL}/partidos`, { headers });
    const allPartidos = await allPartidosRes.json();
    console.log('All Partidos:', allPartidos);

    console.log('\n--- 6. Delete Partido ---');
    const deletePartidoRes = await fetch(`${BASE_URL}/partidos/${partido._id || partido.id}`, { method: 'DELETE', headers });
    if (deletePartidoRes.status === 204) {
        console.log('SUCCESS: Partido deleted');
    } else {
        console.error('FAILED: Could not delete partido');
    }

    console.log('\n--- 7. Delete Socio ---');
    const deleteSocioRes = await fetch(`${BASE_URL}/socios/${socio.id}`, { method: 'DELETE', headers });
    if (deleteSocioRes.status === 204) {
        console.log('SUCCESS: Socio deleted');
    } else {
        console.error('FAILED: Could not delete socio');
    }

    console.log('\n--- API Verification Finished ---');
}

testAPI().catch(err => console.error(err));
