/* =========================================================
   CONFIGURACIÓN INICIAL (después se edita desde la plataforma)
   ========================================================= */
const CONFIG = {
  usuario: 'Docente participante',
  curso: { nombre: 'La IA como asistente del docente', codigo: 'IAH-101' },
  bannerUrl: 'img/Baner.png',
  salaUrl: 'https://meet.google.com/',
  apaUrl: 'https://normas-apa.org/',
  botones: {
    resultado: { titulo: 'Resultado de aprendizaje', texto: 'Al finalizar el curso, el docente integra la IA en su planeación, evaluación y retroalimentación conservando su criterio pedagógico.', url: '', archivo: '' },
    plan:      { titulo: 'Plan de asignatura',        texto: '', url: 'Plan_de_asignatura_IAH-101.pdf', archivo: '' },
    proyecto:  { titulo: 'Proyecto docente',          texto: '', url: 'Proyecto_docente_IAH-101.pdf', archivo: '' }
  },
  unidades: [
    { id: 'u1', titulo: 'Unidad 1', desc: 'Fundamentos de la IA en la docencia',
      items: [ { id: 'foro', tipo: 'foro', titulo: 'Foro de presentación' },
               { id: 'repo', tipo: 'repo', titulo: 'Repositorio' } ] },
    { id: 'u2', titulo: 'Unidad 2', desc: 'Planeación didáctica asistida',
      items: [ { id: 'act1', tipo: 'actividad', titulo: 'Actividad 1. Análisis de casos y su adaptación' },
               { id: 'exam', tipo: 'examen', titulo: 'Examen' } ] }
  ],
  repositorio: ['Unidad 1.pdf', 'Unidad 2.pdf'].map(n => ({ nombre: n, url: encodeURI(n) })),
  actividad: {
    apertura: '2026-11-01T00:01', cierre: '2026-12-15T23:59',
    guiaTexto: 'Analiza dos casos de uso de IA en el aula y propón una adaptación para tu grupo. Entrega un informe en PDF.',
    guiaUrl: 'https://www.canva.com/design/DAHae9oi2nY/Y3jxCVS__qkeDQmkJHX9Ng/edit?ui=eyJBIjp7fX0', guiaNombre: '',
    criterios: [
      'Describe el caso y el uso de la IA con claridad.',
      'Explica las adaptaciones según las características de los estudiantes.',
      'Incluye soportes y referencias en APA 7.'
    ]
  },
  examen: {
    apertura: '2026-11-01T00:01', cierre: '2026-12-15T23:59',
    preguntas: [
      { q: '¿Qué puede hacer la IA generativa por el docente?', o: ['Reemplazar su criterio pedagógico', 'Apoyar la planeación y las rúbricas', 'Calificar sin revisión humana'], ok: 1 },
      { q: 'Antes de usar un texto generado por IA, el docente debe…', o: ['Revisarlo y ajustarlo', 'Publicarlo igual', 'Ignorar las fuentes'], ok: 0 },
      { q: 'Una buena retroalimentación asistida por IA…', o: ['Es genérica', 'Se adapta al estudiante y se revisa', 'No necesita evidencias'], ok: 1 },
      { q: 'La decisión pedagógica final es de…', o: ['La IA', 'El docente', 'La plataforma'], ok: 1 },
      { q: 'Para citar fuentes en el curso se usa…', o: ['APA 7', 'Ninguna norma', 'Solo enlaces'], ok: 0 }
    ]
  }
};

/* =========================================================
   ESTADO Y GUARDADO (en el navegador, solo para el prototipo)
   ========================================================= */
const KEY = 'iah-estado-v2', KEYC = 'iah-config-v2';
let S = { foro: [], repoVisto: false, entrega: null, nota: null, examen: null };
try { S = Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
try { Object.assign(CONFIG, JSON.parse(localStorage.getItem(KEYC) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } };
function saveCfg() {
  try { localStorage.setItem(KEYC, JSON.stringify(CONFIG)); return true; }
  catch (e) { abrirModal('No se pudo guardar', '<p>El archivo es muy pesado para el almacenamiento del navegador. Prueba con uno de menos de 1 MB.</p>'); return false; }
}

let view = 'home';
let hiloAbierto = null;
let calM = (() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })();

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const app = $('#app');
const role = () => $('#role').value;
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fecha = d => new Date(d).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' });
const todos = () => CONFIG.unidades.flatMap(u => u.items);
const titulo = id => todos().find(i => i.id === id).titulo;
const quien = () => ({ docente: CONFIG.usuario, evaluador: 'Evaluador del curso', admin: 'Administrador' }[role()]);
const hecho = id => ({ foro: S.foro.some(h => h.autor === CONFIG.usuario), repo: S.repoVisto, act1: !!S.entrega, exam: !!S.examen }[id] || false);
const v = id => $('#' + id).value;

function restante(cierre, ref) {
  const ms = new Date(cierre) - (ref ? new Date(ref) : new Date());
  const d = Math.floor(Math.abs(ms) / 864e5), h = Math.floor(Math.abs(ms) % 864e5 / 36e5);
  return `${d} días ${h} horas`;
}
function leerArchivo(file) {
  return new Promise((ok, mal) => {
    if (file.size > 1.5 * 1024 * 1024) return mal(new Error('grande'));
    const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = mal; r.readAsDataURL(file);
  });
}
function aviso(t) { abrirModal('Listo', `<p>${esc(t)}</p>`); }
function go(x) { view = x; hiloAbierto = null; render(); window.scrollTo(0, 0); }

/* ---------- modal ---------- */
function abrirModal(t, html) { $('#modalTitle').textContent = t; $('#modalBody').innerHTML = html; $('#modal').hidden = false; $('#modalClose').focus(); }
const cerrarModal = () => { $('#modal').hidden = true; };
$('#modalClose').onclick = cerrarModal;
$('#modal').onclick = e => { if (e.target.id === 'modal') cerrarModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

/* ---------- barra superior ---------- */
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
$('#hq').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const q = e.target.value.trim().toLowerCase(); if (!q) return;
  const it = todos().find(i => i.titulo.toLowerCase().includes(q));
  if (it) go(it.id); else if ('calificaciones'.includes(q)) go('notas'); else if ('calendario'.includes(q)) go('cal');
  else abrirModal('Sin resultados', `<p>No encontré «${esc(q)}» en el curso.</p>`);
});
$('#role').onchange = () => { hiloAbierto = null; render(); };

/* =========================================================
   VISTAS COMUNES
   ========================================================= */
function vHome() {
  return `<section class="home"><h1>Mis cursos</h1>
    <button type="button" class="course-card" data-go="curso">
      <img src="${esc(CONFIG.bannerUrl)}" alt="">
      <div><h3>${esc(CONFIG.curso.nombre)}</h3><span>Código: ${esc(CONFIG.curso.codigo)}</span></div>
    </button></section>`;
}

function sidebar() {
  const u = CONFIG.unidades.map(un => `
    <h4><button type="button" data-toggle="${un.id}" aria-expanded="true">▾ ${esc(un.titulo)}</button></h4>
    <ul id="grp-${un.id}">${un.items.map(i => `
      <li><button type="button" data-go="${i.id}" class="${view === i.id ? 'on' : ''}">
        <span class="dot ${hecho(i.id) ? 'done' : ''}"></span>${esc(i.titulo)}</button></li>`).join('')}</ul>`).join('');
  return `<nav class="side" aria-label="Contenido del curso">
    <button type="button" class="top-link ${view === 'curso' ? 'on' : ''}" data-go="curso">Inicio del curso</button>
    <button type="button" class="top-link ${view === 'unidades' ? 'on' : ''}" data-go="unidades">Unidades</button>
    <button type="button" class="top-link ${view === 'cal' ? 'on' : ''}" data-go="cal">Calendario</button>
    ${u}
    <h4><button type="button" data-go="notas" class="${view === 'notas' ? 'on' : ''}">Calificaciones</button></h4>
  </nav>`;
}

function vCursoHome() {
  const b = CONFIG.botones, R = role();
  let extra = '';
  if (R === 'evaluador') extra = `<div class="panel"><h2>Editar contenidos del curso</h2>
    ${Object.keys(b).map(k => `<div class="q-edit"><h3>${esc(b[k].titulo)}</h3>
      <label class="field"><span>Descripción</span><textarea class="input" id="bt_${k}">${esc(b[k].texto)}</textarea></label>
      <label class="field"><span>Documento ${b[k].archivo ? '(actual: ' + esc(b[k].archivo) + ')' : ''} — máx. 1,5 MB</span><input type="file" id="bf_${k}"></label>
      <label class="field"><span>O enlace al documento</span><input class="input" type="url" id="bu_${k}" placeholder="https://" value="${b[k].url && !b[k].url.startsWith('data:') ? esc(b[k].url) : ''}"></label>
      ${b[k].url ? `<button type="button" class="btn warn" data-quitardoc="${k}">Quitar documento</button>` : ''}</div>`).join('')}
    <button type="button" class="btn" id="btnGuardarBotones">Guardar contenidos</button></div>`;
  if (R === 'admin') extra = `<div class="panel"><h2>Datos de la plataforma</h2>
    <div class="form-row">
      <label class="field"><span>Nombre del curso</span><input class="input" id="pNombre" value="${esc(CONFIG.curso.nombre)}"></label>
      <label class="field"><span>Código del curso</span><input class="input" id="pCodigo" value="${esc(CONFIG.curso.codigo)}"></label>
      <label class="field"><span>Enlace de la sala (Meet o Teams)</span><input class="input" id="pSala" type="url" value="${esc(CONFIG.salaUrl)}"></label>
      <label class="field"><span>Enlace de Normas APA 7</span><input class="input" id="pApa" type="url" value="${esc(CONFIG.apaUrl)}"></label>
    </div>
    <label class="field"><span>Banner del curso (imagen, máx. 1 MB)</span><input type="file" id="pBanner" accept="image/*"></label>
    <button type="button" class="btn" id="btnGuardarPlat">Guardar cambios</button></div>`;
  return `<div class="course-banner"><h1>${esc(CONFIG.curso.nombre)}</h1><p>${esc(CONFIG.curso.codigo)}</p></div>
  <div class="big-btns">${Object.keys(b).map(k => `<button type="button" class="big-btn" data-info="${k}">${esc(b[k].titulo)}</button>`).join('')}</div>
  <div class="units-grid">${CONFIG.unidades.map(u => `
    <button type="button" class="unit-card" data-go="unidades"><h3>${esc(u.titulo)}</h3><p>${esc(u.desc)}</p></button>`).join('')}</div>
  <div class="links-row">
    <a class="link-btn dark" href="${esc(CONFIG.salaUrl)}" target="_blank" rel="noopener">Sala de encuentro sincrónico</a>
    <a class="link-btn light" href="${esc(CONFIG.apaUrl)}" target="_blank" rel="noopener">Normas APA 7</a>
  </div>${extra ? '<div style="margin-top:1.8rem"></div>' + extra : ''}`;
}
function bindCursoHome() {
  const g = $('#btnGuardarBotones'); if (g) g.onclick = async () => {
    for (const k of Object.keys(CONFIG.botones)) {
      const B = CONFIG.botones[k], f = $('#bf_' + k).files[0], u = v('bu_' + k).trim();
      B.texto = v('bt_' + k).trim();
      if (f) { try { B.url = await leerArchivo(f); B.archivo = f.name; } catch (e) { return abrirModal('Archivo muy pesado', `<p>«${esc(B.titulo)}» debe pesar menos de 1,5 MB. También puedes pegar un enlace.</p>`); } }
      else if (u) { B.url = u; B.archivo = ''; }
    }
    if (saveCfg()) { render(); aviso('Contenidos guardados.'); }
  };
  document.querySelectorAll('[data-quitardoc]').forEach(x => x.onclick = () => {
    const B = CONFIG.botones[x.dataset.quitardoc]; B.url = ''; B.archivo = ''; saveCfg(); render();
  });
  const p = $('#btnGuardarPlat'); if (p) p.onclick = async () => {
    const nombre = v('pNombre').trim(), codigo = v('pCodigo').trim();
    if (!nombre || !codigo) return abrirModal('Faltan datos', '<p>El nombre y el código del curso no pueden quedar vacíos.</p>');
    CONFIG.curso.nombre = nombre; CONFIG.curso.codigo = codigo; CONFIG.salaUrl = v('pSala').trim(); CONFIG.apaUrl = v('pApa').trim();
    const f = $('#pBanner').files[0];
    if (f) { try { CONFIG.bannerUrl = await leerArchivo(f); } catch (e) { return abrirModal('Imagen muy pesada', '<p>El banner debe pesar menos de 1 MB.</p>'); } }
    if (saveCfg()) { render(); aviso('Datos de la plataforma guardados.'); }
  };
}

function vUnidades() {
  return `<div class="page-title"><div class="ico unidades">U</div><h1>Unidades</h1></div>` +
    CONFIG.unidades.map(u => `<div class="panel"><h2>${esc(u.titulo)}: ${esc(u.desc)}</h2>
      <ul class="file-list">${u.items.map(i => `<li><span class="dot ${hecho(i.id) ? 'done' : ''}" style="display:inline-block;margin-right:.5rem"></span>
        <a href="#" data-go="${i.id}">${esc(i.titulo)}</a></li>`).join('')}</ul></div>`).join('');
}

/* ----- Calendario ----- */
function eventos() {
  const A = CONFIG.actividad, E = CONFIG.examen;
  return [
    { f: A.apertura, t: 'Apertura · Actividad 1', id: 'act1' }, { f: A.cierre, t: 'Cierre · Actividad 1', id: 'act1' },
    { f: E.apertura, t: 'Apertura · Examen', id: 'exam' },    { f: E.cierre, t: 'Cierre · Examen', id: 'exam' }
  ];
}
function vCal() {
  const { y, m } = calM, hoy = new Date(), ev = eventos();
  const start = (new Date(y, m, 1).getDay() + 6) % 7, dias = new Date(y, m + 1, 0).getDate();
  const enMes = ev.filter(e => { const x = new Date(e.f); return x.getFullYear() === y && x.getMonth() === m; })
                  .sort((a, b) => new Date(a.f) - new Date(b.f));
  let celdas = '<div class="cal-cell empty"></div>'.repeat(start);
  for (let d = 1; d <= dias; d++) {
    const es = enMes.filter(e => new Date(e.f).getDate() === d);
    const esHoy = hoy.getFullYear() === y && hoy.getMonth() === m && hoy.getDate() === d;
    celdas += `<div class="cal-cell ${esHoy ? 'today' : ''}"><span class="cal-d">${d}</span>${es.map(e =>
      `<button type="button" class="cal-ev" data-go="${e.id}" title="${esc(e.t)}">${esc(e.t)}</button>`).join('')}</div>`;
  }
  const titulo = new Date(y, m, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return `<div class="page-title"><div class="ico unidades">📅</div><h1>Calendario</h1></div>
  <div class="panel">
    <div class="cal-head"><h2>${titulo}</h2>
      <button type="button" class="btn gray" id="calPrev" aria-label="Mes anterior">‹</button>
      <button type="button" class="btn gray" id="calHoy">Hoy</button>
      <button type="button" class="btn gray" id="calNext" aria-label="Mes siguiente">›</button></div>
    <div class="cal-grid">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div class="cal-dow">${d}</div>`).join('')}${celdas}</div>
  </div>
  <div class="panel"><h2>Este mes</h2>${enMes.length ? `<ul class="file-list">${enMes.map(e =>
    `<li><a href="#" data-go="${e.id}">${esc(e.t)}</a> — ${fecha(e.f)}</li>`).join('')}</ul>` : '<p class="empty">No hay actividades este mes.</p>'}</div>`;
}
function bindCal() {
  const mover = n => { calM.m += n; if (calM.m < 0) { calM.m = 11; calM.y--; } if (calM.m > 11) { calM.m = 0; calM.y++; } render(); };
  const a = $('#calPrev'); if (!a) return;
  a.onclick = () => mover(-1); $('#calNext').onclick = () => mover(1);
  $('#calHoy').onclick = () => { const d = new Date(); calM = { y: d.getFullYear(), m: d.getMonth() }; render(); };
}

/* ----- Foro ----- */
function vForo() {
  if (hiloAbierto !== null) {
    const h = S.foro[hiloAbierto];
    return `<div class="page-title"><div class="ico foro">F</div><h1>${esc(h.asunto)}</h1></div>
    <div class="panel"><div class="thread"><strong>${esc(h.autor)}</strong> <small>${fecha(h.fecha)}</small><p>${esc(h.mensaje)}</p></div>
      ${h.replicas.map(r => `<div class="thread"><strong>${esc(r.autor)}</strong> <small>${fecha(r.fecha)}</small><p>${esc(r.mensaje)}</p></div>`).join('')}
      <label class="field"><span>Tu réplica</span><textarea class="input" id="replica"></textarea></label>
      <button type="button" class="btn" id="btnReplica">Publicar réplica</button>
      <button type="button" class="btn gray" id="btnVolver">Volver al foro</button></div>`;
  }
  const q = ($('#fq') && $('#fq').value || '').toLowerCase();
  const filas = S.foro.map((h, i) => ({ h, i })).filter(({ h }) => h.asunto.toLowerCase().includes(q));
  return `<div class="page-title"><div class="ico foro">F</div><h1>Foro de presentación</h1></div>
  <div class="panel">
    <div class="toolbar">
      <input class="input" id="fq" type="search" aria-label="Buscar en los foros" placeholder="Buscar en los foros" value="${esc(q)}">
      <button type="button" class="btn" id="btnNuevo">Añadir un nuevo tema de debate</button>
    </div>
    <div id="formNuevo" hidden>
      <label class="field"><span>Asunto</span><input class="input" id="asunto" value="Presentación"></label>
      <label class="field"><span>Mensaje</span><textarea class="input" id="mensaje" placeholder="Preséntate ante el grupo…"></textarea></label>
      <button type="button" class="btn" id="btnPublicar">Publicar en el foro</button>
      <button type="button" class="btn gray" id="btnCancelar">Cancelar</button>
    </div>
    <div class="tbl-wrap"><table><thead><tr><th>Debate</th><th>Comenzado por</th><th>Último mensaje</th><th>Réplicas</th></tr></thead><tbody>
    ${filas.length ? filas.map(({ h, i }) => {
      const ult = h.replicas.length ? h.replicas[h.replicas.length - 1] : h;
      return `<tr><td class="link" data-hilo="${i}">${esc(h.asunto)}</td>
        <td>${esc(h.autor)}<br><small>${fecha(h.fecha)}</small></td>
        <td>${esc(ult.autor)}<br><small>${fecha(ult.fecha)}</small></td><td>${h.replicas.length}</td></tr>`;
    }).join('') : `<tr><td colspan="4" class="empty">Aún no hay debates. Añade el primero con tu presentación.</td></tr>`}
    </tbody></table></div>
  </div>`;
}
function bindForo() {
  const q = $('#fq'); if (q) q.oninput = () => { const t = q.value; render(); const n = $('#fq'); n.focus(); n.setSelectionRange(t.length, t.length); };
  const n = $('#btnNuevo'); if (n) n.onclick = () => { $('#formNuevo').hidden = false; $('#mensaje').focus(); };
  const c = $('#btnCancelar'); if (c) c.onclick = () => { $('#formNuevo').hidden = true; };
  const p = $('#btnPublicar'); if (p) p.onclick = () => {
    const asunto = v('asunto').trim(), mensaje = v('mensaje').trim();
    if (!asunto || !mensaje) return abrirModal('Faltan datos', '<p>Escribe un asunto y un mensaje para publicar.</p>');
    S.foro.unshift({ asunto, mensaje, autor: quien(), fecha: new Date().toISOString(), replicas: [] }); save(); render();
  };
  document.querySelectorAll('[data-hilo]').forEach(td => td.onclick = () => { hiloAbierto = +td.dataset.hilo; render(); });
  const b = $('#btnVolver'); if (b) b.onclick = () => { hiloAbierto = null; render(); };
  const r = $('#btnReplica'); if (r) r.onclick = () => {
    const m = v('replica').trim(); if (!m) return abrirModal('Réplica vacía', '<p>Escribe tu réplica antes de publicar.</p>');
    S.foro[hiloAbierto].replicas.push({ autor: quien(), mensaje: m, fecha: new Date().toISOString() }); save(); render();
  };
}

/* ----- Repositorio ----- */
function vRepo() {
  if (role() === 'docente') { S.repoVisto = true; save(); }
  const admin = role() === 'admin';
  return `<div class="page-title"><div class="ico repo">R</div><h1>Repositorio</h1></div>
  <div class="panel">
    <div class="toolbar" style="justify-content:flex-end"><button type="button" class="btn gray" id="btnCarpeta">Descargar carpeta</button></div>
    <ul class="file-list repo-admin">${CONFIG.repositorio.length ? CONFIG.repositorio.map((f, i) => `<li><span>📄 <a href="${esc(f.url)}" download="${esc(f.nombre)}">${esc(f.nombre)}</a></span>
      ${admin ? `<button type="button" class="btn warn" data-quitar="${i}">Quitar</button>` : ''}</li>`).join('') : '<li class="empty">El repositorio está vacío.</li>'}</ul>
  </div>
  ${admin ? `<div class="panel"><h2>Agregar al repositorio</h2>
    <label class="field"><span>Archivo (máx. 1,5 MB en este prototipo)</span><input type="file" id="repoFile"></label>
    <button type="button" class="btn" id="btnAgregarRepo">Agregar archivo</button></div>` : ''}`;
}
function bindRepo() {
  const b = $('#btnCarpeta'); if (!b) return;
  b.onclick = () => CONFIG.repositorio.forEach((f, i) => setTimeout(() => {
    const a = document.createElement('a'); a.href = f.url; a.download = f.nombre; document.body.appendChild(a); a.click(); a.remove();
  }, i * 400));
  document.querySelectorAll('[data-quitar]').forEach(x => x.onclick = () => { CONFIG.repositorio.splice(+x.dataset.quitar, 1); saveCfg(); render(); });
  const a = $('#btnAgregarRepo'); if (a) a.onclick = async () => {
    const f = $('#repoFile').files[0]; if (!f) return abrirModal('Falta el archivo', '<p>Elige un archivo para agregar.</p>');
    try { CONFIG.repositorio.push({ nombre: f.name, url: await leerArchivo(f) }); } catch (e) { return abrirModal('Archivo muy pesado', '<p>Este prototipo guarda archivos de hasta 1,5 MB.</p>'); }
    if (saveCfg()) render(); else CONFIG.repositorio.pop();
  };
}

/* Convierte el enlace de la guía en algo que se pueda mostrar dentro de la página */
function guiaEmbed(url) {
  const m = url.match(/canva\.com\/design\/([^/]+)\/([^/?]+)/);
  if (m) return `https://www.canva.com/design/${m[1]}/${m[2]}/view?embed`;
  if (url.startsWith('data:application/pdf') || /\.pdf(\?|#|$)/i.test(url)) return url;
  return null;
}

/* ----- Actividad: docente ----- */
function vActividad() {
  const A = CONFIG.actividad, e = S.entrega, n = S.nota;
  const estado = !e ? 'No entregado' : 'Enviado para calificar';
  const tiempo = e ? `La tarea fue enviada ${restante(A.cierre, e.fecha)} antes de la fecha límite`
                   : (new Date() > new Date(A.cierre) ? 'La fecha límite ya pasó' : (new Date() < new Date(A.apertura) ? 'La actividad aún no abre' : `Faltan ${restante(A.cierre)}`));
  const puede = new Date() >= new Date(A.apertura) && new Date() <= new Date(A.cierre);
  const emb = A.guiaUrl ? guiaEmbed(A.guiaUrl) : null;
  const abrir = A.guiaUrl ? `<a href="${esc(A.guiaUrl)}" ${A.guiaUrl.startsWith('data:') ? `download="${esc(A.guiaNombre || 'guia')}"` : 'target="_blank" rel="noopener"'}>${emb ? 'Ver en pantalla completa' : 'Abrir la guía'}${A.guiaNombre ? ' (' + esc(A.guiaNombre) + ')' : ''}</a>` : '';
  const guia = !A.guiaUrl ? '<span class="empty">El evaluador aún no sube la guía.</span>'
    : (emb ? `<div class="embed"><iframe src="${esc(emb)}" title="Guía de la actividad" allowfullscreen loading="lazy"></iframe></div>${abrir}` : abrir);
  return `<div class="page-title"><div class="ico actividad">A</div><h1>${esc(titulo('act1'))}</h1></div>
  <div class="panel">
    <p><strong>Apertura:</strong> ${fecha(A.apertura)}<br><strong>Cierre:</strong> ${fecha(A.cierre)}</p>
    <div class="guide"><h3>Guía de la actividad</h3><p>${esc(A.guiaTexto)}</p>${guia}</div>
    <div class="toolbar">${e
      ? `<button type="button" class="btn gray" id="btnEditar" ${puede ? '' : 'disabled'}>Editar entrega</button><button type="button" class="btn gray" id="btnBorrar" ${puede ? '' : 'disabled'}>Borrar entrega</button>`
      : `<button type="button" class="btn" id="btnEditar" ${puede ? '' : 'disabled'}>Subir entrega</button>`}
      <input type="file" id="archivo" hidden></div>
    <h2>Estado de la entrega</h2>
    <table class="status-table"><tbody>
      <tr><th>Estado de la entrega</th><td style="${e ? 'background:var(--ok-bg)' : ''}">${estado}</td></tr>
      <tr><th>Estado de la calificación</th><td style="${n ? 'background:var(--ok-bg)' : ''}">${n ? 'Calificado' : 'Sin calificar'}</td></tr>
      <tr><th>Tiempo restante</th><td>${tiempo}</td></tr>
      <tr><th>Última modificación</th><td>${e ? fecha(e.fecha) : '-'}</td></tr>
      <tr><th>Archivos enviados</th><td>${e ? '📄 ' + (e.url ? `<a href="${esc(e.url)}" download="${esc(e.nombre)}">${esc(e.nombre)}</a>` : esc(e.nombre)) : '-'}</td></tr>
    </tbody></table>
    <h2 style="margin-top:1.4rem">Criterios de calificación</h2>
    <ul>${A.criterios.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <h2>Calificación y retroalimentación</h2>
    ${n ? `<p><span class="badge ok">${n.nota} / 5</span></p><p>${esc(n.comentario)}</p>`
        : `<p class="empty">Cuando el evaluador califique tu entrega, verás aquí la nota y sus comentarios.</p>`}
  </div>`;
}
function bindActividad() {
  const f = $('#archivo'), b = $('#btnEditar'); if (!b || !f) return;
  b.onclick = () => f.click();
  f.onchange = async () => {
    const file = f.files[0]; if (!file) return;
    const antes = S.entrega, notaAntes = S.nota;
    try { S.entrega = { nombre: file.name, fecha: new Date().toISOString(), url: await leerArchivo(file) }; }
    catch (e) { return abrirModal('Archivo muy pesado', '<p>En este prototipo la entrega puede pesar hasta 1,5 MB. Comprime el PDF e inténtalo de nuevo.</p>'); }
    S.nota = null;
    if (!save()) { S.entrega = antes; S.nota = notaAntes; return abrirModal('No se pudo guardar', '<p>El almacenamiento del navegador está lleno. Prueba con un archivo más liviano.</p>'); }
    render();
  };
  const d = $('#btnBorrar'); if (d) d.onclick = () => { S.entrega = null; S.nota = null; save(); render(); };
}

/* ----- Actividad: evaluador ----- */
function vActividadEval() {
  const A = CONFIG.actividad, e = S.entrega, n = S.nota;
  return `<div class="page-title"><div class="ico actividad">A</div><h1>${esc(titulo('act1'))}<span class="role-tag">Evaluador</span></h1></div>
  <div class="panel"><h2>Configurar la actividad</h2>
    <div class="form-row">
      <label class="field"><span>Inicio</span><input class="input" type="datetime-local" id="aApertura" value="${esc(A.apertura)}"></label>
      <label class="field"><span>Cierre</span><input class="input" type="datetime-local" id="aCierre" value="${esc(A.cierre)}"></label>
    </div>
    <label class="field"><span>Indicaciones de la guía</span><textarea class="input" id="aGuiaTexto">${esc(A.guiaTexto)}</textarea></label>
    <label class="field"><span>Documento de la guía ${A.guiaNombre ? '(actual: ' + esc(A.guiaNombre) + ')' : ''} — máx. 1,5 MB</span><input type="file" id="aGuiaFile"></label>
    <label class="field"><span>O enlace a la guía (documento o diapositivas en línea)</span><input class="input" type="url" id="aGuiaUrl" value="${A.guiaUrl && !A.guiaUrl.startsWith('data:') ? esc(A.guiaUrl) : ''}" placeholder="https://"></label>
    <label class="field"><span>Criterios de calificación (uno por línea)</span><textarea class="input" id="aCriterios">${esc(A.criterios.join('\n'))}</textarea></label>
    <button type="button" class="btn" id="btnGuardarAct">Guardar cambios</button></div>
  <div class="panel"><h2>Entregas y calificación</h2>
    <div class="tbl-wrap"><table><thead><tr><th>Docente</th><th>Entrega</th><th>Calificación y retroalimentación</th></tr></thead><tbody>
    <tr><td>${esc(CONFIG.usuario)}</td>
      <td>${e ? `📄 ${esc(e.nombre)}<br><small>${fecha(e.fecha)}</small>` + (e.url ? `<div class="toolbar" style="margin:.6rem 0 0"><button type="button" class="btn" data-ver="${esc(e.nombre)}">Ver documento</button><a class="btn gray" style="text-decoration:none" href="${esc(e.url)}" download="${esc(e.nombre)}">Descargar</a></div>` : '<br><small>Esta entrega se subió antes de la actualización: pide al docente que la suba de nuevo.</small>') : '<span class="empty">Sin entrega</span>'}</td>
      <td>${e ? `<div class="inline-grade"><input class="input" type="number" id="gNota" min="0" max="5" step="0.1" aria-label="Nota de 0 a 5" value="${n ? n.nota : ''}">
        <textarea class="input" id="gCom" aria-label="Comentario de retroalimentación" placeholder="Comentarios de retroalimentación">${n ? esc(n.comentario) : ''}</textarea>
        <button type="button" class="btn" id="btnGuardarNota">Guardar nota</button></div>` : '-'}</td></tr>
    </tbody></table></div></div>`;
}
function bindActividadEval() {
  const g = $('#btnGuardarAct'); if (g) g.onclick = async () => {
    const A = CONFIG.actividad;
    if (new Date(v('aCierre')) <= new Date(v('aApertura'))) return abrirModal('Fechas incorrectas', '<p>El cierre debe ser después del inicio.</p>');
    const f = $('#aGuiaFile').files[0];
    if (f) { try { A.guiaUrl = await leerArchivo(f); A.guiaNombre = f.name; } catch (e) { return abrirModal('Archivo muy pesado', '<p>La guía debe pesar menos de 1,5 MB. También puedes pegar un enlace.</p>'); } }
    else if (v('aGuiaUrl').trim()) { A.guiaUrl = v('aGuiaUrl').trim(); A.guiaNombre = ''; }
    A.apertura = v('aApertura'); A.cierre = v('aCierre'); A.guiaTexto = v('aGuiaTexto').trim();
    A.criterios = v('aCriterios').split('\n').map(x => x.trim()).filter(Boolean);
    if (saveCfg()) { render(); aviso('Actividad actualizada.'); }
  };
  const n = $('#btnGuardarNota'); if (n) n.onclick = () => {
    const nota = parseFloat(v('gNota'));
    if (isNaN(nota) || nota < 0 || nota > 5) return abrirModal('Nota no válida', '<p>Escribe una nota entre 0 y 5.</p>');
    S.nota = { nota: Math.round(nota * 10) / 10, comentario: v('gCom').trim() }; save(); render(); aviso('Calificación guardada.');
  };
}

/* ----- Examen: docente ----- */
function vExamen() {
  const E = CONFIG.examen, r = S.examen, ahora = new Date();
  const abierto = ahora >= new Date(E.apertura) && ahora <= new Date(E.cierre);
  if (hiloAbierto === 'quiz') return `<div class="page-title"><div class="ico examen">E</div><h1>Examen</h1></div>
    <div class="panel"><form id="formExamen">${E.preguntas.map((p, i) => `
      <fieldset class="exam-q"><legend>${i + 1}. ${esc(p.q)}</legend>
      ${p.o.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}
      <button type="submit" class="btn">Finalizar examen</button></form></div>`;
  return `<div class="page-title"><div class="ico examen">E</div><h1>Examen</h1></div>
  <div class="panel">
    <p><strong>Apertura:</strong> ${fecha(E.apertura)}<br><strong>Cierre:</strong> ${fecha(E.cierre)}</p>
    <div class="toolbar"><button type="button" class="btn" id="btnIniciar" ${r || !abierto ? 'disabled' : ''}>Iniciar evaluación</button></div>
    ${r ? `<p><span class="badge ok">Evaluación terminada</span></p><h2>Calificación</h2>
      <div class="result-grid">
        <div><strong>${r.nota}</strong>Nota (0 a 5)</div><div><strong>${r.total}</strong>Preguntas</div>
        <div><strong>${r.buenas}</strong>Buenas</div><div><strong>${r.malas}</strong>Malas</div></div>
      ${r.comentario ? `<h2 style="margin-top:1.2rem">Retroalimentación</h2><p>${esc(r.comentario)}</p>` : ''}`
      : (!abierto ? '<p class="empty">El examen no está disponible en este momento.</p>' : '')}
  </div>`;
}
function bindExamen() {
  const i = $('#btnIniciar'); if (i) i.onclick = () => { hiloAbierto = 'quiz'; render(); };
  const f = $('#formExamen'); if (!f) return;
  f.onsubmit = e => {
    e.preventDefault();
    const P = CONFIG.examen.preguntas;
    const buenas = P.filter((p, k) => { const s = f.querySelector(`input[name=q${k}]:checked`); return s && +s.value === p.ok; }).length;
    S.examen = { total: P.length, buenas, malas: P.length - buenas, nota: (buenas / P.length * 5).toFixed(1), comentario: '' };
    save(); hiloAbierto = null; render();
  };
}

/* ----- Examen: evaluador ----- */
function vExamenEval() {
  const E = CONFIG.examen, r = S.examen;
  return `<div class="page-title"><div class="ico examen">E</div><h1>Examen<span class="role-tag">Evaluador</span></h1></div>
  <div class="panel"><h2>Configurar el examen</h2>
    <div class="form-row">
      <label class="field"><span>Inicio</span><input class="input" type="datetime-local" id="eApertura" value="${esc(E.apertura)}"></label>
      <label class="field"><span>Cierre</span><input class="input" type="datetime-local" id="eCierre" value="${esc(E.cierre)}"></label>
    </div>
    <h3>Preguntas</h3>
    ${E.preguntas.map((p, i) => `<div class="q-edit" data-qi="${i}">
      <input class="input qq" aria-label="Pregunta ${i + 1}" value="${esc(p.q)}">
      ${p.o.map((o, j) => `<input class="input qo" aria-label="Opción ${j + 1}" value="${esc(o)}">`).join('')}
      <label>Respuesta correcta: <select class="select qok">${p.o.map((o, j) => `<option value="${j}" ${p.ok === j ? 'selected' : ''}>Opción ${j + 1}</option>`).join('')}</select></label>
      <button type="button" class="btn warn" data-delq="${i}" style="margin-left:.6rem">Quitar pregunta</button></div>`).join('')}
    <button type="button" class="btn gray" id="btnAddQ">Añadir pregunta</button>
    <button type="button" class="btn" id="btnGuardarExam">Guardar cambios</button></div>
  <div class="panel"><h2>Resultados y retroalimentación</h2>
    <div class="tbl-wrap"><table><thead><tr><th>Docente</th><th>Resultado</th><th>Nota y comentarios</th></tr></thead><tbody>
    <tr><td>${esc(CONFIG.usuario)}</td>
      <td>${r ? `${r.buenas} buenas, ${r.malas} malas de ${r.total}` : '<span class="empty">Aún no presenta el examen</span>'}</td>
      <td>${r ? `<div class="inline-grade"><input class="input" type="number" id="xNota" min="0" max="5" step="0.1" aria-label="Nota de 0 a 5" value="${r.nota}">
        <textarea class="input" id="xCom" aria-label="Comentario de retroalimentación" placeholder="Comentarios de retroalimentación">${esc(r.comentario || '')}</textarea>
        <button type="button" class="btn" id="btnGuardarXNota">Guardar nota</button></div>` : '-'}</td></tr>
    </tbody></table></div></div>`;
}
function leerPreguntas() {
  return [...document.querySelectorAll('.q-edit')].map(b => ({
    q: b.querySelector('.qq').value.trim(), o: [...b.querySelectorAll('.qo')].map(i => i.value.trim()), ok: +b.querySelector('.qok').value }));
}
function bindExamenEval() {
  const add = $('#btnAddQ'); if (!add) return;
  add.onclick = () => { CONFIG.examen.preguntas = leerPreguntas(); CONFIG.examen.preguntas.push({ q: 'Nueva pregunta', o: ['Opción 1', 'Opción 2', 'Opción 3'], ok: 0 }); render(); };
  document.querySelectorAll('[data-delq]').forEach(b => b.onclick = () => {
    CONFIG.examen.preguntas = leerPreguntas(); CONFIG.examen.preguntas.splice(+b.dataset.delq, 1); render();
  });
  $('#btnGuardarExam').onclick = () => {
    if (new Date(v('eCierre')) <= new Date(v('eApertura'))) return abrirModal('Fechas incorrectas', '<p>El cierre debe ser después del inicio.</p>');
    const P = leerPreguntas();
    if (!P.length || P.some(p => !p.q || p.o.some(o => !o))) return abrirModal('Faltan datos', '<p>El examen necesita al menos una pregunta y todos los textos completos.</p>');
    CONFIG.examen.apertura = v('eApertura'); CONFIG.examen.cierre = v('eCierre'); CONFIG.examen.preguntas = P;
    if (saveCfg()) { render(); aviso('Examen actualizado.'); }
  };
  const n = $('#btnGuardarXNota'); if (n) n.onclick = () => {
    const nota = parseFloat(v('xNota'));
    if (isNaN(nota) || nota < 0 || nota > 5) return abrirModal('Nota no válida', '<p>Escribe una nota entre 0 y 5.</p>');
    S.examen.nota = (Math.round(nota * 10) / 10).toFixed(1); S.examen.comentario = v('xCom').trim(); save(); render(); aviso('Calificación guardada.');
  };
}

/* ----- Calificaciones ----- */
function vNotas() {
  const a = S.nota ? +S.nota.nota : null, e = S.examen ? +S.examen.nota : null;
  const total = ([a, e].reduce((t, x) => t + (x || 0), 0)) / 2;
  const fila = (t, n, c) => `<tr><td>${esc(t)}</td><td>${n === null ? '-' : n}</td><td>0–5</td><td>${n === null ? '-' : (n / 5 * 100).toFixed(1) + ' %'}</td><td>${esc(c || '')}</td></tr>`;
  return `<div class="page-title"><div class="ico notas">C</div><h1>Calificaciones</h1></div>
  <div class="panel tbl-wrap"><table><thead><tr><th>Ítem de calificación</th><th>Calificación</th><th>Rango</th><th>Porcentaje</th><th>Retroalimentación</th></tr></thead><tbody>
    ${fila(titulo('act1'), a, S.nota && S.nota.comentario)}
    ${fila('Examen', e, S.examen ? (S.examen.comentario || `${S.examen.buenas} buenas de ${S.examen.total}`) : '')}
    <tr><td><strong>Total del curso</strong><br><small>Incluye calificaciones vacías.</small></td><td><strong>${total.toFixed(1)}</strong></td><td>0–5</td><td>${(total / 5 * 100).toFixed(1)} %</td><td></td></tr>
  </tbody></table></div>`;
}

/* =========================================================
   RENDER
   ========================================================= */
function render() {
  const R = role();
  if (view === 'home') app.innerHTML = vHome();
  else {
    const vistas = { curso: vCursoHome, unidades: vUnidades, foro: vForo, repo: vRepo, cal: vCal, notas: vNotas,
      act1: R === 'evaluador' ? vActividadEval : vActividad, exam: R === 'evaluador' ? vExamenEval : vExamen };
    app.innerHTML = `<div class="course">${sidebar()}<section class="content"><div class="content-inner">${vistas[view]()}</div></section></div>`;
  }
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = e => { e.preventDefault(); go(b.dataset.go); });
  app.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => {
    const g = $('#grp-' + b.dataset.toggle), abre = g.hidden; g.hidden = !abre;
    b.setAttribute('aria-expanded', abre); b.textContent = (abre ? '▾ ' : '▸ ') + CONFIG.unidades.find(u => u.id === b.dataset.toggle).titulo;
  });
  app.querySelectorAll('[data-info]').forEach(b => b.onclick = () => {
    const i = CONFIG.botones[b.dataset.info];
    if (!i.url) return abrirModal(i.titulo, `<p>${esc(i.texto)}</p>`);       // sin documento: muestra la descripción
    const a = document.createElement('a');
    a.href = i.url;
    if (i.url.startsWith('data:')) a.download = i.archivo || 'documento';   // archivo subido en el navegador: se descarga
    else { a.target = '_blank'; a.rel = 'noopener'; }                        // PDF o enlace: se abre en otra pestaña
    document.body.appendChild(a); a.click(); a.remove();
  });
  app.querySelectorAll('[data-ver]').forEach(b => b.onclick = async () => {
    try {
      const blob = await (await fetch(S.entrega.url)).blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (e) { abrirModal('No se pudo abrir', '<p>Usa el botón «Descargar» para verlo en tu equipo.</p>'); }
  });
  bindCursoHome(); bindCal(); bindForo(); bindRepo(); bindActividad(); bindActividadEval(); bindExamen(); bindExamenEval();
}
render();