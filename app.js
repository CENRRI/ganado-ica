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
    aportes: [
        { socio:'Socio A', monto:1500, fecha:'12-may' },
        { socio:'Socio A', monto:3000, fecha:'12-may' },
        { socio:'Socio A', monto:365.65, fecha:'12-may' },
        { socio:'Socio B', monto:3000, fecha:'12-may' }
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
    // La lógica ahora reside en app.js para evitar duplicidad
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderKPIs() {
    const inv = totalInvertido();
    const ventaBruta = 11000;
    const ganancia = ventaBruta - inv;
    const roi = (ganancia / inv * 100);
    document.getElementById('kpiGanancia').textContent = `S/ ${ganancia.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
    document.getElementById('kpiRoi').textContent = `${roi.toFixed(1)}%`;
    document.getElementById('kpiDias').textContent = diasEnCorral();
    document.getElementById('kpiInversion').textContent = `S/ ${inv.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
}

function renderExpenses() {
    const tbody = document.getElementById('expensesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    DATA.gastos.forEach((g, index) => {
        const icon = g.tipo === 'compra' ? '🐂' : g.tipo === 'transporte' ? '🚚' : g.tipo === 'alimentacion' ? '🌾' : g.tipo === 'medicina' ? '💊' : '📦';
        tbody.innerHTML += `<tr>
            <td>${g.fecha}</td>
            <td>${icon} ${g.concepto}</td>
            <td>${g.detalle}</td>
            <td class="amt">
                S/ ${g.monto.toFixed(2)}
                <button onclick="eliminarGasto(${index})" style="background:none; border:none; cursor:pointer; font-size:10px; margin-left:8px; opacity:0.5">🗑️</button>
            </td>
        </tr>`;
    });
    document.getElementById('totalInvertido').textContent = `S/ ${totalInvertido().toFixed(2)}`;
    
    const cats = {compra:0, transporte:0, alimentacion:0, medicina:0, otro:0};
    DATA.gastos.forEach(g => { cats[g.tipo] = (cats[g.tipo]||0) + g.monto; });
    document.getElementById('catCompra').textContent = `S/ ${cats.compra.toFixed(2)}`;
    document.getElementById('catTransporte').textContent = `S/ ${cats.transporte.toFixed(2)}`;
    document.getElementById('catAlimentacion').textContent = `S/ ${cats.alimentacion.toFixed(2)}`;
    document.getElementById('catMedicina').textContent = `S/ ${(cats.medicina||0).toFixed(2)}`;
    document.getElementById('catOtro').textContent = `S/ ${(cats.otro||0).toFixed(2)}`;
}

function renderSocioData() {
    const inv = totalInvertido();
    const ventaBruta = 11000;
    const utilidadNeta = ventaBruta - inv;
    const porSocioIdeal = (inv + 1050) / 2; // Meta de fondeo (Gastos + 1 mes alimento)

    document.getElementById('socioInversion').textContent = `S/ ${inv.toFixed(2)}`;
    document.getElementById('socioUtilidad').textContent = `S/ ${utilidadNeta.toFixed(2)}`;
    document.getElementById('socioPagoCadaUno').textContent = `S/ ${(utilidadNeta / 2).toFixed(2)}`;
    
    document.getElementById('socioInvEjecutada').textContent = `S/ ${inv.toFixed(2)}`;
    document.getElementById('socioFondoReserva').textContent = `S/ 1,050.00`;
    document.getElementById('socioTotalFondear').textContent = `S/ ${(inv + 1050).toFixed(2)}`;
    document.getElementById('socioAporteCadaUno').textContent = `S/ ${porSocioIdeal.toFixed(2)}`;

    // Gastos compartidos
    const listaG = document.getElementById('socioListaGastos');
    listaG.innerHTML = '';
    DATA.gastos.slice().reverse().forEach((g, idx) => {
        const originalIdx = DATA.gastos.length - 1 - idx;
        listaG.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05)">
                <span>${g.fecha} - ${g.concepto}</span>
                <span>S/ ${g.monto.toFixed(2)} <button onclick="eliminarGasto(${originalIdx})" style="background:none; border:none; cursor:pointer; font-size:10px; margin-left:4px">❌</button></span>
            </div>
        `;
    });

    // Aportes reales y Balance
    const listaA = document.getElementById('socioListaAportes');
    listaA.innerHTML = '';
    let tA = 0, tB = 0;
    DATA.aportes.slice().reverse().forEach((a, idx) => {
        const originalIdx = DATA.aportes.length - 1 - idx;
        if (a.socio === 'Socio A') tA += a.monto; else tB += a.monto;
        listaA.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05)">
                <span><strong style="color:${a.socio === 'Socio A' ? 'var(--blue)' : 'var(--purple)'}">${a.socio}</strong> - ${a.fecha}</span>
                <span>S/ ${a.monto.toFixed(2)} <button onclick="eliminarAporte(${originalIdx})" style="background:none; border:none; cursor:pointer; font-size:10px; margin-left:4px">❌</button></span>
            </div>
        `;
    });

    document.getElementById('totalAporteA').textContent = `S/ ${tA.toFixed(2)}`;
    document.getElementById('totalAporteB').textContent = `S/ ${tB.toFixed(2)}`;

    updateStatusSocio('A', tA, porSocioIdeal);
    updateStatusSocio('B', tB, porSocioIdeal);
}

function updateStatusSocio(socioId, actual, ideal) {
    const diff = actual - ideal;
    const statusEl = document.getElementById(`statusSocio${socioId}`);
    const cardEl = document.getElementById(`cardSocio${socioId}`);
    if (diff >= -0.01) { // Tolerancia por decimales
        statusEl.innerHTML = `<span style="color:var(--green)">✓ OK (S/ +${Math.max(0, diff).toFixed(2)})</span>`;
        cardEl.style.borderColor = 'var(--green)';
    } else {
        statusEl.innerHTML = `<span style="color:var(--red)">⚠ DEBE (S/ ${Math.abs(diff).toFixed(2)})</span>`;
        cardEl.style.borderColor = 'var(--red)';
    }
}

function registrarAporte() {
    const socio = document.getElementById('aporteSocio').value;
    const monto = parseFloat(document.getElementById('aporteMonto').value);
    const fecha = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
    if (!monto) { alert('Ingresa un monto válido'); return; }
    DATA.aportes.push({ socio, monto, fecha });
    renderSocioData();
    document.getElementById('aporteMonto').value = '';
}

function eliminarGasto(idx) { if(confirm('¿Eliminar este gasto?')) { DATA.gastos.splice(idx, 1); renderAll(); } }
function eliminarAporte(idx) { if(confirm('¿Eliminar este aporte?')) { DATA.aportes.splice(idx, 1); renderSocioData(); } }

function renderAll() {
    renderKPIs();
    renderExpenses();
    renderSocioData();
    calcularVenta();
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
    if (!box) return;
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
    renderAll();
    document.getElementById('addConcepto').value = '';
    document.getElementById('addDetalle').value = '';
    document.getElementById('addMonto').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    showPage('resumen');
});

function toggleMenu() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('open');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    
    // Cerrar menú en móvil tras click
    if (window.innerWidth <= 900) {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('open');
    }
}
