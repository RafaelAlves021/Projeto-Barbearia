/**
 * BARBEARIA DO FEIO - LÓGICA E COMPORTAMENTO JAVASCRIPT
 */

// 1. Atualiza o ano no rodapé automaticamente
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// 2. Bloqueia a seleção de datas passadas no formulário
const dataInput = document.getElementById('data');
if (dataInput) {
  const hoje = new Date().toISOString().split('T')[0];
  dataInput.min = hoje;
}

// ========================================================
// RASTREAMENTO DE CLIQUES DO WHATSAPP (GOOGLE ANALYTICS)
// ========================================================
const whatsappFloat = document.getElementById('whatsappFloatBtn');
if (whatsappFloat) {
  whatsappFloat.addEventListener('click', function () {
    gtag('event', 'click_whatsapp', {
      'event_category': 'Contato',
      'event_label': 'Botao Flutuante'
    });
  });
}

const whatsappLink = document.getElementById('linkWhatsappContato');
if (whatsappLink) {
  whatsappLink.addEventListener('click', function () {
    gtag('event', 'click_whatsapp', {
      'event_category': 'Contato',
      'event_label': 'Link de Contato Texto'
    });
  });
}

// ========================================================
// AGENDAMENTO (localStorage + Google Analytics)
// ========================================================
const bookingForm = document.getElementById('bookingForm');
const confirmMsg = document.getElementById('confirmMsg');

if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    // Salva o agendamento localmente
    const bookings = JSON.parse(localStorage.getItem('bdf_bookings') || '[]');
    bookings.push({ nome, servico, data, hora });
    localStorage.setItem('bdf_bookings', JSON.stringify(bookings));

    // Envia evento de lead ao Google Analytics
    gtag('event', 'generate_lead', {
      'event_category': 'Agendamento',
      'event_label': servico,
      'value': servico === 'Nevou' ? 80 : (servico === 'Corte + Barba' ? 55 : 35)
    });

    // Exibe a mensagem de confirmação para o usuário
    const dataFormatada = data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    confirmMsg.textContent = `✓ Horário reservado com sucesso, ${nome}! ${servico} em ${dataFormatada} às ${hora}.`;
    confirmMsg.classList.remove('d-none');
    
    // Limpa o formulário após enviar
    bookingForm.reset();
  });
}

// ========================================================
// AVALIAÇÕES (Renderização, Seleção de Estrelas e Envio)
// ========================================================
const seedReviews = [
  { nome: 'Lucas M.', nota: 5, texto: 'Melhor disfarce da região, ambiente gente boa.' },
  { nome: 'Pedro H.', nota: 5, texto: 'Barba na navalha impecável, virei cliente fixo.' },
  { nome: 'Gabriel S.', nota: 4, texto: 'Atendimento rápido e capricho no acabamento.' }
];

function loadReviews() {
  return JSON.parse(localStorage.getItem('bdf_reviews') || 'null') || seedReviews;
}

function renderReviews() {
  const list = document.getElementById('reviewList');
  if (!list) return;

  const reviews = loadReviews();
  list.innerHTML = reviews.map(r => `
    <div class="col-md-4">
      <div class="p-4 review-card rounded-2 h-100">
        <span class="stars d-block mb-3">${'★'.repeat(r.nota)}${'☆'.repeat(5 - r.nota)}</span>
        <p class="text-dim small mb-3">"${r.texto}"</p>
        <div class="fw-semibold small">${r.nome}</div>
      </div>
    </div>
  `).join('');
}

// Carrega as avaliações na inicialização
renderReviews();

let selectedStars = 0;
const starInput = document.getElementById('starInput');

if (starInput) {
  starInput.addEventListener('click', function (e) {
    if (e.target.tagName !== 'BUTTON') return;
    selectedStars = Number(e.target.dataset.v);
    document.getElementById('revNota').value = selectedStars + ' de 5 estrelas';
    [...starInput.children].forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.v) <= selectedStars);
    });
  });
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (selectedStars === 0) {
      alert('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    const nome = document.getElementById('revNome').value;
    const texto = document.getElementById('revTexto').value;

    const reviews = loadReviews();
    reviews.unshift({ nome, nota: selectedStars, texto });
    localStorage.setItem('bdf_reviews', JSON.stringify(reviews));
    renderReviews();

    // Rastreia a avaliação enviada no Google Analytics
    gtag('event', 'envio_avaliacao', {
      'event_category': 'Engajamento',
      'value': selectedStars
    });

    // Limpa o formulário de avaliação
    this.reset();
    selectedStars = 0;
    [...starInput.children].forEach(btn => btn.classList.remove('active'));
    document.getElementById('revNota').value = '';
  });
}