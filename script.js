/**
 * BARBEARIA DO FEIO - LÓGICA COMPLETA DO SITE
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
// MÓDULO DE PLANOS MENSAIS (Configurável e Dinâmico)
// ========================================================
// Para alterar valores ou serviços no futuro, basta editar esta lista!
const listaPlanos = [
  {
    id: 'plano-barba',
    nome: 'Barba Club',
    preco: 'R$ 60',
    destaque: false,
    beneficios: [
      'Barba feita com toalha quente e navalha',
      'Até 4 visitas por mês (1 por semana)',
      'Hidratação e alinhamento inclusos',
      'Prioridade no agendamento'
    ]
  },
  {
    id: 'plano-vip',
    nome: 'Combo VIP (Cabelo + Barba)',
    preco: 'R$ 110',
    destaque: true, // Adiciona o selo "Mais Escolhido" e borda destacada
    beneficios: [
      'Cabelo e Barba ilimitados no mês',
      'Acabamento e pezinho sempre alinhados',
      'Toalha quente e finalização com pomada',
      'Bebida de cortesia a cada visita',
      'Prioridade máxima na agenda'
    ]
  },
  {
    id: 'plano-cabelo',
    nome: 'Corte Master',
    preco: 'R$ 70',
    destaque: false,
    beneficios: [
      'Corte de cabelo e disfarce no padrão da casa',
      'Até 4 cortes no mês (1 por semana)',
      'Pezinho e sobrancelha inclusos',
      'Desconto em produtos capilares'
    ]
  }
];

// Função que cria os cartões de planos na tela
function renderPlanos() {
  const container = document.getElementById('planosContainer');
  if (!container) return;

  container.innerHTML = listaPlanos.map(plano => `
    <div class="col-lg-4">
      <div class="card-plano ${plano.destaque ? 'destaque' : ''}">
        ${plano.destaque ? '<div class="badge-destaque">Mais Escolhido</div>' : ''}
        <div>
          <h3 class="fs-4 mb-2">${plano.nome}</h3>
          <div class="preco-plano">${plano.preco}<span> /mês</span></div>
          <ul class="beneficios-plano">
            ${plano.beneficios.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
        <button 
          type="button" 
          class="btn ${plano.destaque ? 'btn-rust' : 'btn-outline-bone'} w-100 py-3 text-uppercase fw-bold btn-assinar-plano"
          data-plano-id="${plano.id}"
          data-plano-nome="${plano.nome}"
          data-plano-preco="${plano.preco}">
          Assinar Plano
        </button>
      </div>
    </div>
  `).join('');
}

renderPlanos();

// Modal de Adesão ao Plano
let planoSelecionado = null;
const modalPlanoEl = document.getElementById('modalPlano');
const modalPlano = modalPlanoEl ? new bootstrap.Modal(modalPlanoEl) : null;

// Escuta o clique nos botões "Assinar Plano"
document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('btn-assinar-plano')) {
    const btn = e.target;
    planoSelecionado = {
      id: btn.dataset.planoId,
      nome: btn.dataset.planoNome,
      preco: btn.dataset.planoPreco
    };

    // Preenche o nome do plano no campo do modal
    document.getElementById('inputPlanoNome').value = `${planoSelecionado.nome} (${planoSelecionado.preco}/mês)`;
    
    // Abre o modal
    if (modalPlano) {
      modalPlano.show();
    }
  }
});

// Envio da assinatura para o WhatsApp
const formAssinaturaPlano = document.getElementById('formAssinaturaPlano');
if (formAssinaturaPlano) {
  formAssinaturaPlano.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('inputAssinanteNome').value.trim();
    const telefone = document.getElementById('inputAssinanteTel').value.trim();

    if (!planoSelecionado) return;

    // 1. Salva no localStorage para controle local
    const assinaturas = JSON.parse(localStorage.getItem('bdf_assinaturas') || '[]');
    assinaturas.push({
      nome,
      telefone,
      plano: planoSelecionado.nome,
      preco: planoSelecionado.preco,
      data: new Date().toISOString()
    });
    localStorage.setItem('bdf_assinaturas', JSON.stringify(assinaturas));

    // 2. Dispara evento de conversão no Google Analytics
    gtag('event', 'assinar_plano', {
      'event_category': 'Assinatura',
      'event_label': planoSelecionado.nome,
      'value': parseFloat(planoSelecionado.preco.replace('R$', '').trim())
    });

    // 3. Monta a mensagem para o WhatsApp do barbeiro
    const mensagem = `Olá, Matheus! Meu nome é *${nome}* (${telefone}).\n\nGostaria de aderir ao plano mensal *${planoSelecionado.nome}* (${planoSelecionado.preco}/mês) pelo site da Barbearia do Feio! Como faço para ativar?`;

    // 4. Cria a URL oficial codificada
    const urlWhatsApp = `https://wa.me/5521990357750?text=${encodeURIComponent(mensagem)}`;

    // Fecha o modal e limpa o formulário
    if (modalPlano) {
      modalPlano.hide();
    }
    formAssinaturaPlano.reset();

    // Abre a conversa no WhatsApp em uma nova aba
    window.open(urlWhatsApp, '_blank');
  });
}

// ========================================================
// AGENDAMENTO COM DISPARO PARA WHATSAPP
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

    const bookings = JSON.parse(localStorage.getItem('bdf_bookings') || '[]');
    bookings.push({ nome, servico, data, hora });
    localStorage.setItem('bdf_bookings', JSON.stringify(bookings));

    gtag('event', 'generate_lead', {
      'event_category': 'Agendamento',
      'event_label': servico,
      'value': servico === 'Nevou' ? 80 : (servico === 'Corte + Barba' ? 55 : 35)
    });

    const dataFormatada = data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    confirmMsg.textContent = `✓ Horário reservado com sucesso, ${nome}! Abrindo WhatsApp para confirmação...`;
    confirmMsg.classList.remove('d-none');

    // Abre o WhatsApp com a mensagem do agendamento
    const msgAgendamento = `Olá! Meu nome é *${nome}* e agendei pelo site:\n\n✂️ *Serviço:* ${servico}\n📅 *Data:* ${dataFormatada}\n⏰ *Horário:* ${hora}\n\nPoderia confirmar meu horário?`;
    const urlAgendamento = `https://wa.me/5521990357750?text=${encodeURIComponent(msgAgendamento)}`;
    
    setTimeout(() => {
      window.open(urlAgendamento, '_blank');
    }, 800);

    bookingForm.reset();
  });
}

// ========================================================
// AVALIAÇÕES
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

    gtag('event', 'envio_avaliacao', {
      'event_category': 'Engajamento',
      'value': selectedStars
    });

    this.reset();
    selectedStars = 0;
    [...starInput.children].forEach(btn => btn.classList.remove('active'));
    document.getElementById('revNota').value = '';
  });
}