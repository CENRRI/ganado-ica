// ============================================================
// CONFIGURACIÓN DE PERSISTENCIA (GITHUB API)
// ============================================================
const CONFIG = {
    repo: 'CENRRI/ganado-ica',
    path: 'dashboard/data.json',
    token: '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' 
};

let DATA = {
    gastos: [
        { fecha:'06-May 2026', tipo:'compra', concepto:'Compra del Torito', detalle:'Adquisición', monto:4500 },
        { fecha:'06-May 2026', tipo:'transporte', concepto:'Flete', detalle:'Transporte al corral', monto:90 },
        { fecha:'06-May 18:16', tipo:'alimentacion', concepto:'Alimento Urgencia', detalle:'Acemita 4kg (S/7.20) + Afrecho 1kg (S/1.70) + Polvillo 1kg (S/1.90)', monto:10.80 },
        { fecha:'sem 6 - 10/May', tipo:'transporte', concepto:'Transporte', detalle:'Transporte compras, corral, etc', monto:60.00 },
        { fecha:'07-May 2026', tipo:'compra', concepto:'Compra toritos', detalle:'Compra toritos x 3', monto:3000.00 },
        { fecha:'07-May 2026', tipo:'alimentacion', concepto:'Concentrado', detalle:'Concentrado - AGROMARCO 60kg', monto:54.00 },
        { fecha:'08-May 2026', tipo:'otro', concepto:'Agua', detalle:'Agua bebederos - Asociación', monto:7.50 },
        { fecha:'09-May 2026', tipo:'alimentacion', concepto:'Concentrado', detalle:'Concentrado - AGROMARCO 60kg', monto:54.00 },
        { fecha:'11-May 2026', tipo:'alimentacion', concepto:'Proyección Alimento', detalle:'Ración diaria (S/35) x 25 días', monto:875.00 },
        { fecha:'11-May 2026', tipo:'otro', concepto:'Limpieza', detalle:'Limpieza de pozo y corral', monto:30.00 }
    ],
    aportes: [
        { socio:'Socio A', monto:1500, fecha:'12-may' },
        { socio:'Socio A', monto:3000, fecha:'12-may' },
        { socio:'Socio A', monto:365.65, fecha:'12-may' },
        { socio:'Socio B', monto:3000, fecha:'12-may' }
    ]
};

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
    } catch (e) { alert("Error al guardar"); }
}

const COSTO_DIARIO = 17.50;
const FECHA_INICIO = new Date('2026-05-06');
function totalInvertido() { return DATA.gastos.reduce((sum, g) => sum + g.monto, 0); }
function diasEnCorral() { return Math.max(1, Math.ceil((new Date() - FECHA_INICIO) / (1000*60*60*24))); }

function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); }
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
}

function renderKPIs() {
    const inv = totalInvertido();
    const ganancia = 11000 - inv;
    document.getElementById('kpiGanancia').textContent = `S/ ${ganancia.toFixed(0)}`;
    document.getElementById('kpiRoi').textContent = `${(ganancia/inv*100).toFixed(1)}%`;
    document.getElementById('kpiDias').textContent = diasEnCorral();
    document.getElementById('kpiInversion').textContent = `S/ ${inv.toFixed(2)}`;
}

function renderExpenses() {
    const tbody = document.getElementById('expensesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    DATA.gastos.forEach((g, index) => {
        const icon = g.tipo === 'compra' ? '🐂' : g.tipo === 'transporte' ? '🚚' : g.tipo === 'alimentacion' ? '🌾' : '📦';
        tbody.innerHTML += `<tr><td>${g.fecha}</td><td>${icon} ${g.concepto}</td><td>${g.detalle}</td><td class="amt">S/ ${g.monto.toFixed(2)} <button onclick="eliminarGasto(${index})" style="opacity:0.3;border:none;background:none;cursor:pointer">🗑️</button></td></tr>`;
    });
    document.getElementById('totalInvertido').textContent = `S/ ${totalInvertido().toFixed(2)}`;
}

function renderSocioData() {
    const inv = totalInvertido();
    const porSocio = (inv + 1050) / 2;
    document.getElementById('socioInversion').textContent = `S/ ${inv.toFixed(2)}`;
    document.getElementById('socioUtilidad').textContent = `S/ ${(11000-inv).toFixed(2)}`;
    document.getElementById('socioPagoCadaUno').textContent = `S/ ${((11000-inv)/2).toFixed(2)}`;
    document.getElementById('socioTotalFondear').textContent = `S/ ${(inv + 1050).toFixed(2)}`;
    document.getElementById('socioAporteCadaUno').textContent = `S/ ${porSocio.toFixed(2)}`;
    
    // Lista aportes
    const listaA = document.getElementById('socioListaAportes');
    if(listaA) {
        listaA.innerHTML = '';
        let tA=0, tB=0;
        DATA.aportes.slice().reverse().forEach((a, idx) => {
            if(a.socio === 'Socio A') tA += a.monto; else tB += a.monto;
            listaA.innerHTML += `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #222"><span>${a.socio} - ${a.fecha}</span><span>S/ ${a.monto.toFixed(2)}</span></div>`;
        });
        document.getElementById('totalAporteA').textContent = `S/ ${tA.toFixed(2)}`;
        document.getElementById('totalAporteB').textContent = `S/ ${tB.toFixed(2)}`;
        updateStatusSocio('A', tA, porSocio);
        updateStatusSocio('B', tB, porSocio);
    }
}

function updateStatusSocio(id, actual, ideal) {
    const el = document.getElementById(`statusSocio${id}`);
    const card = document.getElementById(`cardSocio${id}`);
    const diff = actual - ideal;
    if(diff >= -0.01) {
        el.innerHTML = `<span style="color:var(--green)">✓ OK</span>`;
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
    if(isNaN(monto)) return;
    DATA.gastos.push({ fecha, tipo:'otro', concepto: document.getElementById('addConcepto').value, detalle: document.getElementById('addDetalle').value, monto });
    saveData(); renderAll();
}

function registrarAporte() {
    const monto = parseFloat(document.getElementById('aporteMonto').value);
    if(isNaN(monto)) return;
    DATA.aportes.push({ socio: document.getElementById('aporteSocio').value, monto, fecha: '12-May' });
    saveData(); renderSocioData();
}

function eliminarGasto(i) { DATA.gastos.splice(i,1); saveData(); renderAll(); }

function renderAll() {
    renderKPIs(); renderExpenses(); renderSocioData(); renderTimeline();
}

document.addEventListener('DOMContentLoaded', loadData);
