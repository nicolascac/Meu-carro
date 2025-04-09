// --- Classe Manutencao ---
class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        // Armazena a data como objeto Date internamente
        this.data = data instanceof Date ? data : new Date(data);
        // Garante que mesmo uma data inválida seja armazenada como Invalid Date
        if (isNaN(this.data.getTime())) {
            console.warn("Data fornecida resultou em data inválida:", data);
            // this.data = null; // Ou mantém como Invalid Date
        }
        this.tipo = tipo.trim();
        this.custo = parseFloat(custo) || 0; // Garante que custo seja número, 0 se inválido
        this.descricao = descricao.trim();
        // ID único mais robusto
        this.id = `man-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    }

    validar() {
        const erros = [];
        // Verifica se a data é um objeto Date válido
        if (!(this.data instanceof Date) || isNaN(this.data.getTime())) {
            erros.push("Data inválida.");
        }
        if (!this.tipo) { // Verifica se tipo não é vazio após trim
            erros.push("Tipo de serviço é obrigatório.");
        }
        // Custo pode ser zero (ex: serviço na garantia), mas não negativo
        if (this.custo < 0) {
            erros.push("Custo não pode ser negativo.");
        }
        return erros; // Retorna array de erros (vazio se válido)
    }

    formatar(incluirVeiculo = false, nomeVeiculo = '') {
        let dataFormatada = "Data inválida";
        if (this.data instanceof Date && !isNaN(this.data.getTime())) {
             dataFormatada = this.data.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let str = `<strong>${this.tipo}</strong> em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            str += ` <em>(${this.descricao})</em>`;
        }
         if (incluirVeiculo && nomeVeiculo) {
            str += ` - [Veículo: ${nomeVeiculo}]`;
        }
        return str;
    }

    // Método para serialização em JSON (salva data como ISO string)
    toJSON() {
        return {
            // Salva a data como string ISO 8601 se for válida, senão null
            data: (this.data instanceof Date && !isNaN(this.data.getTime())) ? this.data.toISOString() : null,
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao,
            id: this.id // Inclui o ID na serialização
        };
    }
}

// --- Classes de Veículos (Modificadas e Melhoradas) ---
class Veiculo {
    constructor(modelo, cor, id = null, tipoVeiculo = 'Veiculo') {
        this.id = id || `veh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        this.historicoManutencao = []; // Array para objetos Manutencao
        this.tipoVeiculo = tipoVeiculo; // Essencial para reidratação
    }

    ligar() {
        if (this.ligado) {
            exibirNotificacao(`${this.modelo} já está ligado.`, 'warning');
            return;
        }
        this.ligado = true;
        exibirNotificacao(`${this.modelo} ligado.`, 'info');
        atualizarInfoVeiculoNoModal(this.id); // Atualiza modal se aberto para este veículo
        salvarGaragem(); // Persiste a mudança de estado
    }

    desligar() {
        if (!this.ligado) {
            exibirNotificacao(`${this.modelo} já está desligado.`, 'warning');
            return;
        }
        this.ligado = false;
        this.velocidade = 0; // Resetar velocidade ao desligar
        exibirNotificacao(`${this.modelo} desligado.`, 'info');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem();
    }

    acelerar(incremento = 10) { // Valor padrão para incremento
        if (!this.ligado) {
            exibirNotificacao(`${this.modelo} não pode acelerar, está desligado.`, 'error');
            return; // Importante retornar para não continuar
        }
        this.velocidade += incremento;
         // Limitar velocidade máxima (opcional)
         // const VELOCIDADE_MAXIMA = 180;
         // if (this.velocidade > VELOCIDADE_MAXIMA) this.velocidade = VELOCIDADE_MAXIMA;

        exibirNotificacao(`${this.modelo} acelerou para ${this.velocidade} km/h.`, 'info');
        atualizarInfoVeiculoNoModal(this.id);
        // Opcional: salvarGaragem(); // Evitar salvar em ações muito frequentes
    }

    buzinar() {
        exibirNotificacao(`${this.modelo} buzinou: 📣 Beep beep!`, 'info');
    }

    // Método genérico para exibir informações básicas em HTML
    getInfoBasicaHTML() {
        return `
            <p><strong>ID:</strong> ${this.id}</p>
            <p><strong>Tipo:</strong> ${this.tipoVeiculo}</p>
            <p><strong>Modelo:</strong> ${this.modelo}</p>
            <p><strong>Cor:</strong> ${this.cor}</p>
            <p><strong>Ligado:</strong> <span class="${this.ligado ? 'status-on' : 'status-off'}">${this.ligado ? 'Sim' : 'Não'}</span></p>
            <p><strong>Velocidade:</strong> ${this.velocidade} km/h</p>
        `;
        // Adicionar classes CSS 'status-on' e 'status-off' para estilizar
    }

    // Método a ser sobrescrito pelas classes filhas para infos específicas
    getInfoEspecificaHTML() {
        return ''; // Vazio por padrão
    }

    // Combina informações básicas e específicas para exibição completa no modal
    exibirInformacoesCompletaHTML() {
        return this.getInfoBasicaHTML() + this.getInfoEspecificaHTML();
    }

    // Adiciona um objeto Manutencao ao histórico
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Objeto inválido passado para adicionarManutencao:", manutencao);
            exibirNotificacao("Erro interno: Tentativa de adicionar manutenção inválida.", 'error');
            return false; // Falha
        }

        const erros = manutencao.validar();
        if (erros.length > 0) {
            exibirNotificacao(`Erro ao adicionar/agendar: ${erros.join(' ')}`, 'error');
            return false; // Falha devido a dados inválidos
        }

        this.historicoManutencao.push(manutencao);
        // Ordena sempre por data (mais recente primeiro, ou mais antiga - decida a ordem)
        this.historicoManutencao.sort((a, b) => b.data - a.data); // Mais recente primeiro
        // this.historicoManutencao.sort((a, b) => a.data - b.data); // Mais antiga primeiro

        const acao = manutencao.data > new Date() ? 'agendada' : 'registrada';
        exibirNotificacao(`Manutenção (${manutencao.tipo}) ${acao} para ${this.modelo}.`, 'success');
        salvarGaragem(); // Salva o estado atualizado da garagem
        return true; // Sucesso
    }

     // Remove uma manutenção pelo ID
     removerManutencaoPorId(manutencaoId) {
        const tamanhoAntes = this.historicoManutencao.length;
        this.historicoManutencao = this.historicoManutencao.filter(m => m.id !== manutencaoId);
        const removido = this.historicoManutencao.length < tamanhoAntes;
        if (removido) {
            salvarGaragem(); // Salva após remover
        }
        return removido; // Retorna true se removeu, false caso contrário
    }


    // Retorna o histórico formatado (array de objetos {id, html})
    getHistoricoHTML() {
        if (this.historicoManutencao.length === 0) {
            return '<p>Nenhum registro de manutenção.</p>';
        }

        const agora = new Date();
        let html = '';

        // Ordenado por data (a ordem depende do sort em adicionarManutencao)
        // Separar por Passado e Futuro para clareza
        const passadas = this.historicoManutencao.filter(m => m.data <= agora);
        const futuras = this.historicoManutencao.filter(m => m.data > agora);

        if (passadas.length > 0) {
            html += '<h4>Histórico Passado</h4>';
            passadas.forEach(m => {
                html += `<div class="maintenance-item" data-id="${m.id}">
                           <span>${m.formatar()}</span>
                           <button class="small-warning" onclick="removerManutencao('${this.id}', '${m.id}')" title="Remover este registro">Remover</button>
                         </div>`;
            });
        }

        if (futuras.length > 0) {
            html += '<h4>Agendamentos Futuros</h4>';
            futuras.forEach(m => {
                 html += `<div class="schedule-item" data-id="${m.id}">
                            <span>${m.formatar()}</span>
                            <button class="small-warning" onclick="removerManutencao('${this.id}', '${m.id}')" title="Cancelar este agendamento">Cancelar</button>
                          </div>`;
            });
        }

         if (!html) { // Caso só tenha manutenções com data inválida (raro)
             return '<p>Nenhum registro de manutenção válido encontrado.</p>';
         }

        return html;
    }

    // Método estático para reidratação a partir de JSON genérico
    static fromJSON(json) {
        if (!json || !json.tipoVeiculo) {
            console.error("Tentativa de reidratar veículo a partir de JSON inválido:", json);
            return null; // Retorna null se o JSON for inválido
        }

        let veiculo;
        try {
            // Cria a instância da classe correta
            switch (json.tipoVeiculo) {
                case 'Carro':
                    veiculo = new Carro(json.modelo, json.cor, json.id);
                    break;
                case 'CarroEsportivo':
                    veiculo = new CarroEsportivo(json.modelo, json.cor, json.turbo, json.id);
                    break;
                case 'Caminhao':
                    veiculo = new Caminhao(json.modelo, json.cor, json.capacidadeCarga, json.cargaAtual, json.id);
                    // Carga atual pode precisar de fallback se não existir no JSON antigo
                    veiculo.cargaAtual = json.cargaAtual || 0;
                    break;
                default:
                    console.warn(`Tipo de veículo desconhecido no JSON: ${json.tipoVeiculo}. Criando como Veiculo base.`);
                    // Cria como Veiculo base, mas mantém o tipo original para evitar perda de dados
                    veiculo = new Veiculo(json.modelo, json.cor, json.id, json.tipoVeiculo);
            }

            // Restaura propriedades comuns
            veiculo.ligado = json.ligado || false;
            veiculo.velocidade = json.velocidade || 0;

            // Reidrata o histórico de manutenção
            if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
                veiculo.historicoManutencao = json.historicoManutencao.map(mJson => {
                    if (!mJson || !mJson.data || !mJson.tipo) { // Validação básica do objeto manutenção
                        console.warn("Registro de manutenção inválido encontrado no JSON:", mJson);
                        return null; // Ignora registros inválidos
                    }
                    // Cria nova instância de Manutencao a partir do JSON
                    const manutencao = new Manutencao(mJson.data, mJson.tipo, mJson.custo, mJson.descricao);
                     // Restaura o ID original da manutenção, se existir
                     if (mJson.id) {
                         manutencao.id = mJson.id;
                     }
                     // Verifica se a data foi carregada corretamente
                     if (isNaN(manutencao.data.getTime())) {
                         console.warn(`Manutenção ${manutencao.id || mJson.tipo} carregada com data inválida.`);
                         // Poderia optar por descartar aqui (return null) ou manter
                     }
                    return manutencao;
                }).filter(m => m !== null); // Remove os nulos (inválidos)

                // Reordena após carregar
                veiculo.historicoManutencao.sort((a, b) => b.data - a.data); // Mais recente primeiro
            } else {
                veiculo.historicoManutencao = []; // Garante que seja um array vazio
            }

            return veiculo;

        } catch (error) {
            console.error(`Erro ao reidratar veículo ${json.id || '(sem id)'} do tipo ${json.tipoVeiculo}:`, error);
            // Em caso de erro na reidratação, retorna null para evitar quebrar a aplicação
            return null;
        }
    }

    // Método para serialização em JSON (garante que tipoVeiculo seja salvo)
    toJSON() {
        return {
            id: this.id,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            velocidade: this.velocidade,
            // Mapeia cada manutenção usando seu próprio toJSON
            historicoManutencao: this.historicoManutencao.map(m => m.toJSON()),
            tipoVeiculo: this.tipoVeiculo // Essencial para fromJSON funcionar
        };
    }
}

// Classe Carro (Herda de Veiculo)
class Carro extends Veiculo {
    constructor(modelo, cor, id = null) {
        super(modelo, cor, id, 'Carro'); // Passa o tipoVeiculo específico
    }
    // Não precisa sobrescrever getInfoEspecificaHTML se não houver info extra
    // O toJSON da classe pai é suficiente se não houver props extras
}

// Classe CarroEsportivo (Herda de Veiculo)
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor, turbo = false, id = null) {
        super(modelo, cor, id, 'CarroEsportivo');
        this.turbo = turbo;
    }

    ativarTurbo() {
        if (this.turbo) {
            exibirNotificacao('Turbo já está ativado!', 'warning');
            return;
        }
         if (!this.ligado) {
             exibirNotificacao('Ligue o carro esportivo antes de ativar o turbo!', 'error');
             return;
         }
        this.turbo = true;
        exibirNotificacao('🚀 Turbo ativado!', 'success');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem(); // Persiste mudança
    }

    desativarTurbo() {
        if (!this.turbo) {
            exibirNotificacao('Turbo já está desativado!', 'warning');
            return;
        }
        this.turbo = false;
        exibirNotificacao('Turbo desativado.', 'info');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem(); // Persiste mudança
    }

    // Sobrescreve para adicionar info do turbo
    getInfoEspecificaHTML() {
        return `<p><strong>Turbo:</strong> <span class="status-${this.turbo ? 'on' : 'off'}">${this.turbo ? 'Ativado' : 'Desativado'}</span></p>`;
    }

    // Sobrescreve toJSON para incluir a propriedade 'turbo'
    toJSON() {
        const json = super.toJSON(); // Pega o JSON da classe pai
        json.turbo = this.turbo;    // Adiciona a propriedade específica
        return json;
    }
}

// Classe Caminhao (Herda de Veiculo)
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga, cargaAtual = 0, id = null) {
        super(modelo, cor, id, 'Caminhao');
        // Garante que capacidade e carga sejam números não negativos
        this.capacidadeCarga = Math.max(0, parseFloat(capacidadeCarga) || 0);
        this.cargaAtual = Math.max(0, parseFloat(cargaAtual) || 0);
    }

    // Valida o peso a ser carregado/descarregado
    _validarPeso(peso) {
         const pesoNumerico = parseFloat(peso);
         if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
             exibirNotificacao('Peso inválido. Insira um número positivo.', 'error');
             return null; // Retorna null se inválido
         }
         return pesoNumerico;
    }

    carregar(peso) {
        const pesoNumerico = this._validarPeso(peso);
        if (pesoNumerico === null) return; // Sai se peso inválido

        if (this.cargaAtual + pesoNumerico <= this.capacidadeCarga) {
            this.cargaAtual += pesoNumerico;
            exibirNotificacao(`Caminhão carregado com ${pesoNumerico.toLocaleString('pt-BR')} kg. Carga atual: ${this.cargaAtual.toLocaleString('pt-BR')} kg.`, 'success');
            atualizarInfoVeiculoNoModal(this.id);
            salvarGaragem(); // Persiste mudança
        } else {
            const espacoLivre = this.capacidadeCarga - this.cargaAtual;
            exibirNotificacao(`Carga (${pesoNumerico.toLocaleString('pt-BR')}kg) excede a capacidade! Espaço livre: ${espacoLivre.toLocaleString('pt-BR')}kg.`, 'error');
        }
    }

    descarregar(peso) {
        const pesoNumerico = this._validarPeso(peso);
         if (pesoNumerico === null) return; // Sai se peso inválido

        if (this.cargaAtual >= pesoNumerico) {
            this.cargaAtual -= pesoNumerico;
            exibirNotificacao(`Caminhão descarregado em ${pesoNumerico.toLocaleString('pt-BR')} kg. Carga atual: ${this.cargaAtual.toLocaleString('pt-BR')} kg.`, 'success');
            atualizarInfoVeiculoNoModal(this.id);
            salvarGaragem(); // Persiste mudança
        } else {
            exibirNotificacao(`Não é possível descarregar ${pesoNumerico.toLocaleString('pt-BR')}kg. Carga atual é ${this.cargaAtual.toLocaleString('pt-BR')}kg.`, 'error');
        }
    }

    // Sobrescreve para adicionar info da carga
    getInfoEspecificaHTML() {
        const percentualCarga = this.capacidadeCarga > 0 ? (this.cargaAtual / this.capacidadeCarga) * 100 : 0;
        return `
            <p><strong>Capacidade:</strong> ${this.capacidadeCarga.toLocaleString('pt-BR')} kg</p>
            <p><strong>Carga Atual:</strong> ${this.cargaAtual.toLocaleString('pt-BR')} kg (${percentualCarga.toFixed(1)}%)</p>
            <!-- Opcional: Barra de progresso da carga -->
            <progress value="${this.cargaAtual}" max="${this.capacidadeCarga}" style="width: 100%; height: 15px;"></progress>
        `;
    }

    // Sobrescreve toJSON para incluir propriedades do caminhão
    toJSON() {
        const json = super.toJSON();
        json.capacidadeCarga = this.capacidadeCarga;
        json.cargaAtual = this.cargaAtual;
        return json;
    }
}

// --- Gerenciamento da Garagem e LocalStorage ---
let garagem = []; // Array para armazenar as instâncias dos veículos
const STORAGE_KEY = 'minhaGaragemInteligente_v2'; // Mudar a chave se a estrutura de dados mudar significativamente

function salvarGaragem() {
    try {
        // Usa o método toJSON de cada veículo para garantir a serialização correta
        const garagemJSON = JSON.stringify(garagem.map(v => v.toJSON()));
        localStorage.setItem(STORAGE_KEY, garagemJSON);
        // console.log("Garagem salva:", garagemJSON); // Log para debug (pode ser extenso)
    } catch (error) {
        console.error("Erro crítico ao salvar garagem no LocalStorage:", error);
        // Tenta notificar o usuário sobre o problema
        exibirNotificacao("ERRO GRAVE: Não foi possível salvar os dados da garagem. Alterações recentes podem ser perdidas ao fechar.", 'error', 0); // 0 = não esconder automaticamente
    }
}

function carregarGaragem() {
    try {
        const garagemJSON = localStorage.getItem(STORAGE_KEY);
        if (garagemJSON) {
            const garagemGenerica = JSON.parse(garagemJSON);
            // Reidrata os objetos: transforma JSON genérico em instâncias de classes
            garagem = garagemGenerica.map(veiculoJSON => Veiculo.fromJSON(veiculoJSON))
                                    .filter(v => v !== null); // Filtra veículos que falharam na reidratação

            // console.log(`Garagem carregada: ${garagem.length} veículos.`); // Log para debug
             if (garagem.length !== garagemGenerica.length) {
                console.warn("Alguns veículos não puderam ser carregados corretamente do LocalStorage.");
                exibirNotificacao("Aviso: Alguns dados de veículos podem não ter sido carregados corretamente.", 'warning');
             }
        } else {
            garagem = []; // Inicia vazia se não houver nada salvo
            // console.log("Nenhuma garagem salva encontrada. Iniciando vazia.");
        }
    } catch (error) {
        console.error("Erro ao carregar ou parsear garagem do LocalStorage:", error);
        exibirNotificacao("Erro ao carregar dados da garagem. Verifique o console para detalhes. Iniciando com garagem vazia.", 'error');
        garagem = []; // Reseta em caso de erro grave de parse para evitar mais problemas
        // Opcional: tentar limpar o localStorage corrompido
        // localStorage.removeItem(STORAGE_KEY);
    }
    // Atualiza a UI após carregar/falhar
    renderizarGaragem();
    renderizarAgendamentosFuturos();
    verificarAgendamentosProximos(); // Verifica lembretes ao iniciar
}

// --- Funções de Renderização da UI ---

function renderizarGaragem() {
    const listaVeiculosDiv = document.getElementById('listaVeiculos');
    listaVeiculosDiv.innerHTML = ''; // Limpa a lista atual

    if (garagem.length === 0) {
        listaVeiculosDiv.innerHTML = '<p style="text-align: center; color: #777;">Sua garagem está vazia. Adicione um veículo acima!</p>';
        return;
    }

    // Ordena a garagem (ex: por modelo) antes de renderizar - opcional
    garagem.sort((a, b) => a.modelo.localeCompare(b.modelo));

    garagem.forEach(veiculo => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('vehicle-item');
        itemDiv.setAttribute('data-id', veiculo.id); // Adiciona ID para referência futura
        itemDiv.innerHTML = `
            <span><strong style="color: #2980b9;">${veiculo.modelo}</strong> (${veiculo.tipoVeiculo}) - Cor: ${veiculo.cor}</span>
            <div class="actions">
                <button onclick="abrirModalDetalhes('${veiculo.id}')" title="Ver detalhes, histórico e agendar manutenção">Detalhes / Manutenção</button>
                <button class="warning" onclick="removerVeiculo('${veiculo.id}')" title="Remover veículo permanentemente">Remover</button>
            </div>
        `;
        listaVeiculosDiv.appendChild(itemDiv);
    });
}

function renderizarHistoricoManutencaoModal(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    const historicoDiv = document.getElementById('modalHistoricoManutencao');

    if (!veiculo) {
        console.error("Veículo não encontrado para renderizar histórico:", veiculoId);
        historicoDiv.innerHTML = '<p>Erro: Veículo não encontrado.</p>';
        return;
    }

    historicoDiv.innerHTML = veiculo.getHistoricoHTML(); // Usa o método da classe
}

function renderizarAgendamentosFuturos() {
    const listaAgendamentosDiv = document.getElementById('listaAgendamentosFuturos');
    listaAgendamentosDiv.innerHTML = '';
    const agora = new Date();
    let agendamentos = [];

    // Coleta todos os agendamentos futuros de todos os veículos
    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            // Verifica se a data é válida e futura
            if (manutencao.data instanceof Date && !isNaN(manutencao.data.getTime()) && manutencao.data > agora) {
                agendamentos.push({ veiculo: veiculo, manutencao: manutencao });
            }
        });
    });

    // Ordena por data (mais próximo primeiro)
    agendamentos.sort((a, b) => a.manutencao.data - b.manutencao.data);

    if (agendamentos.length === 0) {
        listaAgendamentosDiv.innerHTML = '<p style="text-align: center; color: #777;">Nenhum agendamento futuro.</p>';
        return;
    }

    agendamentos.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('schedule-item');
         itemDiv.setAttribute('data-id', item.manutencao.id);
        // Formata a manutenção incluindo o nome do veículo
        itemDiv.innerHTML = `
            <span>${item.manutencao.formatar(true, `${item.veiculo.modelo} (${item.veiculo.cor})`)}</span>
            <button class="small-warning" onclick="removerManutencao('${item.veiculo.id}', '${item.manutencao.id}')" title="Cancelar este agendamento">Cancelar</button>
       `;
        listaAgendamentosDiv.appendChild(itemDiv);
    });
}

// --- Funções do Modal e Ações do Veículo ---

const modal = document.getElementById('modalDetalhesVeiculo');
const modalContent = modal.querySelector('.modal-content'); // Para animação de fechar

function abrirModalDetalhes(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
        exibirNotificacao("Erro: Veículo não encontrado.", "error");
        return;
    }

    document.getElementById('modalTituloVeiculo').textContent = `Detalhes: ${veiculo.modelo} (${veiculo.cor})`;
    document.getElementById('manutencaoVeiculoId').value = veiculoId; // Associa formulário ao veículo

    atualizarInfoVeiculoNoModal(veiculoId); // Popula infos e botões de ação
    renderizarHistoricoManutencaoModal(veiculoId); // Popula histórico e agendamentos do veículo

    // Limpa e configura formulário de manutenção
    const formManutencao = document.getElementById('formManutencao');
    formManutencao.reset();
    // Configura o datepicker para o campo de data
    flatpickr("#manutencaoData", {
        enableTime: true,
        dateFormat: "Y-m-d H:i", // Formato ISO compatível com new Date()
        minDate: "today", // Impede agendar no passado (opcional)
        locale: "pt" // Usa localização em português (requer script de localização)
    });

    modal.style.display = 'block';
    // Adiciona classe para animação de entrada (se houver)
    modalContent.classList.add('animate-in'); // Crie a animação CSS correspondente
}

function fecharModal() {
    // Adiciona classe para animação de saída (opcional)
    modalContent.classList.add('animate-out');

    // Espera a animação terminar antes de esconder o modal
    // setTimeout(() => {
        modal.style.display = 'none';
        modalContent.classList.remove('animate-in', 'animate-out'); // Limpa classes de animação
    // }, 300); // Tempo deve corresponder à duração da animação CSS 'animate-out'
}

// Fecha o modal se clicar fora do conteúdo (no fundo escuro)
window.onclick = function(event) {
    if (event.target == modal) {
        fecharModal();
    }
}
// Fecha o modal ao pressionar a tecla ESC
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        fecharModal();
    }
});

function atualizarInfoVeiculoNoModal(veiculoId) {
    // Só atualiza se o modal estiver visível e for o veículo correto
    if (modal.style.display !== 'block' || document.getElementById('manutencaoVeiculoId').value !== veiculoId) {
        return;
    }

    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) return; // Segurança extra

    const infoDiv = document.getElementById('modalInfoVeiculo');
    const acoesDiv = document.getElementById('modalAcoesVeiculo');

    infoDiv.innerHTML = veiculo.exibirInformacoesCompletaHTML(); // Usa o método da classe
    acoesDiv.innerHTML = ''; // Limpa ações anteriores para reconstruir

    // Botões de Ação Comuns
    if (!veiculo.ligado) {
        acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'ligar')" title="Ligar o motor"><span role="img" aria-label="Chave">🔑</span> Ligar</button>`;
    } else {
        acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'desligar')" title="Desligar o motor"><span role="img" aria-label="Botão Power Off">🔌</span> Desligar</button>`;
        acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'acelerar', 10)" title="Aumentar velocidade em 10 km/h"><span role="img" aria-label="Pedal">💨</span> Acelerar (+10)</button>`;
    }
    acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'buzinar')" title="Tocar a buzina"><span role="img" aria-label="Megafone">📣</span> Buzinar</button>`;

    // Botões de Ação Específicos por Tipo
    if (veiculo instanceof CarroEsportivo) {
        if (!veiculo.turbo) {
            acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'ativarTurbo')" title="Ativar o turbo (requer motor ligado)"><span role="img" aria-label="Foguete">🚀</span> Ativar Turbo</button>`;
        } else {
            acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'desativarTurbo')" title="Desativar o turbo"><span role="img" aria-label="Caracol">🐌</span> Desativar Turbo</button>`;
        }
    } else if (veiculo instanceof Caminhao) {
        // Cria um container flex para os controles de carga
        const cargaContainer = document.createElement('div');
        cargaContainer.style.display = 'flex';
        cargaContainer.style.alignItems = 'center';
        cargaContainer.style.marginTop = '10px'; // Espaçamento
        cargaContainer.innerHTML = `
            <input type="number" id="pesoCargaModal_${veiculo.id}" placeholder="Peso (kg)" min="1" style="width: 120px; margin-right: 5px; padding: 8px;" title="Digite o peso para carregar ou descarregar">
            <button onclick="executarAcaoVeiculo('${veiculo.id}', 'carregar')" title="Adicionar carga ao caminhão"><span role="img" aria-label="Seta para cima">⬆️</span> Carregar</button>
            <button onclick="executarAcaoVeiculo('${veiculo.id}', 'descarregar')" title="Remover carga do caminhão"><span role="img" aria-label="Seta para baixo">⬇️</span> Descarregar</button>
        `;
         acoesDiv.appendChild(cargaContainer);
    }
}

// Função genérica para chamar métodos do veículo a partir da UI
function executarAcaoVeiculo(veiculoId, acao, param = null) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro interno: Veículo não encontrado para executar ação.", "error");
         return;
     }

    // Tratamento especial para carregar/descarregar caminhão para pegar o valor do input
    if ((acao === 'carregar' || acao === 'descarregar') && veiculo instanceof Caminhao) {
        const inputPeso = document.getElementById(`pesoCargaModal_${veiculo.id}`);
        if (!inputPeso) {
            console.error("Input de peso não encontrado no modal para caminhão.");
            return;
        }
        param = inputPeso.value; // Pega o valor atual do input
        // A validação do peso é feita dentro dos métodos carregar/descarregar agora
        // if (!param) { // Verifica se o campo está vazio
        //     exibirNotificacao("Por favor, insira um peso para carregar/descarregar.", "warning");
        //     inputPeso.focus(); // Foca no campo
        //     return;
        // }
         inputPeso.value = ''; // Limpa o campo após usar (ou não, dependendo da preferência)
    }

    // Verifica se o método existe no objeto veículo
    if (typeof veiculo[acao] === 'function') {
        try {
            veiculo[acao](param); // Chama o método correspondente (passando param mesmo que seja null)
            // Os métodos das classes (ligar, desligar, carregar, etc.) já devem:
            // 1. Fazer suas validações internas.
            // 2. Chamar exibirNotificacao com feedback.
            // 3. Chamar atualizarInfoVeiculoNoModal(this.id).
            // 4. Chamar salvarGaragem().
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

// Formulário Adicionar Veículo
const formAdicionarVeiculo = document.getElementById('formAdicionarVeiculo');
formAdicionarVeiculo.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede recarregamento da página

    const tipo = document.getElementById('tipoVeiculo').value;
    const modelo = document.getElementById('modeloVeiculo').value;
    const cor = document.getElementById('corVeiculo').value;

    // Validação básica dos campos comuns
    if (!tipo || !modelo.trim() || !cor.trim()) {
         exibirNotificacao("Por favor, preencha tipo, modelo e cor do veículo.", 'warning');
         return;
    }

    let novoVeiculo;
    try {
        switch (tipo) {
            case 'Carro':
                novoVeiculo = new Carro(modelo, cor);
                break;
            case 'CarroEsportivo':
                novoVeiculo = new CarroEsportivo(modelo, cor);
                break;
            case 'Caminhao':
                const capacidadeInput = document.getElementById('capacidadeCargaVeiculo');
                const capacidade = capacidadeInput.value;
                // Validação específica para caminhão
                if (!capacidade || isNaN(parseFloat(capacidade)) || parseFloat(capacidade) < 0) {
                    exibirNotificacao("Capacidade de carga inválida para o caminhão.", 'error');
                    capacidadeInput.focus(); // Foca no campo problemático
                    return; // Interrompe a criação
                }
                novoVeiculo = new Caminhao(modelo, cor, capacidade);
                break;
            default:
                exibirNotificacao("Tipo de veículo selecionado é inválido.", 'error');
                return; // Sai da função
        }

        garagem.push(novoVeiculo);
        salvarGaragem();
        renderizarGaragem(); // Atualiza a lista na tela principal
        exibirNotificacao(`Veículo ${modelo} adicionado com sucesso!`, 'success');
        formAdicionarVeiculo.reset(); // Limpa o formulário
        document.getElementById('campoCapacidadeCarga').style.display = 'none'; // Esconde campo do caminhão

    } catch (error) {
        console.error("Erro ao criar ou adicionar veículo:", error);
        exibirNotificacao(`Erro ao adicionar veículo: ${error.message}`, 'error');
    }
});

// Mostra/Esconde campo de capacidade ao mudar tipo de veículo
document.getElementById('tipoVeiculo').addEventListener('change', function() {
    const campoCapacidadeDiv = document.getElementById('campoCapacidadeCarga');
    const capacidadeInput = document.getElementById('capacidadeCargaVeiculo');
    const show = (this.value === 'Caminhao');

    campoCapacidadeDiv.style.display = show ? 'block' : 'none';
    capacidadeInput.required = show; // Torna obrigatório apenas se for caminhão
     if (!show) {
         capacidadeInput.value = ''; // Limpa o valor se não for caminhão
     }
});

// Formulário Adicionar/Agendar Manutenção (dentro do Modal)
const formManutencao = document.getElementById('formManutencao');
formManutencao.addEventListener('submit', function(event) {
    event.preventDefault();

    const veiculoId = document.getElementById('manutencaoVeiculoId').value;
    const dataInput = document.getElementById('manutencaoData');
    const tipoInput = document.getElementById('manutencaoTipo');
    const custoInput = document.getElementById('manutencaoCusto');
    const descricaoInput = document.getElementById('manutencaoDescricao');

    const veiculo = garagem.find(v => v.id === veiculoId);

    if (!veiculo) {
        exibirNotificacao("Erro: Veículo não encontrado para adicionar manutenção.", 'error');
        return;
    }

    // Coleta valores
    const data = dataInput.value;
    const tipo = tipoInput.value;
    const custo = custoInput.value;
    const descricao = descricaoInput.value;

     // Validação básica no formulário (antes de criar o objeto)
     if (!data || !tipo.trim() || custo === '' || parseFloat(custo) < 0) {
         exibirNotificacao("Preencha Data, Tipo e Custo (não negativo) corretamente.", 'warning');
         return;
     }


    try {
        // Cria a instância (a classe Manutencao também valida internamente)
        const novaManutencao = new Manutencao(data, tipo, custo, descricao);

        // Tenta adicionar ao histórico do veículo (método já valida, salva e notifica)
        const adicionadoComSucesso = veiculo.adicionarManutencao(novaManutencao);

        if (adicionadoComSucesso) {
            renderizarHistoricoManutencaoModal(veiculoId); // Atualiza a lista no modal
            renderizarAgendamentosFuturos(); // Atualiza lista geral de agendamentos
            formManutencao.reset(); // Limpa o formulário
            // Fecha o datepicker se estiver aberto (caso use Flatpickr)
            const fpInstance = dataInput._flatpickr;
            if (fpInstance) fpInstance.close();
            verificarAgendamentosProximos(); // Re-verifica lembretes
        }
        // Se não adicionou com sucesso, a notificação de erro já foi exibida por adicionarManutencao

    } catch (error) {
        console.error("Erro ao criar ou adicionar manutenção via formulário:", error);
        exibirNotificacao(`Erro no formulário de manutenção: ${error.message}`, 'error');
    }
});

// Função para remover veículo da garagem
function removerVeiculo(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para remoção.", "error");
         return;
     }

    // Confirmação mais explícita
    if (confirm(`ATENÇÃO!\nTem certeza que deseja remover PERMANENTEMENTE o veículo "${veiculo.modelo} (${veiculo.cor})"?\n\nTodo o histórico de manutenção será perdido.`)) {
        garagem = garagem.filter(v => v.id !== veiculoId); // Remove da lista
        salvarGaragem(); // Persiste a remoção
        renderizarGaragem(); // Atualiza a lista principal
        renderizarAgendamentosFuturos(); // Atualiza caso tivesse agendamentos
        exibirNotificacao(`Veículo ${veiculo.modelo} removido com sucesso.`, 'success');

        // Se o modal estiver aberto para este veículo, feche-o
        if (modal.style.display === 'block' && document.getElementById('manutencaoVeiculoId').value === veiculoId) {
            fecharModal();
        }
    }
}

// Função para remover uma manutenção/agendamento específico (chamada pelos botões)
function removerManutencao(veiculoId, manutencaoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para remover manutenção.", "error");
         return;
     }

     // Encontra a manutenção específica para exibir detalhes na confirmação
     const manutencao = veiculo.historicoManutencao.find(m => m.id === manutencaoId);
     if (!manutencao) {
         exibirNotificacao("Erro: Registro de manutenção não encontrado.", "error");
         return;
     }

    if (confirm(`Tem certeza que deseja remover o registro:\n"${manutencao.tipo}" em ${manutencao.data.toLocaleDateString()}?`)) {
        const removido = veiculo.removerManutencaoPorId(manutencaoId); // Usa o método do veículo

        if (removido) {
            exibirNotificacao('Manutenção/Agendamento removido.', 'success');
             // Atualiza as UIs relevantes
             if (modal.style.display === 'block' && document.getElementById('manutencaoVeiculoId').value === veiculoId) {
                renderizarHistoricoManutencaoModal(veiculoId); // Atualiza no modal se aberto
             }
            renderizarAgendamentosFuturos(); // Atualiza na lista geral
            verificarAgendamentosProximos(); // Re-verifica lembretes
        } else {
            // Isso não deveria acontecer se a manutenção foi encontrada antes do confirm
            exibirNotificacao('Não foi possível remover a manutenção.', 'error');
        }
    }
}

// --- Notificações e Lembretes ---
let notificationTimeout; // Armazena o ID do timeout da notificação

function exibirNotificacao(mensagem, tipo = 'info', duracaoMs = 5000) { // Tipos: 'info', 'success', 'warning', 'error'
    const notificacaoDiv = document.getElementById('notificacoes');
    if (!notificacaoDiv) return; // Sai se o elemento não existir

    notificacaoDiv.textContent = mensagem;
    notificacaoDiv.className = ''; // Limpa classes de tipo anteriores
    notificacaoDiv.classList.add(tipo); // Adiciona a classe do tipo atual
    notificacaoDiv.classList.add('show'); // Adiciona classe para mostrar (ativa transição)

    // Limpa timeout anterior se uma nova notificação chegar rapidamente
    clearTimeout(notificationTimeout);

    // Esconde a notificação após a duração especificada (se > 0)
    if (duracaoMs > 0) {
        notificationTimeout = setTimeout(() => {
            notificacaoDiv.classList.remove('show'); // Remove classe show (ativa transição de saída)
            // Opcional: esconder completamente após a transição CSS
             // setTimeout(() => { notificacaoDiv.style.display = 'none';}, 500); // Ajustar tempo da transição
        }, duracaoMs);
    }
     // Se duracaoMs for 0, a notificação permanecerá visível até a próxima chamada ou reload.
}

function verificarAgendamentosProximos() {
    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(agora.getDate() + 1);
    // Define limite: ex: próximas 48 horas
    const limite = new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 dias

    let lembretes = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
             // Verifica se data é válida, futura e dentro do limite
            if (manutencao.data instanceof Date && !isNaN(manutencao.data.getTime()) &&
                manutencao.data > agora && manutencao.data < limite)
            {
                const dataManutencao = manutencao.data;
                let quando = '';
                const hora = dataManutencao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                 // Compara apenas as datas (ignorando horas)
                 const hojeStr = agora.toDateString();
                 const amanhaStr = amanha.toDateString();
                 const dataManutencaoStr = dataManutencao.toDateString();

                if (dataManutencaoStr === hojeStr) {
                    quando = `HOJE às ${hora}`;
                } else if (dataManutencaoStr === amanhaStr) {
                    quando = `AMANHÃ às ${hora}`;
                } else {
                     // Para dias além de amanhã, mostra dia da semana/data
                     quando = `em ${dataManutencao.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })} às ${hora}`;
                 }

                lembretes.push(`🔔 LEMBRETE: ${manutencao.tipo} (${veiculo.modelo}) ${quando}.`);
            }
        });
    });

    // Exibe os lembretes se houver algum
    if (lembretes.length > 0) {
        // Mostra um lembrete por vez ou todos concatenados
        exibirNotificacao(lembretes.join('\n'), 'warning', 10000); // Dura 10 segundos
    }
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se Flatpickr existe antes de configurar localização
    if (typeof flatpickr !== 'undefined' && flatpickr.l10ns && flatpickr.l10ns.pt) {
        flatpickr.localize(flatpickr.l10ns.pt); // Define Português como padrão
    } else {
         console.warn("Flatpickr ou localização 'pt' não encontrados. Datepicker usará inglês.");
    }

    carregarGaragem(); // Carrega os dados e renderiza a UI inicial

    // Configuração inicial do campo de capacidade (caso o formulário seja recarregado com 'Caminhao' selecionado)
    const tipoVeiculoSelect = document.getElementById('tipoVeiculo');
    if (tipoVeiculoSelect.value === 'Caminhao') {
        document.getElementById('campoCapacidadeCarga').style.display = 'block';
        document.getElementById('capacidadeCargaVeiculo').required = true;
    }

    console.log("Garagem Inteligente inicializada.");
});