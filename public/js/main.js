const API_URL = '/api';
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let debounceTimer;

// --- Auth Logic ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Wrapper for authenticated fetch
async function authFetch(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        logout();
        return;
    }

    return response;
}

// --- Access Control Logic (NEW) ---
async function checkAccessDetailed() {
    const socioId = document.getElementById('access-socio-id').value.trim();
    const resultCard = document.getElementById('access-result-card');

    if (!socioId) {
        alert('Por favor ingrese un ID de socio');
        return;
    }

    resultCard.style.display = 'block';
    const banner = document.getElementById('status-banner');
    if (banner) {
        banner.style.background = '#f0f0f0';
        banner.style.color = '#333';
        banner.innerHTML = '⏳ Verificando acceso...';
    }
    const checkCarnetEl = document.getElementById('check-carnet');
    const checkCuotasEl = document.getElementById('check-cuotas');
    if (checkCarnetEl) checkCarnetEl.querySelector('.check-status').textContent = '';
    if (checkCuotasEl) checkCuotasEl.querySelector('.check-status').textContent = '';

    try {
        const response = await authFetch(`${API_URL}/access/${socioId}`);
        if (!response) return;
        const data = await response.json();

        // Socio Info
        const socio = data.socio;
        const photoUrl = socio?.photoUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Escudo_de_Rosario_Central.svg/1200px-Escudo_de_Rosario_Central.svg.png';
        const photoEl = document.getElementById('socio-photo');
        if (photoEl) photoEl.src = photoUrl;

        if (socio) {
            document.getElementById('socio-name').textContent = `${socio.nombre} ${socio.apellido}`;
            document.getElementById('socio-details').textContent = `#${socio.numeroSocio || 'N/A'} | ${socio.categoria || 'N/A'} | Venc: ${socio.fechaVencimientoCuota || 'N/A'}`;
        } else {
            document.getElementById('socio-name').textContent = 'ID NO ENCONTRADO';
            document.getElementById('socio-details').textContent = 'Verifique el ID ingresado';
        }

        // Status Banner
        const banner = document.getElementById('status-banner');
        if (data.isApto) {
            banner.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            banner.style.color = 'white';
            banner.innerHTML = '✅ APTO PARA INGRESAR';
        } else {
            banner.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            banner.style.color = 'white';
            banner.innerHTML = '⛔ NO PUEDE INGRESAR';
        }

        // Checklist - Carnet
        const checkCarnet = document.getElementById('check-carnet');
        const carnetIcon = checkCarnet.querySelector('.check-icon');
        const carnetStatus = checkCarnet.querySelector('.check-status');

        if (data.carnetStatus === 'Activo') {
            carnetIcon.textContent = '✅';
            carnetStatus.textContent = 'Activo';
            carnetStatus.style.color = '#28a745';
        } else {
            carnetIcon.textContent = '❌';
            carnetStatus.textContent = data.carnetStatus;
            carnetStatus.style.color = '#dc3545';
        }

        // Checklist - Cuotas
        const checkCuotas = document.getElementById('check-cuotas');
        const cuotasIcon = checkCuotas.querySelector('.check-icon');
        const cuotasStatus = checkCuotas.querySelector('.check-status');

        if (data.cuotasStatus === 'Al día') {
            cuotasIcon.textContent = '✅';
            cuotasStatus.textContent = 'Al día';
            cuotasStatus.style.color = '#28a745';
        } else {
            cuotasIcon.textContent = '❌';
            cuotasStatus.textContent = data.cuotasStatus;
            cuotasStatus.style.color = '#dc3545';

            // Add a quick pay button if they owe
            const payBtnHtml = `<button onclick="paySocio('${socioId}')" style="margin-left: 10px; padding: 2px 8px; font-size: 0.8em; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">PAGAR AHORA</button>`;
            cuotasStatus.innerHTML += payBtnHtml;
        }

    } catch (error) {
        console.error('Error checking access:', error);
        alert('Error verificando acceso');
    }
}

// --- Socio Logic ---
const socioForm = document.getElementById('socio-form');
const sociosList = document.getElementById('socios-list');

async function fetchSocios() {
    if (sociosList) sociosList.innerHTML = '<li class="loading-message">⏳ Cargando socios...</li>';
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            q: searchQuery,
            limit: 10
        });

        const response = await authFetch(`${API_URL}/socios?${queryParams}`);
        if (!response) return;
        const result = await response.json();

        renderSocios(result.data);
        updatePaginationInfo(result.page, result.pages);
    } catch (error) {
        console.error('Error fetching socios:', error);
        if (sociosList) sociosList.innerHTML = '<li class="loading-message" style="color:#dc3545;">Error al cargar. Reintente.</li>';
    }
}

function updatePaginationInfo(page, pages) {
    currentPage = page;
    totalPages = pages;

    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (pageInfo) pageInfo.textContent = `Página ${page} de ${pages || 1}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= pages;

    // Fade out buttons if disabled
    if (prevBtn) prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    if (nextBtn) nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        fetchSocios();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchSocios();
    }
}

function renderSocios(socios) {
    if (!sociosList) return;
    sociosList.innerHTML = '';
    socios.forEach(socio => {
        const li = document.createElement('li');
        const photoUrl = socio.photoUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Escudo_de_Rosario_Central.svg/1200px-Escudo_de_Rosario_Central.svg.png';
        const badgeColor = socio.estado === 'Activo' ? 'green' : 'red';

        li.innerHTML = `
            <div class="socio-info">
                <img src="${photoUrl}" alt="${socio.nombre}">
                <div>
                    <strong>${socio.nombre} ${socio.apellido || ''}</strong> 
                    <span style="color: ${badgeColor}; font-weight: bold; font-size: 0.8em;">[${socio.estado}]</span><br>
                    <small>ID: ${socio.id} | #${socio.numeroSocio || 'N/A'}</small>
                </div>
            </div>
            <div style="display: flex; gap: 5px; flex-direction: column;">
                <button onclick="showQR('${socio.id}', '${socio.nombre} ${socio.apellido}')" style="font-size: 0.7em; background: #fabd00; color: #003399; font-weight: bold; border: none; border-radius: 4px; padding: 5px; cursor: pointer;">QR</button>
                <button onclick="paySocio('${socio.id}')" style="font-size: 0.7em; background: #28a745; color: white; border: none; border-radius: 4px; padding: 5px; cursor: pointer;">Pagar</button>
                <button class="delete-btn" onclick="deleteSocio('${socio.id}')" style="font-size: 0.7em;">Baja</button>
            </div>
        `;
        // Double click to copy ID for easier testing
        li.ondblclick = () => {
            document.getElementById('access-socio-id').value = socio.id;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        sociosList.appendChild(li);
    });
}

async function createSocio(e) {
    e.preventDefault();
    const name = document.getElementById('socio-name').value;
    const email = document.getElementById('socio-email').value;
    const dni = document.getElementById('socio-dni').value;
    const phone = document.getElementById('socio-phone').value;
    const role = document.getElementById('socio-role').value || 'Hincha';
    const photoUrl = document.getElementById('socio-photo').value;

    const [nombre, ...apellidoParts] = name.split(' ');
    const apellido = apellidoParts.join(' ') || '';

    try {
        const response = await authFetch(`${API_URL}/socios`, {
            method: 'POST',
            body: JSON.stringify({
                nombre,
                apellido,
                email,
                dni,
                telefono: phone,
                categoria: role,
                rol: role,
                photoUrl
            })
        });

        if (response && response.ok) {
            fetchSocios();
            socioForm.reset();
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Error creando socio');
        }
    } catch (error) {
        console.error('Error creating socio:', error);
    }
}

async function deleteSocio(id) {
    if (!confirm('¿Estás seguro de dar de baja a este socio?')) return;
    try {
        const response = await authFetch(`${API_URL}/socios/${id}`, { method: 'DELETE' });
        if (response && (response.ok || response.status === 204)) {
            fetchSocios();
        } else {
            alert('Error deleting socio');
        }
    } catch (error) {
        console.error('Error deleting socio:', error);
    }
}

// --- Premium Features Logic ---
async function showQR(id, name) {
    const modal = document.getElementById('qr-modal');
    const qrImg = document.getElementById('qr-image');
    const nameTxt = document.getElementById('qr-socio-name');

    try {
        const response = await authFetch(`${API_URL}/socios/${id}/qr`);
        if (!response) return;
        const data = await response.json();

        qrImg.src = data.qr;
        nameTxt.textContent = name;
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error showing QR:', error);
        alert('Error cargando QR');
    }
}

function closeQR() {
    document.getElementById('qr-modal').style.display = 'none';
}

async function paySocio(id) {
    if (!confirm('¿Desea registrar el pago de la cuota actual?')) return;
    try {
        const response = await authFetch(`${API_URL}/socios/${id}/pagar`, {
            method: 'POST',
            body: JSON.stringify({ meses: 1 })
        });

        if (response && response.ok) {
            alert('¡Pago registrado con éxito!');
            fetchSocios();
            // If the access card is open, re-check to update status
            const currentAccessId = document.getElementById('access-socio-id').value;
            if (currentAccessId === id) {
                checkAccessDetailed();
            }
        } else {
            alert('Error al registrar el pago');
        }
    } catch (error) {
        console.error('Error paying cuota:', error);
    }
}

// --- Phase 4: Export Logic ---
async function exportSocios() {
    try {
        const response = await authFetch(`${API_URL}/socios/export`);
        if (!response) return;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `socios-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting socios:', error);
        alert('Error exportando socios');
    }
}

// --- Phase 5: Access Logs Logic ---
let logsCurrentPage = 1;
let logsTotalPages = 1;

async function fetchLogs(page = 1) {
    const tableBody = document.getElementById('logs-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">⏳ Cargando auditoría...</td></tr>';
    try {
        const params = new URLSearchParams({ page, limit: 20 });
        const response = await authFetch(`${API_URL}/access/logs?${params}`);
        if (!response) return;
        const result = await response.json();
        const logs = result.data || result;
        logsTotalPages = result.pages ?? 1;
        logsCurrentPage = result.page ?? 1;

        tableBody.innerHTML = '';
        (Array.isArray(logs) ? logs : []).forEach(log => {
            const tr = document.createElement('tr');
            const date = new Date(log.timestamp).toLocaleString();
            const socioName = log.socio ? `${log.socio.nombre} ${log.socio.apellido} (#${log.socio.numeroSocio})` : 'Desconocido';
            const logStatus = log.granted ? '✅ PERMITIDO' : '❌ DENEGADO';
            const statusColor = log.granted ? '#28a745' : '#dc3545';

            tr.innerHTML = `
                <td style="padding: 10px; border: 1px solid #eee;">${date}</td>
                <td style="padding: 10px; border: 1px solid #eee;">${socioName}</td>
                <td style="padding: 10px; border: 1px solid #eee;">${log.carnetStatus} / ${log.cuotasStatus}</td>
                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: ${statusColor};">${logStatus}</td>
                <td style="padding: 10px; border: 1px solid #eee;">${log.checkedBy?.username || 'Sistema'}</td>
            `;
            tableBody.appendChild(tr);
        });
        if (logs.length === 0) tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No hay registros.</td></tr>';
        updateLogsPagination();
    } catch (error) {
        console.error('Error fetching logs:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#dc3545;">Error al cargar logs.</td></tr>';
    }
}

function updateLogsPagination() {
    const info = document.getElementById('logs-page-info');
    const prev = document.getElementById('logs-prev');
    const next = document.getElementById('logs-next');
    if (info) info.textContent = `Página ${logsCurrentPage} de ${logsTotalPages}`;
    if (prev) { prev.disabled = logsCurrentPage <= 1; prev.style.opacity = prev.disabled ? '0.5' : '1'; }
    if (next) { next.disabled = logsCurrentPage >= logsTotalPages; next.style.opacity = next.disabled ? '0.5' : '1'; }
}

function nextLogsPage() {
    if (logsCurrentPage < logsTotalPages) fetchLogs(logsCurrentPage + 1);
}

function prevLogsPage() {
    if (logsCurrentPage > 1) fetchLogs(logsCurrentPage - 1);
}

if (socioForm) socioForm.addEventListener('submit', createSocio);

// Search Event Listener
const searchInput = document.getElementById('socio-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        searchQuery = e.target.value;
        currentPage = 1; // Reset to first page on search
        debounceTimer = setTimeout(() => {
            fetchSocios();
        }, 500); // 500ms debounce
    });
}

// --- Initial Load ---
if (document.getElementById('socios-section')) {
    fetchSocios();
    fetchLogs(1);
}
