// ============================================================
// DATA STORE
// ============================================================
const CONFIG = {
    repo: 'CENRRI/ganado-ica',
    path: 'data.json',
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
        { fecha:'11-May 2026', tipo:'otro', concepto:'Limpieza', detalle:'Limpieza de pozo y corral', monto:30.00 },
        { fecha:'15-May 2026', tipo:'alimentacion', concepto:'Concentrado', detalle:'24 sacos de Forraje Seco (AGROMARCO)', monto:792.00 },
        { fecha:'15-May 2026', tipo:'alimentacion', concepto:'Soya', detalle:'2 sacos de Torta de Soya (MESAJU)', monto:192.00 },
        { fecha:'15-May 2026', tipo:'alimentacion', concepto:'Maíz Amarillo', detalle:'2 sacos de Maíz Polvillo Nacional 50kg (N&C SAC)', monto:146.00 },
        { fecha:'15-May 2026', tipo:'transporte', concepto:'Flete', detalle:'Traslado La Tinguiña - San Joaquin (24 conc + 2 soya + 2 maiz)', monto:164.00 }
    ],
    aportes: [
        { socio:'Socio A', monto:1500, fecha:'12-may' },
        { socio:'Socio A', monto:3000, fecha:'12-may' },
        { socio:'Socio A', monto:365.65, fecha:'12-may' },
        { socio:'Socio B', monto:3000, fecha:'12-may' }
    ]
};

// ============================================================
// PERSISTENCE ENGINE
// ============================================================
async function loadData() {
    renderAll(); 
    try {
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/contents/${CONFIG.path}?t=${Date.now()}`, {
            headers: { 'Authorization': `token ${CONFIG.token}` }
        });
        if (res.ok) {
            const json = await res.json();
            const content = decodeURIComponent(escape(atob(json.content)));
            const cloudData = JSON.parse(content);
            if (cloudData.gastos && cloudData.gastos.length > 0) {
                DATA = cloudData;
                DATA.sha = json.sha;
                renderAll();
            }
        }
    } catch (e) { console.warn("Usando datos locales."); }
}

async function saveData() {
    try {
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(DATA, null, 4))));
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/contents/${CONFIG.path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Update Data", content, sha: DATA.sha })
        });
        const json = await res.json();
        if (json.content) DATA.sha = json.content.sha;
    } catch (e) { console.error("Save error:", e); }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderAll() {
    const inv = DATA.gastos.reduce((s, g) => s + g.monto, 0);
    const ganancia = 11000 - inv;

    // Resumen KPIs
    const kGan = document.getElementById('kpiGanancia'); if(kGan) kGan.textContent = `S/ ${ganancia.toFixed(0)}`;
    const kRoi = document.getElementById('kpiRoi'); if(kRoi) kRoi.textContent = `${(ganancia/inv*100).toFixed(1)}%`;
    const kInv = document.getElementById('kpiInversion'); if(kInv) kInv.textContent = `S/ ${inv.toFixed(2)}`;
    const kDia = document.getElementById('kpiDias'); if(kDia) kDia.textContent = Math.max(1, Math.ceil((new Date() - new Date('2026-05-06')) / 864e5));

    // Tabla Gastos
    const tbody = document.getElementById('expensesBody');
    if (tbody) {
        tbody.innerHTML = DATA.gastos.map((g, i) => `<tr>
            <td>${g.fecha}</td>
            <td>${g.concepto}</td>
            <td>${g.detalle}</td>
            <td class="amt">S/ ${g.monto.toFixed(2)} <button onclick="eliminarGasto(${i})" style="opacity:0.3;border:none;background:none;cursor:pointer">🗑️</button></td>
        </tr>`).join('');
        const tInv = document.getElementById('totalInvertido'); if(tInv) tInv.textContent = `S/ ${inv.toFixed(2)}`;
    }

    // Socio Data
    const ideal = (inv + 1050) / 2;
    const sInv = document.getElementById('socioInversion'); if(sInv) sInv.textContent = `S/ ${inv.toFixed(2)}`;
    const sUti = document.getElementById('socioUtilidad'); if(sUti) sUti.textContent = `S/ ${ganancia.toFixed(2)}`;
    const sPag = document.getElementById('socioPagoCadaUno'); if(sPag) sPag.textContent = `S/ ${(ganancia/2).toFixed(2)}`;
    const sIEj = document.getElementById('socioInvEjecutada'); if(sIEj) sIEj.textContent = `S/ ${inv.toFixed(2)}`;
    const sTFo = document.getElementById('socioTotalFondear'); if(sTFo) sTFo.textContent = `S/ ${(inv+1050).toFixed(2)}`;
    const sACa = document.getElementById('socioAporteCadaUno'); if(sACa) sACa.textContent = `S/ ${ideal.toFixed(2)}`;

    // Historial Gastos (Socio)
    const hG = document.getElementById('socioListaGastos');
    if (hG) hG.innerHTML = DATA.gastos.slice().reverse().map(g => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #222"><span>${g.fecha} - ${g.concepto}</span><span>S/ ${g.monto.toFixed(2)}</span></div>`).join('');

    // Historial Aportes
    const hA = document.getElementById('socioListaAportes');
    if (hA) {
        let tA=0, tB=0;
        hA.innerHTML = DATA.aportes.slice().reverse().map((a, i) => {
            const rIdx = DATA.aportes.length - 1 - i;
            if (a.socio === 'Socio A') tA += a.monto; else tB += a.monto;
            return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222"><span>${a.socio} - ${a.fecha}</span><span>S/ ${a.monto.toFixed(2)} <button onclick="eliminarAporte(${rIdx})" style="opacity:0.5;border:none;background:none;cursor:pointer">❌</button></span></div>`;
        }).join('');
        const totA = document.getElementById('totalAporteA'); if(totA) totA.textContent = `S/ ${tA.toFixed(2)}`;
        const totB = document.getElementById('totalAporteB'); if(totB) totB.textContent = `S/ ${tB.toFixed(2)}`;
        updateStatusSocio('A', tA, ideal);
        updateStatusSocio('B', tB, ideal);
    }

    // Timeline
    const tl = document.getElementById('timelineList');
    if (tl) tl.innerHTML = DATA.gastos.map(g => `<div class="tl-item"><div class="tl-date">${g.fecha}</div><div class="tl-text">${g.concepto} — S/ ${g.monto.toFixed(2)}</div></div>`).join('');
    
    // Categorias
    const cats = {compra:0, transporte:0, alimentacion:0, medicina:0, otro:0};
    DATA.gastos.forEach(g => { if(cats[g.tipo]!==undefined) cats[g.tipo]+=g.monto; });
    const cComp = document.getElementById('catCompra'); if(cComp) cComp.textContent = `S/ ${cats.compra.toFixed(2)}`;
    const cTran = document.getElementById('catTransporte'); if(cTran) cTran.textContent = `S/ ${cats.transporte.toFixed(2)}`;
    const cAlim = document.getElementById('catAlimentacion'); if(cAlim) cAlim.textContent = `S/ ${cats.alimentacion.toFixed(2)}`;
    const cMedi = document.getElementById('catMedicina'); if(cMedi) cMedi.textContent = `S/ ${cats.medicina.toFixed(2)}`;
    const cOtro = document.getElementById('catOtro'); if(cOtro) cOtro.textContent = `S/ ${cats.otro.toFixed(2)}`;

    calcularVenta();
}

function updateStatusSocio(id, act, idl) {
    const el = document.getElementById(`statusSocio${id}`);
    const card = document.getElementById(`cardSocio${id}`);
    if (!el || !card) return;
    const diff = act - idl;
    if (diff >= -0.01) { el.innerHTML = `<span style="color:#10b981">✓ OK</span>`; card.style.borderColor = '#10b981'; }
    else { el.innerHTML = `<span style="color:#ef4444">⚠ DEBE S/ ${Math.abs(diff).toFixed(2)}</span>`; card.style.borderColor = '#ef4444'; }
}

function calcularVenta() {
    const pv = parseFloat(document.getElementById('precioVenta').value) || 0;
    const dias = parseInt(document.getElementById('diasExtra').value) || 0;
    const extras = parseFloat(document.getElementById('gastosExtra').value) || 0;
    const invTotal = totalInvertido() + (dias * 17.5) + extras;
    const ganancia = pv - invTotal;
    const box = document.getElementById('resultBox');
    const val = document.getElementById('resultGanancia');
    const roiEl = document.getElementById('resultRoi');
    if (!box) return;
    val.textContent = `S/ ${ganancia.toFixed(2)}`;
    roiEl.textContent = `ROI: ${(ganancia/invTotal*100).toFixed(1)}%`;
    if (ganancia >= 0) box.classList.remove('loss'); else box.classList.add('loss');
}

function totalInvertido() { return DATA.gastos.reduce((s, g) => s + g.monto, 0); }

function agregarGasto() {
    const monto = parseFloat(document.getElementById('addMonto').value);
    if (isNaN(monto)) return;
    DATA.gastos.push({
        fecha: document.getElementById('addFecha').value || new Date().toLocaleDateString(),
        tipo: document.getElementById('addTipo').value,
        concepto: document.getElementById('addConcepto').value,
        detalle: document.getElementById('addDetalle').value,
        monto: monto
    });
    renderAll(); saveData();
}

function registrarAporte() {
    const monto = parseFloat(document.getElementById('aporteMonto').value);
    if (isNaN(monto)) return;
    DATA.aportes.push({
        socio: document.getElementById('aporteSocio').value,
        monto: monto,
        fecha: new Date().toLocaleDateString('es-PE', {day:'2-digit', month:'short'})
    });
    renderAll(); saveData();
}

function eliminarGasto(i) { if(confirm('¿Eliminar?')) { DATA.gastos.splice(i,1); renderAll(); saveData(); } }
function eliminarAporte(i) { if(confirm('¿Eliminar?')) { DATA.aportes.splice(i,1); renderAll(); saveData(); } }

function toggleMenu() { document.getElementById('sidebar').classList.toggle('open'); }
function showPage(p) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    const ni = document.querySelector(`[data-page="${p}"]`);
    if (ni) ni.classList.add('active');
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', loadData);
