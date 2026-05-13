// ============================================================
// CONFIGURACIÓN DE PERSISTENCIA (GITHUB API)
// ============================================================
const CONFIG = {
    repo: 'CENRRI/ganado-ica',
    path: 'dashboard/data.json',
    token: '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' 
};

let DATA = { gastos: [], aportes: [] };

async function loadData() {
    try {
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/contents/${CONFIG.path}?t=${Date.now()}`, {
            headers: { 'Authorization': `token ${CONFIG.token}` }
        });
        const json = await res.json();
        if (json.content) {
            const decodedContent = decodeURIComponent(escape(atob(json.content)));
            DATA = JSON.parse(decodedContent);
            DATA.sha = json.sha; 
        }
    } catch (e) { console.warn("Error carga nube:", e); }
    renderAll();
}

async function saveData() {
    try {
        const jsonString = JSON.stringify(DATA, null, 4);
        const content = btoa(unescape(encodeURIComponent(jsonString)));
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/contents/${CONFIG.path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Update via Dashboard", content, sha: DATA.sha })
        });
        const json = await res.json();
        if (json.content) DATA.sha = json.content.sha;
    } catch (e) { console.error(e); }
}

// ============================================================
// CORE LOGIC
// ============================================================
const COSTO_DIARIO = 17.50;
const FECHA_INICIO = new Date('2026-05-06');
function totalInvertido() { return DATA.gastos.reduce((sum, g) => sum + g.monto, 0); }
function diasEnCorral() { return Math.max(1, Math.ceil((new Date() - FECHA_INICIO) / (1000*60*60*24))); }

// ============================================================
// NAVIGATION
// ============================================================
function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); }
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderKPIs() {
    const inv = totalInvertido();
    const ganancia = 11000 - inv;
    const elGan = document.getElementById('kpiGanancia');
    const elRoi = document.getElementById('kpiRoi');
    const elDia = document.getElementById('kpiDias');
    const elInv = document.getElementById('kpiInversion');
    
    if(elGan) elGan.textContent = `S/ ${ganancia.toFixed(0)}`;
    if(elRoi) elRoi.textContent = `${(ganancia/inv*100).toFixed(1)}%`;
    if(elDia) elDia.textContent = diasEnCorral();
    if(elInv) elInv.textContent = `S/ ${inv.toFixed(2)}`;
}

function renderExpenses() {
    const tbody = document.getElementById('expensesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    DATA.gastos.forEach((g, index) => {
        const icon = g.tipo === 'compra' ? '🐂' : g.tipo === 'transporte' ? '🚚' : g.tipo === 'alimentacion' ? '🌾' : '📦';
        tbody.innerHTML += `<tr><td>${g.fecha}</td><td>${icon} ${g.concepto}</td><td>${g.detalle}</td><td class="amt">S/ ${g.monto.toFixed(2)} <button onclick="eliminarGasto(${index})" style="opacity:0.3;border:none;background:none;cursor:pointer">🗑️</button></td></tr>`;
    });
    const elTotal = document.getElementById('totalInvertido');
    if(elTotal) elTotal.textContent = `S/ ${totalInvertido().toFixed(2)}`;
}

function renderSocioData() {
    const inv = totalInvertido();
    const fondoReserva = 1050;
    const totalAFondear = inv + fondoReserva;
    const porSocioIdeal = totalAFondear / 2;

    // Actualizar Resumen Liquidación
    const elSI = document.getElementById('socioInversion');
    const elSU = document.getElementById('socioUtilidad');
    const elSP = document.getElementById('socioPagoCadaUno');
    if(elSI) elSI.textContent = `S/ ${inv.toFixed(2)}`;
    if(elSU) elSU.textContent = `S/ ${(11000-inv).toFixed(2)}`;
    if(elSP) elSP.textContent = `S/ ${((11000-inv)/2).toFixed(2)}`;

    // Actualizar Aportes y Fondo
    const elIE = document.getElementById('socioInvEjecutada');
    const elFR = document.getElementById('socioFondoReserva');
    const elTF = document.getElementById('socioTotalFondear');
    const elAC = document.getElementById('socioAporteCadaUno');
    if(elIE) elIE.textContent = `S/ ${inv.toFixed(2)}`;
    if(elFR) { elFR.textContent = `S/ ${fondoReserva.toFixed(2)}`; elFR.style.color = 'var(--amber)'; }
    if(elTF) elTF.textContent = `S/ ${totalAFondear.toFixed(2)}`;
    if(elAC) elAC.textContent = `S/ ${porSocioIdeal.toFixed(2)}`;

    // Historial Gastos Compartidos
    const listaG = document.getElementById('socioListaGastos');
    if(listaG) {
        listaG.innerHTML = '';
        DATA.gastos.slice().reverse().forEach(g => {
            listaG.innerHTML += `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span>${g.fecha} - ${g.concepto}</span><span class="amt">S/ ${g.monto.toFixed(2)}</span></div>`;
        });
    }
    
    // Historial Aportes Reales
    const listaA = document.getElementById('socioListaAportes');
    if(listaA) {
        listaA.innerHTML = '';
        let tA=0, tB=0;
        const aportesConIndex = DATA.aportes.map((a, i) => ({...a, index: i}));
        aportesConIndex.reverse().forEach((a) => {
            if(a.socio === 'Socio A') tA += a.monto; else tB += a.monto;
            listaA.innerHTML += `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <span><strong style="color:${a.socio==='Socio A'?'#3b82f6':'#8b5cf6'}">${a.socio}</strong> - ${a.fecha}</span>
                <span>S/ ${a.monto.toFixed(2)} <button onclick="eliminarAporte(${a.index})" style="background:none;border:none;cursor:pointer;margin-left:8px;opacity:0.5">❌</button></span>
            </div>`;
        });
        const elTA = document.getElementById('totalAporteA');
        const elTB = document.getElementById('totalAporteB');
        if(elTA) elTA.textContent = `S/ ${tA.toFixed(2)}`;
        if(elTB) elTB.textContent = `S/ ${tB.toFixed(2)}`;
        updateStatusSocio('A', tA, porSocioIdeal);
        updateStatusSocio('B', tB, porSocioIdeal);
    }
}

function updateStatusSocio(id, actual, ideal) {
    const el = document.getElementById(`statusSocio${id}`);
    const card = document.getElementById(`cardSocio${id}`);
    if(!el || !card) return;
    const diff = actual - ideal;
    if(diff >= -0.01) {
        el.innerHTML = `<span style="color:var(--green)">✓ OK (S/ +${diff.toFixed(2)})</span>`;
        card.style.borderColor = 'var(--green)';
    } else {
        el.innerHTML = `<span style="color:var(--red)">⚠ DEBE S/ ${Math.abs(diff).toFixed(2)}</span>`;
        card.style.borderColor = 'var(--red)';
    }
}

function renderTimeline() {
    const list = document.getElementById('timelineList');
    if (!list) return;
    list.innerHTML = '';
    DATA.gastos.forEach(g => {
        list.innerHTML += `<div class="tl-item"><div class="tl-date">${g.fecha}</div><div class="tl-text">${g.concepto} — <span class="tl-amt">S/ ${g.monto.toFixed(2)}</span></div></div>`;
    });
}

function agregarGasto() {
    const fecha = document.getElementById('addFecha').value || new Date().toLocaleDateString();
    const monto = parseFloat(document.getElementById('addMonto').value);
    if(isNaN(monto)) { alert('Ingresa un monto válido'); return; }
    const concepto = document.getElementById('addConcepto').value;
    const detalle = document.getElementById('addDetalle').value;
    const tipo = document.getElementById('addTipo').value;
    DATA.gastos.push({ fecha, tipo, concepto, detalle, monto });
    saveData(); renderAll();
    document.getElementById('addMonto').value = '';
    document.getElementById('addConcepto').value = '';
}

function registrarAporte() {
    const monto = parseFloat(document.getElementById('aporteMonto').value);
    if(isNaN(monto)) { alert('Ingresa un monto válido'); return; }
    const socio = document.getElementById('aporteSocio').value;
    const fecha = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
    DATA.aportes.push({ socio, monto, fecha });
    saveData(); renderSocioData();
    document.getElementById('aporteMonto').value = '';
}

function eliminarGasto(i) { if(confirm('¿Eliminar este gasto?')) { DATA.gastos.splice(i,1); saveData(); renderAll(); } }
function eliminarAporte(i) { if(confirm('¿Eliminar este aporte?')) { DATA.aportes.splice(i,1); saveData(); renderSocioData(); } }

function renderAll() {
    renderKPIs(); renderExpenses(); renderSocioData(); renderTimeline();
    calcularVenta();
}

function calcularVenta() {
    const pv = parseFloat(document.getElementById('precioVenta').value) || 0;
    const dias = parseInt(document.getElementById('diasExtra').value) || 0;
    const extras = parseFloat(document.getElementById('gastosExtra').value) || 0;
    const costoAlim = dias * COSTO_DIARIO;
    const invTotal = totalInvertido() + costoAlim + extras;
    const ganancia = pv - invTotal;
    const box = document.getElementById('resultBox');
    const val = document.getElementById('resultGanancia');
    const roiEl = document.getElementById('resultRoi');
    if (!box) return;
    val.textContent = `S/ ${ganancia.toFixed(2)}`;
    roiEl.textContent = `ROI: ${(ganancia/invTotal*100).toFixed(1)}%`;
    if (ganancia >= 0) box.classList.remove('loss'); else box.classList.add('loss');
}

document.addEventListener('DOMContentLoaded', loadData);
