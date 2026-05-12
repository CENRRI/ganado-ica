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
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/contents/${CONFIG.path}`, {
            headers: { 'Authorization': `token ${CONFIG.token}`, 'Cache-Control': 'no-cache' }
        });
        const json = await res.json();
        const content = atob(json.content);
        DATA = JSON.parse(content);
        DATA.sha = json.sha; // Guardamos el SHA para poder actualizar después
        renderAll();
    } catch (e) {
        console.error("Error cargando datos:", e);
        // Fallback a datos locales si falla la API
        DATA = { gastos: [], aportes: [] };
    }
}

async function saveData() {
    try {
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(DATA, null, 4))));
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/contents/${CONFIG.path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Update data from dashboard",
                content: content,
                sha: DATA.sha
            })
        });
        const json = await res.json();
        DATA.sha = json.content.sha; // Actualizamos el SHA para el siguiente guardado
        console.log("Datos guardados en GitHub");
    } catch (e) {
        console.error("Error guardando datos:", e);
        alert("Error al guardar en la nube. Intenta de nuevo.");
    }
}

// ============================================================
// CORE LOGIC
// ============================================================
const COSTO_DIARIO = 17.50;
const FECHA_INICIO = new Date('2026-05-06');

function totalInvertido() {
    return DATA.gastos.reduce((sum, g) => sum + g.monto, 0);
}

function diasEnCorral() {
    return Math.max(1, Math.ceil((new Date() - FECHA_INICIO) / (1000*60*60*24)));
}

// ============================================================
// NAVIGATION
// ============================================================
function toggleMenu() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('open');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    
    if (window.innerWidth <= 900) {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('open');
    }
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
    const porSocioIdeal = (inv + 1050) / 2;

    document.getElementById('socioInversion').textContent = `S/ ${inv.toFixed(2)}`;
    document.getElementById('socioUtilidad').textContent = `S/ ${utilidadNeta.toFixed(2)}`;
    document.getElementById('socioPagoCadaUno').textContent = `S/ ${(utilidadNeta / 2).toFixed(2)}`;
    
    document.getElementById('socioInvEjecutada').textContent = `S/ ${inv.toFixed(2)}`;
    document.getElementById('socioFondoReserva').textContent = `S/ 1,050.00`;
    document.getElementById('socioTotalFondear').textContent = `S/ ${(inv + 1050).toFixed(2)}`;
    document.getElementById('socioAporteCadaUno').textContent = `S/ ${porSocioIdeal.toFixed(2)}`;

    const listaG = document.getElementById('socioListaGastos');
    if(listaG) {
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
    }

    const listaA = document.getElementById('socioListaAportes');
    if(listaA) {
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
}

function updateStatusSocio(socioId, actual, ideal) {
    const statusEl = document.getElementById(`statusSocio${socioId}`);
    const cardEl = document.getElementById(`cardSocio${socioId}`);
    if(!statusEl || !cardEl) return;
    const diff = actual - ideal;
    if (diff >= -0.01) {
        statusEl.innerHTML = `<span style="color:var(--green)">✓ OK (S/ +${Math.max(0, diff).toFixed(2)})</span>`;
        cardEl.style.borderColor = 'var(--green)';
    } else {
        statusEl.innerHTML = `<span style="color:var(--red)">⚠ DEBE (S/ ${Math.abs(diff).toFixed(2)})</span>`;
        cardEl.style.borderColor = 'var(--red)';
    }
}

function formatFecha(txt) {
    const parts = txt.split('/');
    if (parts.length === 3) {
        const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let d = parts[0].padStart(2, '0');
        let m = meses[parseInt(parts[1]) - 1];
        let y = parts[2].length === 2 ? "20" + parts[2] : parts[2];
        return `${d}-${m} ${y}`;
    }
    return txt;
}

function agregarGasto() {
    const rawFecha = document.getElementById('addFecha').value;
    const fecha = rawFecha ? formatFecha(rawFecha) : new Date().toLocaleDateString('es-PE');
    const tipo = document.getElementById('addTipo').value;
    const concepto = document.getElementById('addConcepto').value;
    const detalle = document.getElementById('addDetalle').value;
    const monto = parseFloat(document.getElementById('addMonto').value);
    
    if (!concepto || isNaN(monto)) { alert('Completa concepto y monto correctamente'); return; }
    
    DATA.gastos.push({ fecha, tipo, concepto, detalle, monto });
    renderAll();
    saveData(); // GUARDAR EN GITHUB
    
    document.getElementById('addConcepto').value = '';
    document.getElementById('addDetalle').value = '';
    document.getElementById('addMonto').value = '';
    document.getElementById('addFecha').value = '';
}

function registrarAporte() {
    const socio = document.getElementById('aporteSocio').value;
    const monto = parseFloat(document.getElementById('aporteMonto').value);
    const fecha = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
    if (!monto) { alert('Ingresa un monto válido'); return; }
    DATA.aportes.push({ socio, monto, fecha });
    renderSocioData();
    saveData(); // GUARDAR EN GITHUB
    document.getElementById('aporteMonto').value = '';
}

function eliminarGasto(idx) { 
    if(confirm('¿Eliminar este gasto?')) { 
        DATA.gastos.splice(idx, 1); 
        renderAll(); 
        saveData(); 
    } 
}
function eliminarAporte(idx) { 
    if(confirm('¿Eliminar este aporte?')) { 
        DATA.aportes.splice(idx, 1); 
        renderSocioData(); 
        saveData(); 
    } 
}

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
    const costoAlim = dias * COSTO_DIARIO;
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

document.addEventListener('DOMContentLoaded', () => {
    loadData(); // CARGAR DESDE GITHUB AL INICIAR
});
