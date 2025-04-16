// js/main.js
import { Manutencao } from './classes/Manutencao.js';
import { Veiculo } from './classes/Veiculo.js';
import { Carro } from './classes/Carro.js';
import { CarroEsportivo } from './classes/CarroEsportivo.js';
import { Caminhao } from './classes/Caminhao.js';

/**
 * Array principal que armazena todas as instâncias de Veiculo na garagem.
 * @type {Veiculo[]}
 */
let garagem = [];
const STORAGE_KEY = 'minhaGaragemInteligente_v2'; // Chave para LocalStorage

// --- Elementos DOM frequentemente usados ---
const listaVeiculosDiv = document.getElementById('listaVeiculos');
const notificacaoDiv = document.getElementById('notificacoes');
const formAdicionarVeiculo = document.getElementById('formAdicionarVeiculo');
const tipoVeiculoSelect = document.getElementById('tipoVeiculo');
const campoCapacidadeDiv = document.getElementById('campoCapacidadeCarga');
const capacidadeInput = document.getElementById('capacidadeCargaVeiculo');
const modal = document.getElementById('modalDetalhesVeiculo');
const modalContent = modal.querySelector('.modal-content');
const modalTitulo = document.getElementById('modalTituloVeiculo');
const modalInfoDiv = document.getElementById('modalInfoVeiculo');
const modalAcoesDiv = document.getElementById('modalAcoesVeiculo');
const modalHistoricoDiv = document.getElementById('modalHistoricoManutencao');
const formManutencao = document.getElementById('formManutencao');
const manutencaoVeiculoIdInput = document.getElementById('manutencaoVeiculoId');
const manutencaoDataInput = document.getElementById('manutencaoData');
const manutencaoTipoInput = document.getElementById('manutencaoTipo');
const manutencaoCustoInput = document.getElementById('manutencaoCusto');
const manutencaoDescricaoInput = document.getElementById('manutencaoDescricao');
const listaAgendamentosDiv = document.getElementById('listaAgendamentosFuturos');

// --- Gerenciamento da Garagem e LocalStorage ---

/**
 * Salva o estado atual da array 'garagem' no LocalStorage.
 * Serializa cada veículo usando seu método toJSON().
 * @returns {void}
 */
function salvarGaragem() {
    try {
        // Usa o método toJSON de cada veículo para garantir a serialização correta
        const garagemJSON = JSON.stringify(garagem.map(v => v.toJSON()));
        localStorage.setItem(STORAGE_KEY, garagemJSON);
        // console.log("Garagem salva:", garagemJSON); // Log para debug (pode ser extenso)
    } catch (error) {
        console.error("Erro crítico ao salvar garagem no LocalStorage:", error);
        exibirNotificacao("ERRO GRAVE: Não foi possível salvar os dados da garagem. Alterações podem ser perdidas.", 'error', 0);
    }
}

/**
 * Carrega os dados da garagem do LocalStorage e reidrata os objetos Veiculo.
 * Usa um factory pattern improvisado dentro da função para instanciar a classe correta.
 * Atualiza a UI após carregar.
 * @returns {void}
 */
function carregarGaragem() {
    try {
        const garagemJSON = localStorage.getItem(STORAGE_KEY);
        if (garagemJSON) {
            const garagemGenerica = JSON.parse(garagemJSON);
            // Reidrata os objetos: transforma JSON genérico em instâncias de classes corretas
            garagem = garagemGenerica.map(veiculoJSON => reidratarVeiculo(veiculoJSON))
                                    .filter(v => v !== null); // Filtra veículos que falharam

             if (garagem.length !== garagemGenerica.length) {
                console.warn("Alguns veículos não puderam ser carregados corretamente do LocalStorage.");
                exibirNotificacao("Aviso: Alguns dados de veículos podem não ter sido carregados corretamente.", 'warning');
             }
        } else {
            garagem = [];
        }
    } catch (error) {
        console.error("Erro ao carregar ou parsear garagem do LocalStorage:", error);
        exibirNotificacao("Erro ao carregar dados da garagem. Iniciando com garagem vazia.", 'error');
        garagem = [];
        // localStorage.removeItem(STORAGE_KEY); // Opcional: Limpar storage corrompido
    }
    // Atualiza a UI após carregar/falhar
    renderizarGaragem();
    renderizarAgendamentosFuturos();
    verificarAgendamentosProximos();
}

/**
 * Factory function para recriar a instância correta de Veiculo a partir de JSON.
 * Chamado por carregarGaragem.
 * @param {object} json - O objeto JSON recuperado do localStorage.
 * @returns {Veiculo|Carro|CarroEsportivo|Caminhao|null} A instância do veículo ou null em caso de erro.
 */
function reidratarVeiculo(json) {
    if (!json || !json.tipoVeiculo) {
        console.error("Tentativa de reidratar veículo a partir de JSON inválido:", json);
        return null;
    }

    let veiculo;
    try {
        // Cria a instância da classe correta
        switch (json.tipoVeiculo) {
            case 'Carro':
                veiculo = new Carro(json.modelo, json.cor, json.id);
                break;
            case 'CarroEsportivo':
                // Cria primeiro e depois atribui turbo se existir
                veiculo = new CarroEsportivo(json.modelo, json.cor, false, json.id); // Inicia com turbo false
                veiculo.turbo = json.turbo || false; // Restaura o estado do turbo
                break;
            case 'Caminhao':
                 // Cria primeiro e depois atribui carga/capacidade se existir
                 veiculo = new Caminhao(json.modelo, json.cor, 0, 0, json.id); // Inicia com 0
                 veiculo.capacidadeCarga = Math.max(0, parseFloat(json.capacidadeCarga) || 0);
                 veiculo.cargaAtual = Math.max(0, parseFloat(json.cargaAtual) || 0);
                break;
            default:
                console.warn(`Tipo de veículo desconhecido: ${json.tipoVeiculo}. Criando como Veiculo base.`);
                veiculo = new Veiculo(json.modelo, json.cor, json.id, json.tipoVeiculo);
        }

        // Restaura propriedades comuns (já feito no construtor base, mas podemos garantir)
        veiculo.ligado = json.ligado || false;
        veiculo.velocidade = json.velocidade || 0;

        // Reidrata o histórico de manutenção (usando a classe Manutencao)
        if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
            veiculo.historicoManutencao = json.historicoManutencao.map(mJson => {
                if (!mJson || !mJson.data || !mJson.tipo) {
                    console.warn("Registro de manutenção inválido:", mJson);
                    return null;
                }
                const manutencao = new Manutencao(mJson.data, mJson.tipo, mJson.custo, mJson.descricao);
                if (mJson.id) manutencao.id = mJson.id; // Restaura ID original
                if (isNaN(manutencao.data.getTime())) {
                    console.warn(`Manutenção ${manutencao.id || mJson.tipo} com data inválida.`);
                }
                return manutencao;
            }).filter(m => m !== null);

            veiculo.historicoManutencao.sort((a, b) => b.data - a.data); // Re-sort after loading
        } else {
            veiculo.historicoManutencao = [];
        }

        return veiculo;

    } catch (error) {
        console.error(`Erro ao reidratar veículo ${json.id || '(sem id)'} tipo ${json.tipoVeiculo}:`, error);
        return null; // Falha segura
    }
}


// --- Funções de Renderização da UI ---

/**
 * Renderiza a lista de veículos na garagem na tela principal.
 * @returns {void}
 */
function renderizarGaragem() {
    if (!listaVeiculosDiv) return;
    listaVeiculosDiv.innerHTML = '';

    if (garagem.length === 0) {
        listaVeiculosDiv.innerHTML = '<p style="text-align: center; color: #777;">Garagem vazia. Adicione um veículo!</p>';
        return;
    }

    garagem.sort((a, b) => a.modelo.localeCompare(b.modelo)); // Ordena por modelo

    garagem.forEach(veiculo => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('vehicle-item');
        itemDiv.setAttribute('data-id', veiculo.id);
        // IMPORTANT: onclick handlers must now call functions exposed globally or via an app object
        itemDiv.innerHTML = `
            <span><strong style="color: #2980b9;">${veiculo.modelo}</strong> (${veiculo.tipoVeiculo}) - Cor: ${veiculo.cor}</span>
            <div class="actions">
                <button onclick="window.app.abrirModalDetalhes('${veiculo.id}')" title="Detalhes / Manutenção">Detalhes / Manutenção</button>
                <button class="warning" onclick="window.app.removerVeiculo('${veiculo.id}')" title="Remover veículo">Remover</button>
            </div>
        `;
        listaVeiculosDiv.appendChild(itemDiv);
    });
}

/**
 * Renderiza o histórico de manutenção e agendamentos para um veículo específico dentro do modal.
 * @param {string} veiculoId - O ID do veículo cujo histórico deve ser renderizado.
 * @returns {void}
 */
function renderizarHistoricoManutencaoModal(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!modalHistoricoDiv) return;

    if (!veiculo) {
        console.error("Veículo não encontrado para renderizar histórico:", veiculoId);
        modalHistoricoDiv.innerHTML = '<p>Erro: Veículo não encontrado.</p>';
        return;
    }

    modalHistoricoDiv.innerHTML = veiculo.getHistoricoHTML(); // Usa o método da classe Veiculo
}

/**
 * Renderiza a lista global de agendamentos futuros na seção correspondente da página principal.
 * @returns {void}
 */
function renderizarAgendamentosFuturos() {
    if (!listaAgendamentosDiv) return;
    listaAgendamentosDiv.innerHTML = '';
    const agora = new Date();
    let agendamentos = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.data instanceof Date && !isNaN(manutencao.data.getTime()) && manutencao.data > agora) {
                agendamentos.push({ veiculo: veiculo, manutencao: manutencao });
            }
        });
    });

    agendamentos.sort((a, b) => a.manutencao.data - b.manutencao.data); // Mais próximo primeiro

    if (agendamentos.length === 0) {
        listaAgendamentosDiv.innerHTML = '<p style="text-align: center; color: #777;">Nenhum agendamento futuro.</p>';
        return;
    }

    agendamentos.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('schedule-item');
        itemDiv.setAttribute('data-id', item.manutencao.id);
        // IMPORTANT: onclick handlers must now call functions exposed globally or via an app object
        itemDiv.innerHTML = `
            <span>${item.manutencao.formatar(true, `${item.veiculo.modelo} (${item.veiculo.cor})`)}</span>
            <button class="small-warning" onclick="window.app.removerManutencao('${item.veiculo.id}', '${item.manutencao.id}')" title="Cancelar agendamento">Cancelar</button>
       `;
        listaAgendamentosDiv.appendChild(itemDiv);
    });
}

// --- Funções do Modal e Ações do Veículo ---

/**
 * Abre o modal de detalhes para um veículo específico.
 * @param {string} veiculoId - O ID do veículo a ser exibido no modal.
 * @returns {void}
 */
function abrirModalDetalhes(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo || !modal) {
        exibirNotificacao("Erro: Veículo não encontrado ou modal indisponível.", "error");
        return;
    }

    if (modalTitulo) modalTitulo.textContent = `Detalhes: ${veiculo.modelo} (${veiculo.cor})`;
    if (manutencaoVeiculoIdInput) manutencaoVeiculoIdInput.value = veiculoId; // Associa form ao veículo

    atualizarInfoVeiculoNoModal(veiculoId); // Popula infos e botões
    renderizarHistoricoManutencaoModal(veiculoId); // Popula histórico

    if (formManutencao) formManutencao.reset();
    // Configura o datepicker (Flatpickr deve estar carregado globalmente ou importado)
    if (typeof flatpickr !== 'undefined' && manutencaoDataInput) {
        flatpickr(manutencaoDataInput, {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            // minDate: "today", // Opcional: impedir datas passadas
            locale: "pt"
        });
    }

    modal.style.display = 'block';
    if (modalContent) modalContent.classList.add('animate-in');
}

/**
 * Fecha o modal de detalhes.
 * @returns {void}
 */
function fecharModal() {
    if (!modal || !modalContent) return;
    modalContent.classList.add('animate-out');
    // Espera animação (opcional) ou fecha direto
    // setTimeout(() => {
        modal.style.display = 'none';
        modalContent.classList.remove('animate-in', 'animate-out');
    // }, 300);
}

/**
 * Atualiza as informações e botões de ação dentro do modal para o veículo especificado.
 * Só executa se o modal estiver visível para o veículo correto.
 * @param {string} veiculoId - O ID do veículo cujas informações devem ser atualizadas.
 * @returns {void}
 */
function atualizarInfoVeiculoNoModal(veiculoId) {
    if (!modal || modal.style.display !== 'block' || !manutencaoVeiculoIdInput || manutencaoVeiculoIdInput.value !== veiculoId) {
        return;
    }

    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo || !modalInfoDiv || !modalAcoesDiv) return;

    modalInfoDiv.innerHTML = veiculo.exibirInformacoesCompletaHTML(); // Usa método da classe
    modalAcoesDiv.innerHTML = ''; // Limpa ações

    // Botões Comuns (onclick needs global scope or app object)
    if (!veiculo.ligado) {
        modalAcoesDiv.innerHTML += `<button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'ligar')" title="Ligar motor"><span role="img" aria-label="Chave">🔑</span> Ligar</button>`;
    } else {
        modalAcoesDiv.innerHTML += `<button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'desligar')" title="Desligar motor"><span role="img" aria-label="Botão Power Off">🔌</span> Desligar</button>`;
        modalAcoesDiv.innerHTML += `<button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'acelerar', 10)" title="Aumentar velocidade (+10 km/h)"><span role="img" aria-label="Pedal">💨</span> Acelerar (+10)</button>`;
    }
    modalAcoesDiv.innerHTML += `<button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'buzinar')" title="Tocar buzina"><span role="img" aria-label="Megafone">📣</span> Buzinar</button>`;

    // Botões Específicos
    if (veiculo instanceof CarroEsportivo) {
        if (!veiculo.turbo) {
            modalAcoesDiv.innerHTML += `<button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'ativarTurbo')" title="Ativar turbo"><span role="img" aria-label="Foguete">🚀</span> Ativar Turbo</button>`;
        } else {
            modalAcoesDiv.innerHTML += `<button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'desativarTurbo')" title="Desativar turbo"><span role="img" aria-label="Caracol">🐌</span> Desativar Turbo</button>`;
        }
    } else if (veiculo instanceof Caminhao) {
        const cargaContainer = document.createElement('div');
        cargaContainer.style.cssText = 'display: flex; align-items: center; margin-top: 10px; flex-wrap: wrap; gap: 5px;';
        cargaContainer.innerHTML = `
            <input type="number" id="pesoCargaModal_${veiculo.id}" placeholder="Peso (kg)" min="1" style="width: 100px; margin-right: 5px; padding: 8px;" title="Peso para carregar/descarregar">
            <button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'carregar')" title="Carregar caminhão"><span role="img" aria-label="Seta para cima">⬆️</span> Carregar</button>
            <button onclick="window.app.executarAcaoVeiculo('${veiculo.id}', 'descarregar')" title="Descarregar caminhão"><span role="img" aria-label="Seta para baixo">⬇️</span> Descarregar</button>
        `;
         modalAcoesDiv.appendChild(cargaContainer);
    }
}

/**
 * Função intermediária para chamar métodos de um veículo a partir de botões na UI.
 * Trata casos especiais como pegar valores de input (carga do caminhão).
 * @param {string} veiculoId - O ID do veículo alvo.
 * @param {string} acao - O nome do método a ser chamado no objeto Veiculo (ex: 'ligar', 'carregar').
 * @param {*} [param=null] - Um parâmetro opcional a ser passado para o método (ex: incremento da aceleração).
 * @returns {void}
 */
function executarAcaoVeiculo(veiculoId, acao, param = null) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para executar ação.", "error");
         return;
     }

    // Tratamento especial para carregar/descarregar caminhão
    if ((acao === 'carregar' || acao === 'descarregar') && veiculo instanceof Caminhao) {
        const inputPeso = document.getElementById(`pesoCargaModal_${veiculo.id}`);
        if (!inputPeso) {
            console.error("Input de peso não encontrado no modal para caminhão.");
            return;
        }
        param = inputPeso.value; // Pega o valor atual do input
         // Validação básica (método _validarPeso fará validação numérica)
         if (!param) {
             exibirNotificacao("Por favor, insira um peso.", "warning");
             inputPeso.focus();
             return;
         }
         inputPeso.value = ''; // Limpa o campo após usar
    }

    // Verifica se o método existe no objeto veículo e o chama
    if (typeof veiculo[acao] === 'function') {
        try {
            veiculo[acao](param); // Chama o método (ex: veiculo.ligar(), veiculo.acelerar(10), veiculo.carregar('500'))
            // Métodos das classes já devem chamar: exibirNotificacao, atualizarInfoVeiculoNoModal, salvarGaragem
        } catch (error) {
             console.error(`Erro ao executar ação '${acao}' no veículo ${veiculo.id}:`, error);
             exibirNotificacao(`Erro ao executar ${acao}: ${error.message}`, 'error');
        }
    } else {
        console.error(`Ação '${acao}' não é uma função válida no veículo ${veiculo.id}`);
        exibirNotificacao(`Erro interno: Ação '${acao}' desconhecida.`, 'error');
    }
}

// --- Manipulação de Formulários e Eventos ---

/**
 * Manipulador do evento 'submit' do formulário de adicionar veículo.
 * Cria a instância correta do veículo, adiciona à garagem, salva e atualiza a UI.
 * @param {Event} event - O objeto do evento submit.
 * @returns {void}
 */
function handleAdicionarVeiculoSubmit(event) {
    event.preventDefault();

    const tipo = tipoVeiculoSelect.value;
    const modelo = document.getElementById('modeloVeiculo').value;
    const cor = document.getElementById('corVeiculo').value;

    if (!tipo || !modelo.trim() || !cor.trim()) {
         exibirNotificacao("Preencha tipo, modelo e cor.", 'warning');
         return;
    }

    let novoVeiculo;
    try {
        switch (tipo) {
            case 'Carro':
                novoVeiculo = new Carro(modelo, cor);
                break;
            case 'CarroEsportivo':
                novoVeiculo = new CarroEsportivo(modelo, cor); // Turbo default é false
                break;
            case 'Caminhao':
                const capacidade = capacidadeInput.value;
                if (!capacidade || isNaN(parseFloat(capacidade)) || parseFloat(capacidade) < 0) {
                    exibirNotificacao("Capacidade de carga inválida para caminhão.", 'error');
                    capacidadeInput.focus();
                    return;
                }
                novoVeiculo = new Caminhao(modelo, cor, capacidade);
                break;
            default:
                exibirNotificacao("Tipo de veículo inválido.", 'error');
                return;
        }

        garagem.push(novoVeiculo);
        salvarGaragem();
        renderizarGaragem();
        exibirNotificacao(`Veículo ${modelo} adicionado!`, 'success');
        formAdicionarVeiculo.reset();
        if (campoCapacidadeDiv) campoCapacidadeDiv.style.display = 'none';
        if (capacidadeInput) capacidadeInput.required = false;

    } catch (error) {
        console.error("Erro ao criar ou adicionar veículo:", error);
        exibirNotificacao(`Erro ao adicionar veículo: ${error.message}`, 'error');
    }
}

/**
 * Mostra ou esconde o campo de capacidade de carga baseado no tipo de veículo selecionado.
 * @returns {void}
 */
function handleTipoVeiculoChange() {
    if (!campoCapacidadeDiv || !capacidadeInput) return;
    const show = (this.value === 'Caminhao');
    campoCapacidadeDiv.style.display = show ? 'block' : 'none';
    capacidadeInput.required = show;
     if (!show) {
         capacidadeInput.value = '';
     }
}

/**
 * Manipulador do evento 'submit' do formulário de manutenção (dentro do modal).
 * Cria uma instância de Manutencao, adiciona ao histórico do veículo e atualiza a UI.
 * @param {Event} event - O objeto do evento submit.
 * @returns {void}
 */
function handleManutencaoSubmit(event) {
    event.preventDefault();

    const veiculoId = manutencaoVeiculoIdInput.value;
    const veiculo = garagem.find(v => v.id === veiculoId);

    if (!veiculo) {
        exibirNotificacao("Erro: Veículo não encontrado para adicionar manutenção.", 'error');
        return;
    }

    const data = manutencaoDataInput.value;
    const tipo = manutencaoTipoInput.value;
    const custo = manutencaoCustoInput.value;
    const descricao = manutencaoDescricaoInput.value;

     if (!data || !tipo.trim() || custo === '' || parseFloat(custo) < 0) {
         exibirNotificacao("Preencha Data, Tipo e Custo (não negativo).", 'warning');
         return;
     }

    try {
        const novaManutencao = new Manutencao(data, tipo, custo, descricao);
        const adicionadoComSucesso = veiculo.adicionarManutencao(novaManutencao); // Método já valida, salva, notifica

        if (adicionadoComSucesso) {
            renderizarHistoricoManutencaoModal(veiculoId); // Atualiza modal
            renderizarAgendamentosFuturos(); // Atualiza lista geral
            formManutencao.reset();
            // Fecha datepicker (Flatpickr)
            const fpInstance = manutencaoDataInput._flatpickr;
            if (fpInstance) fpInstance.close();
            verificarAgendamentosProximos(); // Re-verifica lembretes
        }
        // Notificação de erro já exibida por adicionarManutencao se falhou

    } catch (error) {
        console.error("Erro ao criar/adicionar manutenção via formulário:", error);
        exibirNotificacao(`Erro no formulário de manutenção: ${error.message}`, 'error');
    }
}

/**
 * Remove um veículo da garagem após confirmação.
 * @param {string} veiculoId - O ID do veículo a ser removido.
 * @returns {void}
 */
function removerVeiculo(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para remoção.", "error");
         return;
     }

    if (confirm(`ATENÇÃO!\nDeseja remover PERMANENTEMENTE o veículo "${veiculo.modelo} (${veiculo.cor})"?\n\nHistórico de manutenção será perdido.`)) {
        garagem = garagem.filter(v => v.id !== veiculoId);
        salvarGaragem();
        renderizarGaragem();
        renderizarAgendamentosFuturos();
        exibirNotificacao(`Veículo ${veiculo.modelo} removido.`, 'success');

        if (modal.style.display === 'block' && manutencaoVeiculoIdInput.value === veiculoId) {
            fecharModal();
        }
    }
}

/**
 * Remove um registro específico de manutenção/agendamento de um veículo após confirmação.
 * @param {string} veiculoId - O ID do veículo dono do registro.
 * @param {string} manutencaoId - O ID da manutenção a ser removida.
 * @returns {void}
 */
function removerManutencao(veiculoId, manutencaoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para remover manutenção.", "error");
         return;
     }

     const manutencao = veiculo.historicoManutencao.find(m => m.id === manutencaoId);
     if (!manutencao) {
         exibirNotificacao("Erro: Registro de manutenção não encontrado.", "error");
         return;
     }

    if (confirm(`Remover o registro:\n"${manutencao.tipo}" em ${manutencao.data.toLocaleDateString()}?`)) {
        const removido = veiculo.removerManutencaoPorId(manutencaoId); // Usa método do veículo

        if (removido) {
            exibirNotificacao('Manutenção/Agendamento removido.', 'success');
             // Atualiza UIs
             if (modal.style.display === 'block' && manutencaoVeiculoIdInput.value === veiculoId) {
                renderizarHistoricoManutencaoModal(veiculoId); // Modal
             }
            renderizarAgendamentosFuturos(); // Lista geral
            verificarAgendamentosProximos(); // Lembretes
        } else {
            exibirNotificacao('Não foi possível remover a manutenção.', 'error');
        }
    }
}

// --- Notificações e Lembretes ---
let notificationTimeout;

/**
 * Exibe uma notificação flutuante na tela.
 * @param {string} mensagem - O texto da notificação.
 * @param {'info'|'success'|'warning'|'error'} [tipo='info'] - O tipo da notificação (controla a cor).
 * @param {number} [duracaoMs=5000] - Duração em milissegundos. 0 para não esconder automaticamente.
 * @returns {void}
 */
function exibirNotificacao(mensagem, tipo = 'info', duracaoMs = 5000) {
    if (!notificacaoDiv) return;

    notificacaoDiv.textContent = mensagem;
    notificacaoDiv.className = ''; // Limpa classes anteriores
    notificacaoDiv.classList.add(tipo);
    notificacaoDiv.classList.add('show'); // Mostra com transição

    clearTimeout(notificationTimeout);

    if (duracaoMs > 0) {
        notificationTimeout = setTimeout(() => {
            notificacaoDiv.classList.remove('show');
        }, duracaoMs);
    }
}

/**
 * Verifica e exibe notificações para agendamentos de manutenção próximos (ex: próximas 48h).
 * @returns {void}
 */
function verificarAgendamentosProximos() {
    const agora = new Date();
    const limite = new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000); // Próximos 2 dias
    let lembretes = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.data instanceof Date && !isNaN(manutencao.data.getTime()) &&
                manutencao.data > agora && manutencao.data < limite)
            {
                const dataManutencao = manutencao.data;
                let quando = '';
                const hora = dataManutencao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const hojeStr = agora.toDateString();
                const amanha = new Date(agora);
                amanha.setDate(agora.getDate() + 1);
                const amanhaStr = amanha.toDateString();
                const dataManutencaoStr = dataManutencao.toDateString();

                if (dataManutencaoStr === hojeStr) quando = `HOJE às ${hora}`;
                else if (dataManutencaoStr === amanhaStr) quando = `AMANHÃ às ${hora}`;
                else quando = `em ${dataManutencao.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} às ${hora}`;

                lembretes.push(`🔔 LEMBRETE: ${manutencao.tipo} (${veiculo.modelo}) ${quando}.`);
            }
        });
    });

    if (lembretes.length > 0) {
        // Exibe os lembretes (talvez um de cada vez ou concatenados)
        exibirNotificacao(lembretes.join('\n'), 'warning', 10000); // 10 segundos
    }
}


// --- Inicialização da Aplicação ---

/**
 * Função de inicialização executada quando o DOM está pronto.
 * Configura Flatpickr, carrega a garagem e adiciona event listeners principais.
 * @returns {void}
 */
function init() {
    // Configura Flatpickr (se existir globalmente)
    if (typeof flatpickr !== 'undefined' && flatpickr.l10ns && flatpickr.l10ns.pt) {
        flatpickr.localize(flatpickr.l10ns.pt);
    } else {
         console.warn("Flatpickr ou localização 'pt' não encontrados.");
    }

    // Adiciona Listeners
    if (formAdicionarVeiculo) formAdicionarVeiculo.addEventListener('submit', handleAdicionarVeiculoSubmit);
    if (tipoVeiculoSelect) tipoVeiculoSelect.addEventListener('change', handleTipoVeiculoChange);
    if (formManutencao) formManutencao.addEventListener('submit', handleManutencaoSubmit);

    // Listener para fechar modal clicando fora ou com ESC
    window.addEventListener('click', (event) => {
        if (modal && event.target == modal) {
            fecharModal();
        }
    });
    window.addEventListener('keydown', (event) => {
        if (modal && event.key === 'Escape' && modal.style.display === 'block') {
            fecharModal();
        }
    });
     // Listener para o botão de fechar do modal (caso ele exista - adicione se necessário)
     const closeButton = modal?.querySelector('.close-button');
     if (closeButton) closeButton.addEventListener('click', fecharModal);


    // Carrega dados e renderiza UI inicial
    carregarGaragem();

    // Configura estado inicial do campo de capacidade (caso recarregue com Caminhao selecionado)
    if (tipoVeiculoSelect && tipoVeiculoSelect.value === 'Caminhao') {
       if (campoCapacidadeDiv) campoCapacidadeDiv.style.display = 'block';
       if (capacidadeInput) capacidadeInput.required = true;
    } else {
        if (campoCapacidadeDiv) campoCapacidadeDiv.style.display = 'none';
        if (capacidadeInput) capacidadeInput.required = false;
    }


    console.log("Garagem Inteligente (main.js) inicializada.");
}

// Expor funções necessárias globalmente para `onclick` no HTML
// É melhor evitar `onclick` direto no HTML com módulos, mas para manter a estrutura:
window.app = {
    abrirModalDetalhes,
    fecharModal,
    executarAcaoVeiculo,
    removerVeiculo,
    removerManutencao,
    // Exportar outras funções que podem ser necessárias globalmente
    exibirNotificacao,
    atualizarInfoVeiculoNoModal,
    salvarGaragem
};

// Garante que as funções expostas em Veiculo.js etc., que dependem destas,
// também sejam acessíveis (elas podem chamar window.app.exibirNotificacao, etc.)

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// --- Fim de js/main.js ---