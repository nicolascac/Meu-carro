// garagem.js - Lógica para o Simulador Simples (MOSTRAR.HTML)

/**
 * Classe base para todos os veículos no simulador simples.
 * Define propriedades e métodos comuns como ligar, desligar, acelerar, buzinar.
 * Diferente da versão avançada, esta não lida com IDs complexos, LocalStorage ou Manutenção.
 */
class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo (ex: "Sedan", "Super Carro").
     * @param {string} cor - A cor do veículo.
     */
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    /**
     * Liga o veículo.
     * Atualiza o estado, exibe mensagem e atualiza a UI.
     * @returns {void}
     */
    ligar() {
        if (this.ligado) {
            this.exibirMensagem(`${this.modelo} já está ligado.`);
            return;
        }
        this.ligado = true;
        this.exibirMensagem(`${this.modelo} ligado.`);
        console.log(`${this.modelo} ligado.`);
        atualizarInformacoes(); // Assume que atualizarInformacoes está no escopo global
    }

    /**
     * Desliga o veículo.
     * Atualiza o estado, zera a velocidade, exibe mensagem e atualiza a UI.
     * @returns {void}
     */
    desligar() {
        if (!this.ligado) {
            this.exibirMensagem(`${this.modelo} já está desligado.`);
            return;
        }
        this.ligado = false;
        this.velocidade = 0;
        this.exibirMensagem(`${this.modelo} desligado.`);
        console.log(`${this.modelo} desligado.`);
        atualizarInformacoes();
    }

    /**
     * Aumenta a velocidade do veículo se ele estiver ligado.
     * @param {number} incremento - O valor a ser adicionado à velocidade.
     * @returns {void}
     */
    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            this.exibirMensagem(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
            atualizarInformacoes();
        } else {
            this.exibirMensagem(`${this.modelo} não pode acelerar. Está desligado.`);
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }

    /**
     * Simula a buzina do veículo.
     * @returns {void}
     */
    buzinar() {
        this.exibirMensagem(`${this.modelo} buzinou: Beep beep!`);
        console.log('Beep beep!');
    }

    /**
     * Gera uma string com informações básicas do veículo.
     * @returns {string} Descrição do estado atual do veículo.
     */
    exibirInformacoes() {
        // Este método não é diretamente usado para renderizar HTML nesta versão,
        // mas poderia ser usado para logging ou debug.
        return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
    }

     /**
      * Exibe uma mensagem na área de feedback da tela ativa no MOSTRAR.HTML.
      * @param {string} mensagem - A mensagem a ser exibida.
      * @param {'info'|'erro'} [tipo='info'] - O tipo de mensagem (para estilização opcional).
      * @returns {void}
      */
     exibirMensagem(mensagem, tipo = 'info') {
        // Tenta encontrar a div de mensagem na tela *ativa*
        const telaAtiva = document.querySelector('.tela.tela-ativa');
        const mensagemDiv = telaAtiva ? telaAtiva.querySelector('.mensagem-feedback') : null;

        if (mensagemDiv) {
            mensagemDiv.textContent = mensagem;
            mensagemDiv.className = 'mensagem-feedback'; // Reseta classes
            if(tipo === 'erro') {
                mensagemDiv.classList.add('erro');
            }
            mensagemDiv.style.display = 'block'; // Garante que esteja visível

            // Opcional: Esconder após um tempo
            // setTimeout(() => { mensagemDiv.style.display = 'none'; }, 4000);
        } else {
            console.warn("Elemento '.mensagem-feedback' não encontrado na tela ativa para exibir:", mensagem);
        }
    }
}

/**
 * Representa um Carro Esportivo, herdando de Veiculo e adicionando a funcionalidade de Turbo.
 */
class CarroEsportivo extends Veiculo {
    /**
     * Cria uma instância de CarroEsportivo.
     * @param {string} modelo - O modelo do carro esportivo.
     * @param {string} cor - A cor do carro esportivo.
     * @param {boolean} [turbo=false] - Estado inicial do turbo.
     */
    constructor(modelo, cor, turbo = false) {
        super(modelo, cor);
        this.turbo = turbo;
    }

    /**
     * Ativa o turbo, se o carro estiver ligado.
     * Atualiza o estado, exibe mensagem e atualiza a UI.
     * @returns {void}
     */
    ativarTurbo() {
        if(!this.ligado){
             this.exibirMensagem('Ligue o carro antes de ativar o turbo!', 'erro');
             return;
        }
        if(this.turbo) {
             this.exibirMensagem('Turbo já está ativado!', 'info');
             return;
        }
        this.turbo = true;
        this.exibirMensagem('🚀 Turbo ativado!');
        console.log('Turbo ativado!');
        atualizarInformacoes();
    }

    /**
     * Desativa o turbo.
     * Atualiza o estado, exibe mensagem e atualiza a UI.
     * @returns {void}
     */
    desativarTurbo() {
         if(!this.turbo) {
             this.exibirMensagem('Turbo já está desativado!', 'info');
             return;
         }
        this.turbo = false;
        this.exibirMensagem('Turbo desativado.');
        console.log('Turbo desativado!');
        atualizarInformacoes();
    }

     /**
     * Sobrescreve acelerar para incluir um bônus de velocidade se o turbo estiver ativo.
     * @param {number} incremento - O valor base do incremento de velocidade.
     * @returns {void}
     */
     acelerar(incremento) {
        if (this.ligado) {
            const bonusTurbo = this.turbo ? incremento * 1.5 : 0; // Ex: Turbo dá +150% de bônus
            this.velocidade += (incremento + bonusTurbo);
            const msgTurbo = this.turbo ? ' (com Turbo!)' : '';
            this.exibirMensagem(`${this.modelo} acelerou para ${this.velocidade.toFixed(0)} km/h${msgTurbo}.`);
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h${msgTurbo}.`);
            atualizarInformacoes();
        } else {
            this.exibirMensagem(`${this.modelo} não pode acelerar. Está desligado.`, 'erro');
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }


    /**
     * Gera uma string com informações básicas e o estado do turbo.
     * @returns {string} Descrição do estado atual do carro esportivo.
     */
    exibirInformacoes() {
        // Não usado diretamente para renderizar HTML aqui.
        return `${super.exibirInformacoes()}, Turbo: ${this.turbo ? 'Ativado' : 'Desativado'}`;
    }
}

/**
 * Representa um Caminhão, herdando de Veiculo e adicionando funcionalidades de carga.
 */
class Caminhao extends Veiculo {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} modelo - O modelo do caminhão.
     * @param {string} cor - A cor do caminhão.
     * @param {number} capacidadeCarga - A capacidade máxima de carga em kg.
     * @param {number} [cargaAtual=0] - A carga atual em kg.
     */
    constructor(modelo, cor, capacidadeCarga, cargaAtual = 0) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = cargaAtual;
    }

    /**
     * Adiciona peso à carga atual, se houver capacidade.
     * @param {number} peso - O peso a ser carregado. Deve ser positivo.
     * @returns {void}
     */
    carregar(peso) {
        if (isNaN(peso) || peso <= 0) {
             this.exibirMensagem('Peso inválido para carregar.', 'erro');
             return;
        }
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            this.exibirMensagem(`Caminhão carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
            console.log(`Caminhão carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
            atualizarInformacoes();
        } else {
            const espaco = this.capacidadeCarga - this.cargaAtual;
            this.exibirMensagem(`Carga (${peso}kg) excede a capacidade! Espaço livre: ${espaco}kg.`, 'erro');
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

    // Poderia ter um método descarregar() também.

    /**
     * Gera uma string com informações básicas e detalhes da carga.
     * @returns {string} Descrição do estado atual do caminhão.
     */
    exibirInformacoes() {
         // Não usado diretamente para renderizar HTML aqui.
        return `${super.exibirInformacoes()}, Capacidade: ${this.capacidadeCarga} kg, Carga: ${this.cargaAtual} kg`;
    }
}

// --- Instâncias Fixas dos Veículos para o Simulador Simples ---
/** Instância única de Carro Comum usada na telaCarro. */
const meuCarro = new Veiculo('Sedan', 'Prata');
/** Instância única de Carro Esportivo usada na telaEsportivo. */
const meuCarroEsportivo = new CarroEsportivo('Super Carro', 'Vermelho');
/** Instância única de Caminhão usada na telaCaminhao. */
const meuCaminhao = new Caminhao('Brutus', 'Azul Metálico', 10000); // Ex: Caminhão 'Brutus' com capacidade 10T

// --- Controle da Interface (Telas) ---

/**
 * Mostra uma tela específica (div) e esconde as outras.
 * Limpa a mensagem de feedback ao trocar de tela.
 * @param {string} telaId - O ID da div da tela a ser exibida (ex: 'telaPrincipal', 'telaCarro').
 * @returns {void}
 */
function mostrarTela(telaId) {
    const todasAsTelas = document.querySelectorAll('.tela');
    todasAsTelas.forEach(tela => {
        tela.classList.remove('tela-ativa');
        tela.style.display = 'none'; // Garante que está escondida
        // Limpa mensagem ao sair da tela
        const msgDiv = tela.querySelector('.mensagem-feedback');
        if(msgDiv) msgDiv.style.display = 'none';
    });

    const telaParaMostrar = document.getElementById(telaId);
    if (telaParaMostrar) {
        telaParaMostrar.style.display = 'block';
        // Adiciona a classe após um pequeno delay para garantir a animação (se houver)
        setTimeout(() => telaParaMostrar.classList.add('tela-ativa'), 10);
    } else {
        console.error(`Tela com ID '${telaId}' não encontrada!`);
    }
}

// --- Atualização das Informações na UI ---

/**
 * Atualiza as informações exibidas na tela do Carro Comum.
 * @returns {void}
 */
function atualizarInfoCarro() {
    const carroInfoDiv = document.getElementById('infoCarro');
    if (carroInfoDiv) {
        carroInfoDiv.innerHTML = `
            <p><strong>Modelo:</strong> ${meuCarro.modelo}</p>
            <p><strong>Cor:</strong> ${meuCarro.cor}</p>
            <p><strong class="${meuCarro.ligado ? 'status-on' : 'status-off'}">Estado:</strong> ${meuCarro.ligado ? 'Ligado' : 'Desligado'}</p>
            <p><strong>Velocidade:</strong> ${meuCarro.velocidade} km/h</p>
        `;
    }
}

/**
 * Atualiza as informações exibidas na tela do Carro Esportivo.
 * @returns {void}
 */
function atualizarInfoEsportivo() {
    const esportivoInfoDiv = document.getElementById('infoEsportivo');
    if (esportivoInfoDiv) {
        esportivoInfoDiv.innerHTML = `
            <p><strong>Modelo:</strong> ${meuCarroEsportivo.modelo}</p>
            <p><strong>Cor:</strong> ${meuCarroEsportivo.cor}</p>
            <p><strong class="${meuCarroEsportivo.ligado ? 'status-on' : 'status-off'}">Estado:</strong> ${meuCarroEsportivo.ligado ? 'Ligado' : 'Não'}</p>
            <p><strong>Velocidade:</strong> ${meuCarroEsportivo.velocidade.toFixed(0)} km/h</p>
            <p><strong class="${meuCarroEsportivo.turbo ? 'status-on' : 'status-off'}">Turbo:</strong> ${meuCarroEsportivo.turbo ? 'Ativado' : 'Desativado'}</p>
        `;
    }
}

/**
 * Atualiza as informações exibidas na tela do Caminhão.
 * @returns {void}
 */
function atualizarInfoCaminhao() {
    const caminhaoInfoDiv = document.getElementById('infoCaminhao');
    if (caminhaoInfoDiv) {
        const percentualCarga = meuCaminhao.capacidadeCarga > 0 ? (meuCaminhao.cargaAtual / meuCaminhao.capacidadeCarga) * 100 : 0;
        caminhaoInfoDiv.innerHTML = `
            <p><strong>Modelo:</strong> ${meuCaminhao.modelo}</p>
            <p><strong>Cor:</strong> ${meuCaminhao.cor}</p>
            <p><strong class="${meuCaminhao.ligado ? 'status-on' : 'status-off'}">Estado:</strong> ${meuCaminhao.ligado ? 'Ligado' : 'Não'}</p>
            <p><strong>Velocidade:</strong> ${meuCaminhao.velocidade} km/h</p>
            <p><strong>Capacidade:</strong> ${meuCaminhao.capacidadeCarga.toLocaleString('pt-BR')} kg</p>
            <p><strong>Carga Atual:</strong> ${meuCaminhao.cargaAtual.toLocaleString('pt-BR')} kg (${percentualCarga.toFixed(1)}%)</p>
            <progress value="${meuCaminhao.cargaAtual}" max="${meuCaminhao.capacidadeCarga}" style="width: 100%; height: 10px;"></progress>
        `;
    }
}

/**
 * Função agregadora para atualizar as informações de todos os veículos
 * (útil após ações que podem afetar múltiplos estados, embora aqui cada tela seja isolada).
 * @returns {void}
 */
function atualizarInformacoes() {
    // Verifica qual tela está ativa para atualizar apenas ela, ou atualiza todas
    // se a lógica permitir estados compartilhados (o que não é o caso aqui).
    const telaAtiva = document.querySelector('.tela.tela-ativa');
    if (!telaAtiva) return;

    switch(telaAtiva.id) {
        case 'telaCarro':
            atualizarInfoCarro();
            break;
        case 'telaEsportivo':
            atualizarInfoEsportivo();
            break;
        case 'telaCaminhao':
            atualizarInfoCaminhao();
            break;
    }
}

// --- Event Listeners ---

/**
 * Adiciona os event listeners aos botões de navegação e ação.
 * Deve ser chamada após o DOM estar completamente carregado.
 * @returns {void}
 */
function adicionarListeners() {
    // Navegação Principal
    document.getElementById('irParaCarro')?.addEventListener('click', () => {
        mostrarTela('telaCarro');
        atualizarInfoCarro();
    });
    document.getElementById('irParaEsportivo')?.addEventListener('click', () => {
        mostrarTela('telaEsportivo');
        atualizarInfoEsportivo();
    });
    document.getElementById('irParaCaminhao')?.addEventListener('click', () => {
        mostrarTela('telaCaminhao');
        atualizarInfoCaminhao();
    });

    // Botões de Voltar
    document.getElementById('voltarParaGaragemCarro')?.addEventListener('click', () => mostrarTela('telaPrincipal'));
    document.getElementById('voltarParaGaragemEsportivo')?.addEventListener('click', () => mostrarTela('telaPrincipal'));
    document.getElementById('voltarParaGaragemCaminhao')?.addEventListener('click', () => mostrarTela('telaPrincipal'));

    // Ações Carro Comum
    document.getElementById('ligarCarro')?.addEventListener('click', () => meuCarro.ligar());
    document.getElementById('desligarCarro')?.addEventListener('click', () => meuCarro.desligar());
    document.getElementById('acelerarCarro')?.addEventListener('click', () => meuCarro.acelerar(10)); // Incremento fixo
    document.getElementById('buzinarCarro')?.addEventListener('click', () => meuCarro.buzinar());

    // Ações Carro Esportivo
    document.getElementById('ligarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.ligar());
    document.getElementById('desligarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.desligar());
    document.getElementById('acelerarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.acelerar(15)); // Incremento maior
    document.getElementById('buzinarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.buzinar());
    document.getElementById('ativarTurbo')?.addEventListener('click', () => meuCarroEsportivo.ativarTurbo());
    document.getElementById('desativarTurbo')?.addEventListener('click', () => meuCarroEsportivo.desativarTurbo());

    // Ações Caminhão
    document.getElementById('ligarCaminhao')?.addEventListener('click', () => meuCaminhao.ligar());
    document.getElementById('desligarCaminhao')?.addEventListener('click', () => meuCaminhao.desligar());
    document.getElementById('acelerarCaminhao')?.addEventListener('click', () => meuCaminhao.acelerar(5)); // Incremento menor
    document.getElementById('buzinarCaminhao')?.addEventListener('click', () => meuCaminhao.buzinar());
    document.getElementById('carregarCaminhao')?.addEventListener('click', () => {
        const pesoInput = document.getElementById('pesoCarga');
        const pesoCarga = pesoInput ? parseInt(pesoInput.value) : NaN;
        if (!isNaN(pesoCarga)) {
            meuCaminhao.carregar(pesoCarga);
            if(pesoInput) pesoInput.value = ''; // Limpa input após carregar
        } else {
            meuCaminhao.exibirMensagem('Por favor, insira um peso válido para carregar.', 'erro');
            if(pesoInput) pesoInput.focus();
        }
    });
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    adicionarListeners(); // Adiciona os listeners quando o DOM está pronto
    mostrarTela('telaPrincipal'); // Garante que a tela principal seja exibida ao carregar
    // Atualiza infos iniciais (opcional, já que as telas começam escondidas)
    // atualizarInfoCarro();
    // atualizarInfoEsportivo();
    // atualizarInfoCaminhao();
    console.log("Simulador Simples (garagem.js) inicializado.");
});