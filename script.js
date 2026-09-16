// ========================================================
// CONTROLE DO MODAL E ASSINATURA DOS PLANOS
// ========================================================
let planoSelecionado = null;
const modalPlanoEl = document.getElementById('modalPlano');
const modalPlano = modalPlanoEl ? new bootstrap.Modal(modalPlanoEl) : null;

// Escuta o clique nos botões "Assinar Plano"
document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('btn-assinar-plano')) {
    const btn = e.target;
    planoSelecionado = {
      nome: btn.dataset.planoNome,
      preco: btn.dataset.planoPreco
    };

    // Preenche o campo de texto do modal com o plano escolhido
    const inputNome = document.getElementById('inputPlanoNome');
    if (inputNome) {
      inputNome.value = `${planoSelecionado.nome} (${planoSelecionado.preco}/mês)`;
    }

    // Abre o modal na tela
    if (modalPlano) {
      modalPlano.show();
    }
  }
});

// Envio do formulário do modal para o WhatsApp do barbeiro
const formAssinaturaPlano = document.getElementById('formAssinaturaPlano');
if (formAssinaturaPlano) {
  formAssinaturaPlano.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('inputAssinanteNome').value.trim();
    const telefone = document.getElementById('inputAssinanteTel').value.trim();

    if (!planoSelecionado) return;

    // Salva localmente para controle
    const assinaturas = JSON.parse(localStorage.getItem('bdf_assinaturas') || '[]');
    assinaturas.push({
      nome,
      telefone,
      plano: planoSelecionado.nome,
      preco: planoSelecionado.preco,
      data: new Date().toISOString()
    });
    localStorage.setItem('bdf_assinaturas', JSON.stringify(assinaturas));

    // Dispara evento para o Google Analytics
    gtag('event', 'assinar_plano', {
      'event_category': 'Assinatura',
      'event_label': planoSelecionado.nome,
      'value': parseFloat(planoSelecionado.preco.replace('R$', '').trim())
    });

    // Monta a mensagem para o WhatsApp do barbeiro Matheus
    const mensagem = `Olá, Matheus! Meu nome é *${nome}* (${telefone}).\n\nGostaria de aderir ao plano mensal *${planoSelecionado.nome}* (${planoSelecionado.preco}/mês) pelo site da Barbearia do Feio! Como faço para ativar?`;
    const urlWhatsApp = `https://wa.me/5521990357750?text=${encodeURIComponent(mensagem)}`;

    if (modalPlano) {
      modalPlano.hide();
    }
    formAssinaturaPlano.reset();

    // Abre o WhatsApp com a mensagem pronta
    window.open(urlWhatsApp, '_blank');
  });
}