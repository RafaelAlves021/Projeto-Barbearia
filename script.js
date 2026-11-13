const WA = '5521990357750';
const $ = (id) => document.getElementById(id);
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const track = (n, p) => { if (typeof gtag === 'function') gtag('event', n, p); };

$('year').textContent = new Date().getFullYear();

// ===== Aberto agora / Fechado =====
(function () {
  const d = new Date(), dia = d.getDay(), h = d.getHours();
  const aberto = dia >= 2 && dia <= 6 && h >= 9 && h < 19;
  $('statusLoja').classList.toggle('on', aberto);
  $('statusTxt').textContent = aberto
    ? 'Aberto agora, até as 19h'
    : 'Fechado agora. Abrimos de terça a sábado, às 9h';
})();

// ===== Clique na tabela de preços: já escolhe o serviço no agendamento =====
document.querySelectorAll('.board a').forEach((a) => {
  a.addEventListener('click', () => {
    $('servico').value = a.dataset.servico;
    atualizarTotal();
  });
});

// ===== Plano mensal (modal + WhatsApp) =====
let planoSelecionado = null;
const modalEl = $('modalPlano');
const modalPlano = modalEl ? new bootstrap.Modal(modalEl) : null;

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-assinar-plano');
  if (!btn) return;
  planoSelecionado = { nome: btn.dataset.planoNome, preco: btn.dataset.planoPreco };
  $('inputPlanoNome').value = `${planoSelecionado.nome} (${planoSelecionado.preco}/mês)`;
  if (modalPlano) modalPlano.show();
});

$('formAssinaturaPlano').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!planoSelecionado) return;
  const nome = $('inputAssinanteNome').value.trim();
  const tel = $('inputAssinanteTel').value.trim();
  const lista = load('bdf_assinaturas');
  lista.push({ nome, telefone: tel, plano: planoSelecionado.nome, preco: planoSelecionado.preco, data: new Date().toISOString() });
  save('bdf_assinaturas', lista);
  track('assinar_plano', { event_category: 'Assinatura', event_label: planoSelecionado.nome, value: parseFloat(planoSelecionado.preco.replace('R$', '').trim()) });
  const msg = `Olá, Matheus! Meu nome é *${nome}* (${tel}).\n\nQuero aderir ao plano mensal *${planoSelecionado.nome}* (${planoSelecionado.preco}/mês) pelo site da Barbearia Real. Como faço para ativar?`;
  if (modalPlano) modalPlano.hide();
  e.target.reset();
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
});

// ===== Agendamento =====
const dataEl = $('data'), slotsEl = $('slots'), horaEl = $('hora'), servEl = $('servico');
const pad = (n) => String(n).padStart(2, '0');
const hoje = new Date();
dataEl.min = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;

function atualizarTotal() {
  const o = servEl.selectedOptions[0];
  $('totalLinha').textContent = o && o.dataset.preco ? `Total: R$ ${o.dataset.preco}` : '';
}
servEl.addEventListener('change', atualizarTotal);

function desenharHorarios() {
  horaEl.value = '';
  if (!dataEl.value) return;
  const [a, m, d] = dataEl.value.split('-').map(Number);
  const dt = new Date(a, m - 1, d);
  if (dt.getDay() === 0 || dt.getDay() === 1) {
    slotsEl.innerHTML = '<p class="sub small m-0">Não abrimos aos domingos e segundas. Escolha de terça a sábado.</p>';
    return;
  }
  const ocupados = load('bdf_agendamentos').filter((x) => x.data === dataEl.value).map((x) => x.hora);
  const agora = new Date();
  const ehHoje = dt.toDateString() === agora.toDateString();
  slotsEl.innerHTML = '';
  for (let h = 9; h < 19; h++) {
    for (const min of [0, 30]) {
      const t = `${pad(h)}:${pad(min)}`;
      const passou = ehHoje && (h < agora.getHours() || (h === agora.getHours() && min <= agora.getMinutes()));
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.disabled = passou || ocupados.includes(t);
      b.addEventListener('click', () => {
        slotsEl.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        horaEl.value = t;
      });
      slotsEl.appendChild(b);
    }
  }
}
dataEl.addEventListener('change', desenharHorarios);

$('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const msgEl = $('confirmMsg');
  if (!horaEl.value) {
    msgEl.classList.remove('d-none');
    msgEl.style.color = msgEl.style.borderColor = '#ff6b6b';
    msgEl.textContent = 'Escolha um horário livre para continuar.';
    return;
  }
  const nome = $('nome').value.trim(), servico = servEl.value, data = dataEl.value, hora = horaEl.value;
  const preco = servEl.selectedOptions[0].dataset.preco;
  const lista = load('bdf_agendamentos');
  lista.push({ nome, servico, data, hora });
  save('bdf_agendamentos', lista);
  track('agendar_horario', { event_category: 'Agendamento', event_label: servico });
  const [a, m, d] = data.split('-');
  const msg = `Olá, Matheus! Aqui é *${nome}*.\n\nQuero agendar *${servico}* (R$ ${preco}) no dia *${d}/${m}/${a}* às *${hora}*. Tem vaga?`;
  msgEl.classList.remove('d-none');
  msgEl.style.color = msgEl.style.borderColor = '';
  msgEl.textContent = `Pedido registrado para ${d}/${m} às ${hora}. Abrindo o WhatsApp para confirmar.`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
  e.target.reset();
  slotsEl.innerHTML = '<p class="sub small m-0">Escolha uma data para ver os horários livres.</p>';
  $('totalLinha').textContent = '';
});

// ===== Avaliações (planilha do Google, com aprovação do barbeiro) =====
// Cole aqui a URL do Apps Script (veja o passo a passo). Vazia = modo teste, salva só neste navegador.
const REVIEWS_URL = 'https://script.google.com/macros/s/AKfycbye1ELROZT9QJuzojp5_jZWqF6HPUtRnyw5yPRp0WzB5IVa36z9P8N4kz8Xy8oJ7ebJ/exec';

const listaEl = $('reviewList');
function desenharAvaliacoes(revs) {
  listaEl.innerHTML = '';
  $('mediaNotas').textContent = '';
  if (!revs.length) {
    listaEl.innerHTML = '<p class="sub m-0">Ainda não há avaliações. Seja o primeiro a contar como foi.</p>';
    return;
  }
  const media = revs.reduce((s, r) => s + Number(r.nota), 0) / revs.length;
  $('mediaNotas').textContent = `${'★'.repeat(Math.round(media))} ${media.toFixed(1)} (${revs.length})`;
  revs.slice().reverse().forEach((r) => {
    const nota = Math.min(5, Math.max(1, Number(r.nota) || 1));
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    const card = document.createElement('div');
    card.className = 'rev';
    const s = document.createElement('span');
    s.className = 'stars';
    s.textContent = '★'.repeat(nota) + '☆'.repeat(5 - nota);
    const p = document.createElement('p');
    p.className = 'mb-2';
    p.textContent = r.texto;
    const n = document.createElement('div');
    n.className = 'fw-semibold small';
    n.textContent = r.nome;
    card.append(s, p, n);
    col.appendChild(card);
    listaEl.appendChild(col);
  });
}

async function carregarAvaliacoes() {
  if (!REVIEWS_URL) return desenharAvaliacoes(load('bdf_reviews'));
  try {
    const r = await fetch(REVIEWS_URL);
    desenharAvaliacoes(await r.json());
  } catch (e) {
    listaEl.innerHTML = '<p class="sub m-0">Não foi possível carregar as avaliações agora. Tente de novo em instantes.</p>';
  }
}
carregarAvaliacoes();

let notaAtual = 0;
document.querySelectorAll('#starInput button').forEach((b) => {
  b.addEventListener('click', () => {
    notaAtual = Number(b.dataset.v);
    $('revNota').value = `${notaAtual} de 5`;
    document.querySelectorAll('#starInput button').forEach((x) => x.classList.toggle('active', Number(x.dataset.v) <= notaAtual));
  });
});

$('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!notaAtual) { $('revNota').focus(); return; }
  const rev = { nome: $('revNome').value.trim(), nota: notaAtual, texto: $('revTexto').value.trim() };
  const msg = $('revMsg');
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    if (REVIEWS_URL) {
      await fetch(REVIEWS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(rev) });
      msg.textContent = 'Obrigado! Sua avaliação aparece no site assim que o Matheus aprovar.';
    } else {
      const revs = load('bdf_reviews');
      revs.push(rev);
      save('bdf_reviews', revs);
      desenharAvaliacoes(revs);
      msg.textContent = 'Avaliação salva (modo teste, só neste navegador).';
    }
    msg.classList.remove('d-none');
    e.target.reset();
    notaAtual = 0;
    document.querySelectorAll('#starInput button').forEach((x) => x.classList.remove('active'));
    track('enviar_avaliacao', { event_category: 'Avaliacao', value: rev.nota });
  } catch (err) {
    msg.textContent = 'Não foi possível enviar agora. Tente de novo em instantes.';
    msg.classList.remove('d-none');
  }
  btn.disabled = false;
});