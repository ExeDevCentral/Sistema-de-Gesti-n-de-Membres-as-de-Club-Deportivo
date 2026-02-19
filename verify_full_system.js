/**
 * verify_full_system.js
 * Master test suite for API Rosario Central
 * Verifies Auth, Socios, Access, and Partidos.
 */

const BASE_URL = 'http://localhost:3000/api';

async function runFullVerification() {
    console.log('🚀 --- STARTING FULL SYSTEM VERIFICATION --- 🚀');

    let token;
    let headers;
    let testSocio;
    let testPartido;

    try {
        // 1. AUTHENTICATION
        console.log('\n🔐 1. Testing Authentication...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        if (!loginRes.ok) throw new Error('Auth Failed');
        const loginData = await loginRes.json();
        token = loginData.token;
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('✅ Auth successful.');

        // 2. SOCIO CRUD
        console.log('\n👤 2. Testing Socio CRUD...');
        const randomDni = Math.floor(10000000 + Math.random() * 90000000).toString();
        const socioData = {
            nombre: 'Test',
            apellido: 'Verification',
            dni: randomDni,
            email: `test.${randomDni}@example.com`,
            categoria: 'Activo'
        };

        const createSocioRes = await fetch(`${BASE_URL}/socios`, {
            method: 'POST',
            headers,
            body: JSON.stringify(socioData)
        });
        testSocio = await createSocioRes.json();
        if (!testSocio.id) throw new Error('Socio Creation Failed');
        console.log(`✅ Socio created: ${testSocio.id}`);

        // 3. ACCESS CONTROL (Initial - Activo)
        console.log('\n🏟️ 3. Testing Access Control (Expected: Granted)...');
        const accessRes1 = await fetch(`${BASE_URL}/access/${testSocio.id}`, { headers });
        const accessData1 = await accessRes1.json();
        console.log(`Result: ${accessData1.message} - isApto: ${accessData1.isApto}`);
        if (!accessData1.isApto) console.warn('⚠️ Access denied? Check fechaVencimiento.');

        // 4. SUSPENSION & ACCESS
        console.log('\n🚫 4. Testing Suspension & Access Denial...');
        await fetch(`${BASE_URL}/socios/${testSocio.id}/suspender`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ motivo: 'Testing system' })
        });
        const accessRes2 = await fetch(`${BASE_URL}/access/${testSocio.id}`, { headers });
        const accessData2 = await accessRes2.json();
        console.log(`Result: ${accessData2.message} - isApto: ${accessData2.isApto}`);
        if (accessData2.isApto) throw new Error('Suspended socio should NOT have access!');

        // 5. PARTIDOS CRUD (Linked to testSocio)
        console.log('\n⚽ 5. Testing Partidos CRUD...');
        const partidoData = {
            socioId: testSocio.id,
            date: new Date(Date.now() + 86400000).toISOString(),
            rival: 'Club Atlético Independiente'
        };
        const createPartidoRes = await fetch(`${BASE_URL}/partidos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(partidoData)
        });
        testPartido = await createPartidoRes.json();
        if (!testPartido._id) throw new Error('Partido Creation Failed');
        console.log(`✅ Partido created: ${testPartido._id}`);

        // Verify fetching with population
        const getPartidosRes = await fetch(`${BASE_URL}/partidos?socioId=${testSocio.id}`, { headers });
        const partidos = await getPartidosRes.json();
        if (partidos.length === 0) throw new Error('Could not find created partido');
        console.log(`✅ Partido fetch successful. Rival: ${partidos[0].rival}`);

        // 6. STATISTICS
        console.log('\n📊 6. Testing Statistics...');
        const statsRes = await fetch(`${BASE_URL}/socios/estadisticas`, { headers });
        const stats = await statsRes.json();
        console.log('Current Stats:', stats);

        // 7. PREMIUM FEATURES: QR & PAYMENTS
        console.log('\n💎 7. Testing Premium Features...');

        // Reactivate first (to remove suspension from step 4)
        await fetch(`${BASE_URL}/socios/${testSocio.id}/reactivar`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ motivo: 'Prepare for payment test' })
        });

        // Make Moroso manually for testing
        // (We could do this via a service helper, but here we just pay a very old date or similar)
        // Actually, let's just use the payment to verify it advances the date correctly.

        // QR Code
        const qrRes = await fetch(`${BASE_URL}/socios/${testSocio.id}/qr`, { headers });
        const qrData = await qrRes.json();
        if (!qrData.qr || !qrData.qr.startsWith('data:image/png')) throw new Error('QR Generation Failed');
        console.log('✅ QR Code generated successfully (Base64 PNG).');

        // Payment Simulation
        console.log('💰 Testing Payment Simulation...');
        const payRes = await fetch(`${BASE_URL}/socios/${testSocio.id}/pagar`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ meses: 2 })
        });
        const paidSocio = await payRes.json();
        console.log(`✅ Payment successful. New expiration: ${paidSocio.fechaVencimientoCuota}`);

        // Re-check Access (should be granted now)
        const accessRes3 = await fetch(`${BASE_URL}/access/${testSocio.id}`, { headers });
        const accessData3 = await accessRes3.json();
        console.log(`Final Access Check: ${accessData3.message} - isApto: ${accessData3.isApto}`);
        if (!accessData3.isApto) throw new Error('Socio should have access after payment and reactivation!');

        // 8. CLEANUP (SOFT DELETE)
        console.log('\n🧹 8. Cleaning up (Soft Delete Socio)...');
        const delRes = await fetch(`${BASE_URL}/socios/${testSocio.id}`, { method: 'DELETE', headers });
        if (delRes.status !== 204) throw new Error('Cleanup failed');

        console.log('\n✨✨ SYSTEM VERIFICATION COMPLETED SUCCESSFULLY ✨✨');

    } catch (error) {
        console.error('\n❌ FAILED:', error.message);
        process.exit(1);
    }
}

runFullVerification();
