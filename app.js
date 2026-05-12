// ============================================================
// DATA STORE
// ============================================================
const DATA = {
    compra: 4500,
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
        { fecha:'11-May 2026', tipo:'otro', concepto:'Limpieza', detalle:'Limpieza de pozo y corral', monto:30.00 },
    ],
    costoDiario: 17.50,
    fechaInicio: new Date('2026-05-06')
};

function totalInvertido() {
    return DATA.gastos.reduce((sum, g) => sum + g.monto, 0);
}

function diasEnCorral() {
    return Math.max(1, Math.ceil((new Date() - DATA.fechaInicio) / (1000*60*60*24)));
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
// RENDER FUNCTIONS
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
    DATA.gastos.forEach(g => {
        const icon = g.tipo === 'compra' ? '🐂' : g.tipo === 'transporte' ? '🚚' : g.tipo === 'alimentacion' ? '🌾' : g.tipo === 'medicina' ? '💊' : '📦';
        tbody.innerHTML += `<tr>
            <td>${g.fecha}</td>
            <td>${icon} ${g.concepto}</td>
            <td>${g.detalle}</td>
            <td class="amt">S/ ${g.monto.toFixed(2)}</td>
        </tr>`;
    });
    document.getElementById('totalInvertido').textContent = `S/ ${totalInvertido().toFixed(2)}`;
    
    // Category totals
    const cats = {compra:0, transporte:0, alimentacion:0, medicina:0, otro:0};
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
    const costoAlim = dias * DATA.costoDiario;
    const invTotal = totalInvertido() + costoAlim + extras;
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
    renderExpenses();
    renderKPIs();
    calcularVenta();
    // Clear form
    document.getElementById('addConcepto').value = '';
    document.getElementById('addDetalle').value = '';
    document.getElementById('addMonto').value = '';
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    renderKPIs();
    renderExpenses();
    calcularVenta();
    showPage('resumen');
});
