/* ========== Central de Evolução Pessoal ==========
   Carregado ANTES do script.js. Define módulos, indicadores, metas e backup v2.
   Usa os globais do script.js (data, ui, Repo, FORMS...) apenas em tempo de execução. */
const Evo = (() => {
  const SCHEMA = 2;
  const U = { range: '30', from: '', to: '', area: '', tab: 'muay' };
  const num = v => parseFloat(String(v ?? '').replace(',', '.')) || 0;
  const sum = (a, f) => a.reduce((n, x) => n + f(x), 0);
  const mins = a => sum(a, x => num(x.minutes));
  const kms = a => sum(a, x => num(x.km));
  const fm = m => m >= 60 ? `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, '0')}` : `${Math.round(m)} min`;
  const fmo = m => m ? fm(m) : '';
  const fh = m => (m / 60).toFixed(1).replace('.', ',') + ' h';
  const fn = n => String(+n.toFixed(1)).replace('.', ',');
  const pace = (m, k) => { if (!k || !m) return '–'; const s = Math.round(m / k * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min/km`; };
  const speed = (k, m) => m ? fn(k / (m / 60)) + ' km/h' : '–';
  const vol = x => num(x.sets) * num(x.reps) * num(x.load);
  const D = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
  const mo = o => { const d = new Date(); d.setMonth(d.getMonth() + o, 1); return d.toLocaleDateString('sv-SE').slice(0, 7); };
  const fd = d => d.slice(8) + '/' + d.slice(5, 7);
  const mkid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const iso = () => new Date().toISOString();
  const pq = x => Math.min(num(x.hits), num(x.questions));

  /* ---- Modelos de formulário ---- */
  const Tx = (n, l, req) => ({ n, l, req }), Nu = (n, l, req, max) => ({ n, l, t: 'number', req, max });
  const Se = (n, l, o) => ({ n, l, t: 'select', o }), Ar = (n, l) => ({ n, l, t: 'area' });
  const Dt = (n, l, req) => ({ n, l, t: 'date', req });
  const base = (l = 'Data') => [Dt('date', l, 1), { n: 'time', l: 'Horário (opcional)', t: 'time' }];
  const MET = ['Horas', 'Sessões', 'Distância (km)', 'Questões resolvidas', 'Manual'];
  const forms = {
    faculdade: { label: 'sessão de estudo', fields: [...base(), Tx('subject', 'Disciplina', 1), Se('kind', 'Tipo', ['Estudo', 'Avaliação', 'Trabalho']), Tx('topic', 'Conteúdo estudado'), Nu('minutes', 'Tempo dedicado (min)'), Nu('grade', 'Nota (avaliações)', 0, 10), Dt('due', 'Prazo (trabalhos)'), Ar('notes', 'Observações')] },
    muay: { label: 'treino', m: 1, fields: [...base('Data do treino'), Nu('minutes', 'Duração (min)', 1), Se('kind', 'Tipo de treinamento', ['Técnica', 'Sparring', 'Condicionamento', 'Saco de pancada', 'Misto']), Tx('techniques', 'Técnicas trabalhadas'), Se('intensity', 'Intensidade', ['Leve', 'Moderada', 'Alta']), Ar('notes', 'Observações sobre o desempenho')] },
    corrida: { label: 'corrida', fields: [...base(), Nu('km', 'Distância (km)', 1), Nu('minutes', 'Tempo total (min)', 1), Se('kind', 'Tipo de treino', ['Leve', 'Longão', 'Intervalado', 'Tempo', 'Competição']), Ar('notes', 'Observações')] },
    pedal: { label: 'pedal', m: 1, fields: [...base(), Nu('km', 'Distância (km)', 1), Nu('minutes', 'Duração (min)', 1), Tx('route', 'Percurso'), Ar('notes', 'Observações')] },
    musculacao: { label: 'treino', m: 1, fields: [...base(), Se('group', 'Grupo muscular', ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Corpo inteiro']), Ar('exercises', 'Exercícios realizados'), Nu('sets', 'Séries'), Nu('reps', 'Repetições (por série)'), Nu('load', 'Carga (kg)'), Nu('minutes', 'Duração (min)'), Ar('notes', 'Observações')] },
    concursos: { label: 'sessão de estudo', fields: [...base(), Tx('contest', 'Concurso', 1), Tx('subject', 'Disciplina', 1), Se('kind', 'Tipo', ['Estudo', 'Simulado', 'Revisão']), Tx('topic', 'Assunto'), Nu('minutes', 'Duração (min)'), Nu('questions', 'Questões resolvidas'), Nu('hits', 'Acertos'), Ar('notes', 'Observações, edital e conteúdos pendentes')] },
    cursos: { label: 'registro', m: 1, fields: [Tx('name', 'Nome', 1), Se('type', 'Tipo', ['Curso', 'Livro', 'Leitura', 'Certificação', 'Estudo independente']), Tx('category', 'Categoria (ex.: Programação, Idiomas)'), Tx('author', 'Instituição ou autor'), Dt('date', 'Data de início', 1), Dt('end', 'Data de conclusão'), Se('status', 'Status', ['Em andamento', 'Concluído', 'Pausado']), Nu('hours', 'Carga horária (h)'), Nu('minutes', 'Tempo dedicado (min)'), Nu('progress', 'Progresso (%)', 0, 100), Ar('notes', 'Anotações')] },
    goals: { label: 'meta', fields: [Tx('name', 'Nome da meta', 1), Se('area', 'Área', ['Todas as áreas']), Se('metric', 'Medir por', MET), Nu('target', 'Objetivo numérico', 1), Nu('progress', 'Progresso atual (só para "Manual")'), Dt('start', 'Data de início'), Dt('due', 'Prazo'), Se('status', 'Status', ['Em andamento', 'Concluída', 'Cancelada']), Ar('description', 'Descrição')] },
  };
  const defaults = {};
  Object.keys(forms).forEach(k => { defaults[k] = {}; if (k !== 'goals') Object.defineProperty(defaults[k], 'date', { get: () => todayStr(), enumerable: true }); });
  Object.assign(defaults.cursos, { status: 'Em andamento' });
  Object.assign(defaults.goals, { area: 'Todas as áreas', metric: 'Horas', status: 'Em andamento' });

  /* ---- Áreas: rótulos, valor do gráfico, título e metadados ---- */
  const AREAS = {
    faculdade: { l: 'Faculdade', ic: 'graduation-cap', u: 'h', v: x => num(x.minutes) / 60, t: x => (x.subject || 'Estudo') + (x.kind && x.kind !== 'Estudo' ? ' · ' + x.kind : ''), m: x => [fmo(num(x.minutes)), x.topic, x.grade ? 'Nota ' + fn(num(x.grade)) : '', x.due ? 'Prazo ' + fmtDate(x.due) : ''] },
    muay: { l: 'Muay Thai', ic: 'swords', u: 'min', v: x => num(x.minutes), t: x => 'Muay Thai · ' + (x.kind || 'Treino'), m: x => [fmo(num(x.minutes)), x.intensity, x.techniques] },
    corrida: { l: 'Corrida', ic: 'footprints', u: 'km', v: x => num(x.km), t: x => `Corrida · ${fn(num(x.km))} km`, m: x => [fmo(num(x.minutes)), pace(num(x.minutes), num(x.km)), x.kind] },
    pedal: { l: 'Pedal', ic: 'bike', u: 'km/h', v: x => num(x.minutes) ? num(x.km) / (num(x.minutes) / 60) : 0, t: x => `Pedal · ${fn(num(x.km))} km`, m: x => [fmo(num(x.minutes)), speed(num(x.km), num(x.minutes)), x.route] },
    musculacao: { l: 'Musculação', ic: 'dumbbell', u: 'kg', v: vol, t: x => 'Musculação · ' + (x.group || 'Treino'), m: x => [fmo(num(x.minutes)), vol(x) ? Math.round(vol(x)) + ' kg de volume' : '', (x.exercises || '').split('\n')[0]] },
    concursos: { l: 'Concursos', ic: 'landmark', u: '%', v: x => num(x.questions) ? pq(x) / num(x.questions) * 100 : 0, t: x => (x.contest || 'Concurso') + (x.subject ? ' · ' + x.subject : ''), m: x => [x.kind, num(x.questions) ? `${num(x.questions)} questões · ${Math.round(pq(x) / num(x.questions) * 100)}%` : '', fmo(num(x.minutes))] },
    cursos: { l: 'Cursos', ic: 'book-open', u: 'h', v: x => num(x.minutes) / 60, t: x => x.name, m: x => [x.type, x.status, x.category, fmo(num(x.minutes)), num(x.progress) ? num(x.progress) + '%' : ''] },
  };
  const AK = Object.keys(AREAS), ALL = ['notes', 'ideas', 'tasks', 'plans', 'events', ...Object.keys(forms)];
  forms.goals.fields[1].o = ['Todas as áreas', ...AK.map(k => AREAS[k].l)];
  const LABEL = { notes: 'Notas', ideas: 'Ideias', tasks: 'Tarefas', plans: 'Planos', events: 'Eventos', goals: 'Metas', ...Object.fromEntries(AK.map(k => [k, AREAS[k].l])) };

  const STATS = {
    faculdade: a => { const g = a.filter(x => x.grade !== '' && x.grade != null && !isNaN(parseFloat(x.grade))); return [['Horas de estudo', fh(mins(a))], ['Registros', a.length], ['Média das notas', g.length ? fn(sum(g, x => num(x.grade)) / g.length) : '–']]; },
    muay: a => [['Treinos', a.length], ['Horas', fh(mins(a))], ['Duração média', a.length ? fm(mins(a) / a.length) : '–']],
    corrida: a => [['Corridas', a.length], ['Distância', fn(kms(a)) + ' km'], ['Ritmo médio', pace(mins(a), kms(a))]],
    pedal: a => [['Pedais', a.length], ['Distância', fn(kms(a)) + ' km'], ['Vel. média', speed(kms(a), mins(a))]],
    musculacao: a => [['Treinos', a.length], ['Volume total', Math.round(sum(a, vol)) + ' kg'], ['Carga máxima', Math.max(0, ...a.map(x => num(x.load))) + ' kg']],
    concursos: a => { const q = sum(a, x => num(x.questions)), h = sum(a, pq); return [['Horas de estudo', fh(mins(a))], ['Questões', q], ['Aproveitamento', q ? Math.round(h / q * 100) + '%' : '–']]; },
    cursos: a => [['Concluídos', a.filter(x => x.status === 'Concluído').length], ['Horas', fh(mins(a))], ['Registros', a.length]],
  };

  /* ---- Migração e dados ---- */
  const empty = () => Object.fromEntries(Object.keys(forms).map(k => [k, []]));
  const migrate = d => { ALL.forEach(k => { d[k] = Array.isArray(d[k]) ? d[k].filter(x => x && typeof x === 'object') : []; d[k].forEach(x => { x.id = x.id || mkid(); x.createdAt = x.createdAt || iso(); x.updatedAt = x.updatedAt || x.createdAt; }); }); return d; };
  const all = () => AK.flatMap(k => data[k].map(x => ({ ...x, k, date: x.date || (x.createdAt || '').slice(0, 10) })));
  const sorted = a => [...a].sort((x, y) => (y.date + (y.time || '')).localeCompare(x.date + (x.time || '')));

  /* ---- Período e metas ---- */
  function period() {
    const t = todayStr();
    return ({ 1: { from: t, to: t }, 7: { from: D(t, -6), to: t }, 30: { from: D(t, -29), to: t }, mes: { from: t.slice(0, 8) + '01', to: t },
      custom: { from: U.from || '0000', to: U.to || '9999' } })[U.range] || { from: '0000', to: '9999' };
  }
  const prevPeriod = p => { if (p.from === '0000' || p.to === '9999') return null; const n = Math.round((new Date(p.to) - new Date(p.from)) / 864e5) + 1; return { from: D(p.from, -n), to: D(p.from, -1) }; };
  const inP = (r, p) => r.date >= p.from && r.date <= p.to;
  const UN = { Horas: 'h', 'Sessões': 'sessões', 'Distância (km)': 'km', 'Questões resolvidas': 'questões', Manual: '' };
  function gProg(g) {
    if (g.metric === 'Manual') return num(g.progress);
    const k = AK.find(k => AREAS[k].l === g.area);
    const r = all().filter(x => (!k || x.k === k) && (!g.start || x.date >= g.start) && (!g.due || x.date <= g.due));
    return g.metric === 'Horas' ? mins(r) / 60 : g.metric === 'Sessões' ? r.length : g.metric === 'Distância (km)' ? kms(r) : sum(r, x => num(x.questions));
  }

  /* ---- Componentes ---- */
  const hdr = (t, s, b) => `<div class="head"><div><h1>${t}</h1>${s ? `<p class="sub">${s}</p>` : ''}</div><div class="actions">${b || ''}</div></div>`;
  const addBtn = (k, p) => `<button class="btn ${p ? 'primary' : ''}" data-act="new" data-c="${k}"><i data-lucide="${AREAS[k].ic}"></i>${AREAS[k].l}</button>`;
  const stat = (n, l) => `<div class="card stat"><b>${n}</b><span>${l}</span></div>`;
  const statRow = (k, a) => `<div class="grid stats">${STATS[k](a).map(([l, v]) => stat(v, l)).join('')}</div>`;
  const chartCard = (t, h) => `<div class="card chartcard"><h2>${t}</h2>${h}</div>`;
  const sel = (p, o, cur) => `<select data-e="${p}">${o.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const filterBar = (area) => `<div class="filters">${sel('range', [['1', 'Hoje'], ['7', 'Últimos 7 dias'], ['mes', 'Este mês'], ['30', 'Últimos 30 dias'], ['all', 'Todo o período'], ['custom', 'Personalizado']], U.range)}${U.range === 'custom' ? `<input type="date" data-e="from" value="${U.from}" aria-label="De"><input type="date" data-e="to" value="${U.to}" aria-label="Até">` : ''}${area ? sel('area', [['', 'Todas as áreas'], ...AK.map(k => [k, AREAS[k].l])], U.area) : ''}</div>`;
  const tl = (r, d) => { const A = AREAS[r.k]; return `<div class="ag"><i data-lucide="${A.ic}"></i><div class="body"><b>${esc(A.t(r))}</b><small>${[A.l, d ? fmtDate(r.date) : '', r.time, ...A.m(r)].filter(Boolean).map(esc).join(' · ')}</small></div>${rowActions(r.k, r.id)}</div>`; };
  const areaList = (k, a) => `<div class="list">${sorted(a).map(x => tl({ ...x, k }, true)).join('') || empty('Nenhum registro ainda. Use o botão acima para criar o primeiro.')}</div>`;
  const series = (k, a) => [...a].sort((x, y) => x.date.localeCompare(y.date)).slice(-12).map(x => ({ l: fd(x.date), v: AREAS[k].v(x) }));
  const heat = rows => { const t = todayStr(); return `<div class="heat">${[...Array(35)].map((_, i) => { const d = D(t, i - 34), n = rows.filter(r => r.date === d).length; return `<i style="--o:${n ? Math.min(.3 + n * .2, 1) : .08}" title="${fmtDate(d)}: ${n}"></i>`; }).join('')}</div><p class="sub" style="margin-top:8px">Últimos 35 dias. Quanto mais forte, mais atividades.</p>`; };
  function barChart(it, u) {
    if (!it.length) return empty('Sem registros ainda.');
    const W = 640, H = 170, P = 24, max = Math.max(...it.map(i => i.v), 1e-9), bw = (W - 2 * P) / it.length;
    const bars = it.map((i, n) => { const h = i.v / max * (H - 2 * P - 14); return `<rect class="evb" x="${P + n * bw + bw * .15}" y="${H - P - h}" width="${bw * .7}" height="${h}" rx="5"><title>${i.l}: ${fn(i.v)} ${u}</title></rect>`; }).join('');
    const lb = [...new Set([0, it.length - 1])].map(n => `<text x="${P + n * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${it[n].l}</text>`).join('');
    return `<svg class="area" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico em ${u}"><line class="ax" x1="${P}" x2="${W - P}" y1="${H - P}" y2="${H - P}"/>${bars}${lb}</svg><div class="legend"><span>Valores em ${u}</span></div>`;
  }
  function goalCard(g, full) {
    const p = gProg(g), t = num(g.target) || 1, v = Math.min(100, Math.round(p / t * 100)), ok = p >= t, late = !ok && g.status === 'Em andamento' && g.due && g.due < todayStr();
    return `<div class="card"><div class="item"><div class="body"><div class="title">${esc(g.name)}</div><div class="meta"><span class="tag ${ok ? 'ok' : late ? 'high' : 'blue'}">${ok ? 'Atingida' : late ? 'Atrasada' : g.status}</span><span class="tag">${esc(g.area)}</span>${g.due ? `<span>Prazo: ${fmtDate(g.due)}</span>` : ''}</div>${full && g.description ? `<p>${esc(g.description)}</p>` : ''}</div>${full ? `<div>${rowActions('goals', g.id)}</div>` : ''}</div>
      <div class="bar" style="margin-top:12px"><i style="width:${v}%"></i></div><div class="pline"><span>${fn(p)} de ${fn(t)} ${UN[g.metric] || ''}</span><b>${v}%</b></div></div>`;
  }
  const cmp = (l, a, b, f) => { const dl = b ? Math.round((a - b) / b * 100) : null; return `<div class="r2"><span>${l}</span><b>${f(a)}</b><small>antes: ${f(b)}</small><em class="delta ${dl == null ? '' : dl >= 0 ? 'up' : 'dn'}">${dl == null ? (a ? 'novo' : '–') : (dl >= 0 ? '+' : '') + dl + '%'}</em></div>`; };
  const areaPage = k => { const a = data[k]; return `${hdr(AREAS[k].l, '', addBtn(k, 1))}${statRow(k, a)}<section>${chartCard('Últimos registros · ' + AREAS[k].u, barChart(series(k, a), AREAS[k].u))}</section><section><h2>Histórico</h2>${areaList(k, a)}</section>`; };
  const TK = ['muay', 'corrida', 'pedal', 'musculacao'];

  /* ---- Telas ---- */
  const dayActs = ds => AK.flatMap(k => data[k].filter(x => x.date === ds).map(x => ({ ...x, k })));
  const views = {
    hoje() {
      const ds = ui.cal.sel, rs = sorted(dayActs(ds)), it = dayItems(ds), pend = it.tk.filter(t => t.status !== 'Concluída').length;
      const lbl = ds === todayStr() ? 'hoje' : fmtDate(ds);
      const run = data.goals.filter(g => g.status === 'Em andamento').slice(0, 3);
      return `${hero()}
        <div class="grid stats" style="margin-top:16px">${stat(rs.length, 'Atividades registradas')}${stat(fh(mins(rs)), 'Tempo dedicado')}${stat(pend, 'Tarefas pendentes')}${stat(it.ev.length, it.ev.length === 1 ? 'Evento' : 'Eventos')}</div>
        <section><h2>Registrar em ${lbl}</h2><div class="actions">${AK.map(k => `<button class="btn" data-act="new" data-c="${k}" data-date="${ds}"><i data-lucide="${AREAS[k].ic}"></i>${AREAS[k].l}</button>`).join('')}</div></section>
        <section><h2>Atividades de ${lbl}</h2><div>${rs.map(r => tl(r)).join('') || empty('Nenhuma atividade registrada neste dia.')}</div></section>
        <section><h2>Metas em andamento</h2><div class="grid cols">${run.map(g => goalCard(g)).join('') || empty('Nenhuma meta em andamento.')}</div></section>`;
    },
    evolucao() {
      const t = todayStr(), p = period(), pp = prevPeriod(p), R = all(), cur = R.filter(r => inP(r, p)), h = mins(cur);
      const d7 = new Set(R.filter(r => r.date >= D(t, -6) && r.date <= t).map(r => r.date)).size;
      const tm = mins(R.filter(r => r.date.slice(0, 7) === mo(0))), lm = mins(R.filter(r => r.date.slice(0, 7) === mo(-1)));
      const evo = lm ? `${tm >= lm ? '+' : ''}${Math.round((tm - lm) / lm * 100)}%` : (tm ? 'Novo' : '–');
      const reached = g => num(g.target) > 0 && gProg(g) >= num(g.target);
      const done = data.cursos.filter(x => x.status === 'Concluído').length + data.goals.filter(reached).length;
      const run = data.goals.filter(g => g.status === 'Em andamento' && !reached(g));
      const weeks = [...Array(8)].map((_, i) => { const to = D(t, -7 * (7 - i)), from = D(to, -6); return { l: fd(to), v: mins(R.filter(r => r.date >= from && r.date <= to)) / 60 }; });
      const months = [...Array(6)].map((_, i) => { const m = mo(i - 5); return { l: m.slice(5) + '/' + m.slice(2, 4), v: mins(R.filter(r => r.date.slice(0, 7) === m)) / 60 }; });
      const prev = pp ? R.filter(r => inP(r, pp)) : null, days = a => new Set(a.map(r => r.date)).size;
      const label = p.from === '0000' || p.to === '9999' ? 'Todo o período' : p.from === p.to ? fmtDate(p.from) : `${fmtDate(p.from)} – ${fmtDate(p.to)}`;
      return `${hdr('Evolução', label, AK.map(k => addBtn(k)).join(''))}${filterBar()}
        <div class="grid stats">${stat(fh(h), 'Horas dedicadas')}${stat(cur.length, 'Atividades registradas')}${stat(done, 'Cursos e metas concluídos')}${stat(run.length, 'Metas em andamento')}${stat(Math.round(d7 / 7 * 100) + '%', 'Consistência (7 dias)')}${stat(evo, 'Horas: mês atual vs. anterior')}</div>
        <div class="grid cols" style="margin-top:16px">
          ${chartCard('Evolução semanal · horas', barChart(weeks, 'h'))}${chartCard('Evolução mensal · horas', barChart(months, 'h'))}
          <div class="card"><h2>Tempo por categoria</h2>${cur.length ? `<div class="chart">${AK.map(k => barRow(AREAS[k].l, +(mins(cur.filter(r => r.k === k)) / 60).toFixed(1), h / 60)).join('')}</div>` : empty('Sem registros neste período.')}</div>
          <div class="card"><h2>Calendário de atividades</h2>${heat(R)}</div>
          <div class="card"><h2>Comparativo com o período anterior</h2>${prev ? cmp('Horas', h / 60, mins(prev) / 60, x => fn(x) + ' h') + cmp('Atividades', cur.length, prev.length, String) + cmp('Dias ativos', days(cur), days(prev), String) : empty('Escolha um período limitado (ex.: 30 dias) para comparar.')}</div>
          <div class="card"><h2>Metas em andamento</h2><div class="list">${run.slice(0, 3).map(g => goalCard(g)).join('') || empty('Nenhuma meta em andamento. Crie uma em Metas.')}</div></div>
        </div>
        <section><h2>Por área</h2><div class="grid cols">${AK.map(k => `<a class="card arow" href="#${TK.includes(k) ? 'treinos' : k}" ${TK.includes(k) ? `data-act="evoTab" data-k="${k}"` : ''}><div class="ah"><i data-lucide="${AREAS[k].ic}"></i>${AREAS[k].l}</div><div class="a3">${STATS[k](cur.filter(r => r.k === k)).map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div></a>`).join('')}</div></section>
        <section><h2>Últimas atividades</h2><div>${sorted(R).slice(0, 8).map(r => tl(r, true)).join('') || empty('Nada registrado ainda. Comece por uma das áreas acima.')}</div></section>`;
    },
    faculdade: () => areaPage('faculdade'),
    concursos: () => areaPage('concursos'),
    cursos: () => areaPage('cursos'),
    treinos() {
      const t = todayStr(), k = U.tab, rows = TK.flatMap(x => data[x].map(y => ({ ...y, k: x }))), r30 = rows.filter(r => r.date >= D(t, -29));
      return `${hdr('Treinos', 'Frequência e volume esportivo', TK.map(x => addBtn(x, x === k)).join(''))}
        <div class="grid stats">${stat(rows.length, 'Treinos registrados')}${stat(r30.length, 'Treinos em 30 dias')}${stat(fn(kms(rows.filter(r => r.k === 'corrida' || r.k === 'pedal'))) + ' km', 'Corrida + pedal')}${stat(fh(mins(rows)), 'Tempo de treino')}</div>
        <div class="grid cols" style="margin-top:16px"><div class="card"><h2>Frequência · 30 dias</h2><div class="chart">${TK.map(x => barRow(AREAS[x].l, r30.filter(r => r.k === x).length, r30.length)).join('')}</div></div><div class="card"><h2>Calendário esportivo</h2>${heat(rows)}</div></div>
        <section><div class="tabs">${TK.map(x => `<button class="btn ${x === k ? 'primary' : ''}" data-act="evoTab" data-k="${x}"><i data-lucide="${AREAS[x].ic}"></i>${AREAS[x].l}</button>`).join('')}</div>
        ${statRow(k, data[k])}<div style="height:16px"></div>${chartCard(AREAS[k].l + ' · evolução · ' + AREAS[k].u, barChart(series(k, data[k]), AREAS[k].u))}
        <section><h2>Histórico de ${AREAS[k].l}</h2>${areaList(k, data[k])}</section></section>`;
    },
    metas() {
      return `${hdr('Metas', 'O progresso é calculado a partir dos seus registros', `<button class="btn primary" data-act="new" data-c="goals"><i data-lucide="plus"></i>Nova meta</button>`)}<div class="list">${data.goals.map(g => goalCard(g, 1)).join('') || empty('Nenhuma meta ainda. Ex.: estudar 10 horas nesta semana.')}</div>`;
    },
    historico() {
      const p = period(), rows = sorted(all().filter(r => inP(r, p) && (!U.area || r.k === U.area)));
      const byDay = [...new Set(rows.map(r => r.date))];
      return `${hdr('Histórico', 'Linha do tempo de todas as atividades')}${filterBar(1)}${byDay.map(d => `<section style="margin-top:20px"><h2>${new Date(d + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>${rows.filter(r => r.date === d).map(r => tl(r)).join('')}</section>`).join('') || empty('Nenhuma atividade neste filtro.')}`;
    },
  };
  const actions = { evoTab: e => { U.tab = e.k; if (location.hash !== '#treinos') location.hash = '#treinos'; else render(); } };
  document.addEventListener('change', ev => { const p = ev.target.dataset?.e; if (p) { U[p] = ev.target.value; render(); } });

  /* ---- Backup v2: exportar e importar ---- */
  function exportData() {
    try {
      const payload = { app: 'poeta', version: SCHEMA, exportedAt: iso(), counts: Object.fromEntries(ALL.map(k => [k, data[k].length])), data };
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })), download: `poeta-backup-${todayStr()}.json` });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Backup exportado.');
    } catch { toast('Não foi possível exportar os dados.'); }
  }
  const sig = x => JSON.stringify(Object.keys(x).filter(k => !['id', 'createdAt', 'updatedAt', 'completedAt'].includes(k)).sort().map(k => [k, x[k]]));
  function merge(cur, inc) {
    const out = {}, st = {};
    ALL.forEach(k => {
      const list = cur[k].map(x => ({ ...x })), byId = new Map(list.map(x => [x.id, x])), sigs = new Set(list.map(sig));
      st[k] = { add: 0, old: 0 };
      (inc[k] || []).forEach(x => {
        const o = byId.get(x.id);
        if (o) { if ((x.updatedAt || '') > (o.updatedAt || '')) Object.assign(o, x); st[k].old++; }
        else if (sigs.has(sig(x))) st[k].old++;
        else { list.push({ ...x }); byId.set(x.id, x); sigs.add(sig(x)); st[k].add++; }
      });
      out[k] = list;
    });
    return { out, st };
  }
  function parse(text) {
    let j; try { j = JSON.parse(text); } catch { throw Error('O arquivo não é um JSON válido.'); }
    if (!j || typeof j !== 'object' || Array.isArray(j)) throw Error('Estrutura de backup inválida.');
    const v = j.version ?? 1;
    if (typeof v !== 'number' || v > SCHEMA) throw Error(`Backup de versão ${v}, mais nova que a suportada (${SCHEMA}). Atualize o sistema.`);
    const p = j.version ? j.data : j;
    if (!p || typeof p !== 'object' || !ALL.some(k => k in p)) throw Error('Nenhum dado reconhecido neste arquivo.');
    ALL.forEach(k => { if (p[k] !== undefined && !(Array.isArray(p[k]) && p[k].every(x => x && typeof x === 'object' && !Array.isArray(x)))) throw Error(`Campo "${k}" inválido.`); });
    return { v, d: migrate(Object.fromEntries(ALL.map(k => [k, p[k] || []]))) };
  }
  function importFile(file) {
    const inp = $('#file'); if (inp) inp.value = '';
    if (!file) return;
    const fr = new FileReader();
    fr.onerror = () => toast('Não foi possível ler o arquivo.');
    fr.onload = () => {
      try {
        const { v, d } = parse(fr.result), { out, st } = merge(data, d);
        const rows = ALL.filter(k => d[k].length).map(k => `<li>${LABEL[k]}: <b>${d[k].length}</b> no arquivo · ${st[k].add} novos · ${st[k].old} já existentes</li>`).join('');
        $('#modalForm').innerHTML = `<h2>Importar backup</h2><p class="sub">Formato v${v}. Resumo do arquivo:</p><ul class="isum">${rows || '<li>Arquivo sem registros.</li>'}</ul>
          <p class="sub">Mesclar mantém seus dados e adiciona só o que é novo, sem duplicar. Substituir troca tudo pelo arquivo; uma cópia dos dados atuais fica guardada neste navegador.</p>
          <div class="foot"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn" value="replace">Substituir</button><button class="btn primary" value="merge">Mesclar</button></div>`;
        $('#modalForm').onsubmit = e => {
          const a = e.submitter?.value;
          if (a === 'merge') { data = out; commit(); toast('Dados mesclados com sucesso.'); }
          else if (a === 'replace') {
            if (!confirm('Substituir TODOS os dados atuais pelos do arquivo?')) return;
            try { localStorage.setItem(Storage.KEY + ':prev', JSON.stringify(data)); } catch { }
            data = d; commit(); toast('Dados substituídos. Cópia anterior guardada.');
          }
        };
        $('#modal').showModal();
      } catch (e) { toast(e.message || 'Arquivo inválido.'); }
    };
    fr.readAsText(file);
  }

  return { ui: U, tl, dayActs, empty, migrate, forms, defaults, views, actions, exportData, importFile,
    nav: [['hoje', 'Hoje', 'calendar-check'], ['evolucao', 'Evolução', 'trending-up'], ['faculdade', 'Faculdade', 'graduation-cap'], ['treinos', 'Treinos', 'dumbbell'], ['concursos', 'Concursos', 'landmark'], ['cursos', 'Cursos', 'book-open'], ['metas', 'Metas', 'flag'], ['historico', 'Histórico', 'history']] };
})();
