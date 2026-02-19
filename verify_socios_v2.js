// verify_socios_v2.js
const BASE_URL = 'http://localhost:3000/api';

async function testSociosUpgrade() {
    console.log('--- 🛡️ Verifying Socio Upgrade (Rosario Central) 🛡️ ---');

    try {
        // 0. Login to get token
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

        const SOCIOS_URL = `${BASE_URL}/socios`;

        // 1. Get Statistics
        console.log('\n📊 1. Testing Statistics (Should show seeded data)...');
        const statsRes = await fetch(`${SOCIOS_URL}/estadisticas`, { headers });
        const stats = await statsRes.json();
        console.log('Stats:', stats);
        if (stats.total < 100) throw new Error('Seeding failed: Expected at least 100 socios');

        // 2. Create Socio
        console.log('\n🆕 2. Testing Create Socio...');
        const randomSuffix = Math.floor(Math.random() * 1000000);
        const newSocioData = {
            nombre: 'Nuevo',
            apellido: 'Socio',
            dni: `9${String(randomSuffix).padStart(7, '0')}`,
            email: `nuevo.${randomSuffix}@socio.com`
        };
        const createRes = await fetch(SOCIOS_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(newSocioData)
        });

        if (!createRes.ok) {
            console.error(await createRes.text());
            throw new Error('Failed to create socio');
        }

        const createdSocio = await createRes.json();
        console.log('Created Socio:', createdSocio.nombre, createdSocio.apellido, `(ID: ${createdSocio.id})`);

        if (createdSocio.estado !== 'Activo') throw new Error('Default state should be Activo');

        // 3. Suspend Socio
        console.log('\n🚫 3. Testing Suspension...');
        const suspendRes = await fetch(`${SOCIOS_URL}/${createdSocio.id}/suspender`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ motivo: 'Comportamiento indebido' })
        });
        const suspendedSocio = await suspendRes.json();
        console.log('Suspended Socio Response:', suspendedSocio);
        if (suspendedSocio.estado !== 'Suspendido') throw new Error('Failed to suspend');

        // 4. Reactivate Socio
        console.log('\n✅ 4. Testing Reactivation...');
        const reactivateRes = await fetch(`${SOCIOS_URL}/${createdSocio.id}/reactivar`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ motivo: 'Cumplió sanción' })
        });
        const reactivatedSocio = await reactivateRes.json();
        console.log('Reactivated Socio State:', reactivatedSocio.estado);
        if (reactivatedSocio.estado !== 'Activo') throw new Error('Failed to reactivate');

        // 5. Change Category
        console.log('\n🏅 5. Testing Category Change (to Vitalicio)...');
        const catRes = await fetch(`${SOCIOS_URL}/${createdSocio.id}/categoria`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ categoria: 'Vitalicio' })
        });
        const catSocio = await catRes.json();
        console.log('New Category:', catSocio.categoria);
        if (catSocio.categoria !== 'Vitalicio') throw new Error('Failed to change category');

        // 6. Morosos Filter
        console.log('\n💸 6. Testing Morosos Filter...');
        const morososRes = await fetch(`${SOCIOS_URL}/morosos`, { headers });
        const morosos = await morososRes.json();
        console.log(`Found ${morosos.length} morosos.`);

        // 7. Pay Quota
        console.log('\n💳 7. Testing Pay Quota...');
        const payRes = await fetch(`${SOCIOS_URL}/${createdSocio.id}/pagar`, {
            method: 'POST',
            headers
        });
        const payResult = await payRes.json();
        console.log('Payment Result:', payResult);

        // 8. Ranking Antigüedad
        console.log('\n🏆 8. Testing Ranking Antigüedad...');
        const rankingRes = await fetch(`${SOCIOS_URL}/ranking/antiguedad`, { headers });
        const ranking = await rankingRes.json();
        console.log('Top 3 oldest:', ranking.slice(0, 3).map(s => `${s.nombre} ${s.apellido} (${s.fechaAlta})`));

        // 9. Soft Delete
        console.log('\n🗑️ 9. Testing Soft Delete...');
        const deleteRes = await fetch(`${SOCIOS_URL}/${createdSocio.id}`, { method: 'DELETE', headers });
        if (deleteRes.status !== 204) throw new Error('Failed to delete');

        // Verify it's gone from main list
        const checkRes = await fetch(`${SOCIOS_URL}/${createdSocio.id}`, { headers });
        const deletedCheck = await checkRes.json();
        console.log('Deleted Socio State:', deletedCheck.estado);
        if (deletedCheck.estado !== 'Baja') throw new Error('Soft delete failed (state not Baja)');

        console.log('\n✨ ALL TESTS PASSED! ✨');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    }
}

testSociosUpgrade();
