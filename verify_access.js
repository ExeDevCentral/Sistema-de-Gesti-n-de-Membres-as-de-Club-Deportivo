const BASE_URL = 'http://localhost:3000/api';

async function testAccessControl() {
    console.log('--- 🏟️ Verifying Access Control System ---');

    try {
        // 1. Login
        console.log('\n🔑 1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        if (!loginRes.ok) throw new Error('Login failed');
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Successful.');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Get a Socio
        console.log('\n👤 2. Fetching Socios...');
        const sociosRes = await fetch(`${BASE_URL}/socios`, { headers });
        const sociosData = await sociosRes.json();
        const socios = sociosData.data || [];
        console.log(`Found ${socios.length} socios.`);

        const activoSocio = socios.find(s => s.estado === 'Activo');
        if (!activoSocio) throw new Error('No Activo socio found');

        console.log(`Testing with: ${activoSocio.nombre} ${activoSocio.apellido} (${activoSocio.id})`);

        // 3. Test Access - Activo
        console.log('\n✅ 3. Testing Access for Activo Socio...');
        const accessRes1 = await fetch(`${BASE_URL}/access/${activoSocio.id}`, { headers });
        const accessData1 = await accessRes1.json();
        console.log('Result:', accessData1);
        console.log(`  - isApto: ${accessData1.isApto}`);
        console.log(`  - Carnet: ${accessData1.carnetStatus}`);
        console.log(`  - Cuotas: ${accessData1.cuotasStatus}`);

        if (accessData1.isApto === true) {
            console.log('SUCCESS: Access Granted for Activo socio');
        } else {
            console.warn('WARNING: Access Denied for Activo socio (might be expired quota)');
        }

        // 4. Suspend Socio
        console.log('\n🚫 4. Suspending Socio...');
        await fetch(`${BASE_URL}/socios/${activoSocio.id}/suspender`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ motivo: 'Test' })
        });

        // 5. Test Access - Suspended
        console.log('\n⛔ 5. Testing Access for Suspended Socio...');
        const accessRes2 = await fetch(`${BASE_URL}/access/${activoSocio.id}`, { headers });
        const accessData2 = await accessRes2.json();
        console.log('Result:', accessData2);
        console.log(`  - isApto: ${accessData2.isApto}`);
        console.log(`  - Carnet: ${accessData2.carnetStatus}`);
        console.log(`  - Cuotas: ${accessData2.cuotasStatus}`);

        if (accessData2.isApto === false) {
            console.log('SUCCESS: Access Denied for Suspended socio');
        } else {
            console.error('FAILED: Access Granted for Suspended socio');
        }

        // Cleanup - Reactivate
        await fetch(`${BASE_URL}/socios/${activoSocio.id}/reactivar`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ motivo: 'Test cleanup' })
        });

        console.log('\n✨ ACCESS CONTROL VERIFICATION COMPLETE ✨');

    } catch (error) {
        console.error('❌ TEST FAILED:', error);
    }
}

testAccessControl();
