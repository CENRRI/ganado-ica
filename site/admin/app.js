// ============================================================
// AUTH
// ============================================================
const ADMIN_USER = 'fredy';
const ADMIN_PASS = 'torito2026';

function checkAuth() {
    if (sessionStorage.getItem('auth') === 'ok') return true;
    const u = prompt('Usuario:');
    const p = prompt('Contraseña:');
    if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('auth', 'ok');
        return true;
    }
    document.body.innerHTML = '<div style="text-align:center;padding:100px;color:#ef4444;font-family:Inter,sans-serif"><h1>Acceso Denegado</h1><p>Usuario o contraseña incorrectos</p></div>';
    return false;
}

// ============================================================
// DATA STORE with localStorage
// ============================================================
const DEFAULT_DATA = {
    compra: 4500,
    gastos: [
        { fecha:'06-May 2026', tipo:'compra', concepto:'Compra del Torito', detalle:'Adquisición', monto:4500 },
        { fecha:'06-May 2026', tipo:'transporte', concepto:'Flete', detalle:'Transporte al corral', monto:90 },
        { fecha:'06-May 18:16', tipo:'alimentacion', concepto:'Alimento Urgencia', detalle:'Acemita 4kg + Afrecho 1kg + Polvillo 1kg', monto:10.80 },
    ],
    costoDiario: 17.50,
    fechaInicio: '2026-05-06',
    vendido: false,
    precioVenta: 0
};

function loadData() {
    const saved = localStorage.getItem('torito01_data');
    if (saved) return JSON.parse(saved);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData() {
    localStorage.setItem('torito01_data', JSON.stringify(DATA));
}

let DATA = loadData();

function totalInvertido() {
    return DATA.gastos.reduce((s, g) => s + g.monto, 0);
}

function diasEnCorral() {
    return Math.max(1, Math.ceil((new Date() - new Date(DATA.fechaInicio)) / (1000*60*60*24)));
}

// ============================================================
// NAVIGATION
// ============================================================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

// ============================================================
// RENDER
// ============================================================
function renderKPIs() {
    const inv = totalInvertido();
    const ganancia = 6300 - inv;
    const roi = (ganancia / inv * 100);
    document.getElementById('kpiGanancia').textContent = `S/ ${ganancia.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
    document.getElementById('kpiRoi').textContent = `${roi.toFixed(1)}%`;
    document.getElementById('kpiDias').textContent = diasEnCorral();
    document.getElementById('kpiInversion').textContent = `S/ ${inv.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
}

function renderExpenses() {
    const tbody = document.getElementById('expensesBody');
    tbody.innerHTML = '';
    DATA.gastos.forEach((g, i) => {
        const icon = g.tipo==='compra'?'🐂':g.tipo==='transporte'?'🚚':g.tipo==='alimentacion'?'🌾':g.tipo==='medicina'?'💊':'📦';
        tbody.innerHTML += `<tr>
            <td>${g.fecha}</td>
            <td>${icon} ${g.concepto}</td>
            <td>${g.detalle}</td>
            <td class="amt">S/ ${g.monto.toFixed(2)}</td>
            <td><button class="btn-del" onclick="deleteGasto(${i})">×</button></td>
        </tr>`;
    });
    document.getElementById('totalInvertido').textContent = `S/ ${totalInvertido().toFixed(2)}`;
    const cats = {compra:0,transporte:0,alimentacion:0,medicina:0,otro:0};
    DATA.gastos.forEach(g => { cats[g.tipo] = (cats[g.tipo]||0) + g.monto; });
    document.getElementById('catCompra').textContent = `S/ ${cats.compra.toFixed(2)}`;
    document.getElementById('catTransporte').textContent = `S/ ${cats.transporte.toFixed(2)}`;
    document.getElementById('catAlimentacion').textContent = `S/ ${cats.alimentacion.toFixed(2)}`;
    document.getElementById('catMedicina').textContent = `S/ ${(cats.medicina||0).toFixed(2)}`;
    document.getElementById('catOtro').textContent = `S/ ${(cats.otro||0).toFixed(2)}`;
}

function calcularVenta() {
    const pv = parseFloat(document.getElementById('precioVenta').value) || 0;
    const dias = parseInt(document.getElementById('diasExtra').value) || 0;
    const extras = parseFloat(document.getElementById('gastosExtra').value) || 0;
    const invTotal = totalInvertido() + (dias * DATA.costoDiario) + extras;
    const ganancia = pv - invTotal;
    const roi = (ganancia / invTotal * 100);
    const box = document.getElementById('resultBox');
    const val = document.getElementById('resultGanancia');
    const roiEl = document.getElementById('resultRoi');
    if (ganancia >= 0) {
        box.classList.remove('loss');
        val.textContent = `S/ ${ganancia.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
        roiEl.textContent = `ROI: ${roi.toFixed(1)}%`;
    } else {
        box.classList.add('loss');
        val.textContent = `-S/ ${Math.abs(ganancia).toFixed(2)}`;
        roiEl.textContent = `PÉRDIDA: ${roi.toFixed(1)}%`;
    }
}

function agregarGasto() {
    const fecha = document.getElementById('addFecha').value || new Date().toLocaleDateString('es-PE');
    const tipo = document.getElementById('addTipo').value;
    const concepto = document.getElementById('addConcepto').value;
    const detalle = document.getElementById('addDetalle').value;
    const monto = parseFloat(document.getElementById('addMonto').value);
    if (!concepto || !monto) { alert('Completa concepto y monto'); return; }
    DATA.gastos.push({ fecha, tipo, concepto, detalle, monto });
    saveData();
    renderExpenses(); renderKPIs(); calcularVenta();
    document.getElementById('addConcepto').value = '';
    document.getElementById('addDetalle').value = '';
    document.getElementById('addMonto').value = '';
}

function deleteGasto(index) {
    if (confirm('¿Eliminar este gasto?')) {
        DATA.gastos.splice(index, 1);
        saveData();
        renderExpenses(); renderKPIs(); calcularVenta();
    }
}

function marcarVendido() {
    const precio = prompt('¿A cuánto se vendió? (S/)');
    if (precio && !isNaN(precio)) {
        DATA.vendido = true;
        DATA.precioVenta = parseFloat(precio);
        saveData();
        alert(`Operación cerrada: Venta a S/ ${DATA.precioVenta}\nGanancia: S/ ${(DATA.precioVenta - totalInvertido()).toFixed(2)}`);
        renderKPIs();
    }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    renderKPIs(); renderExpenses(); calcularVenta();
    showPage('resumen');
});
