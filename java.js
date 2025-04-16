// java.js - Arquivo JavaScript (nome incorreto) para exemplos standalone
// Contém classes Carro (com turbo) e Caminhao (incompleta).
// Usado por index.html e carroesportivo.html.

/**
 * Representa um carro básico neste exemplo standalone.
 * Inclui funcionalidade de 'turbo' que aumenta a aceleração.
 * @note O nome 'java.js' é inadequado, pois o código é JavaScript.
 */
class Carro {
    /**
     * Cria uma instância de Carro.
     * @param {string} modelo - Modelo do carro.
     * @param {string} cor - Cor do carro.
     */
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0;
        this.ligado = false;
    }

    /**
     * Liga o carro. Atualiza estado e UI (se existir).
     * @returns {void}
     */
    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            exibirMensagem("Carro ligado!"); // Assume exibirMensagem global
            console.log("Carro ligado!");
        } else {
            console.log("O carro já está ligado.");
        }
        atualizarEstadoCarroNaTela(); // Assume atualizarEstadoCarroNaTela global
    }

    /**
     * Desliga o carro. Atualiza estado e UI.
     * @returns {void}
     */
    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            atualizarVelocidadeNaTela(); // Assume atualizarVelocidadeNaTela global
            exibirMensagem("Carro desligado!");
            console.log("Carro desligado!");
        } else {
            console.log("O carro já está desligado.");
        }
        atualizarEstadoCarroNaTela();
    }

    /**
     * Acelera o carro (incremento fixo de 30). Atualiza estado e UI.
     * @returns {void}
     */
    acelerar() {
        if (this.ligado) {
            this.velocidade += 30;
            atualizarVelocidadeNaTela();
            exibirMensagem("Acelerando!");
            console.log("Acelerando! Velocidade: " + this.velocidade + " km/h");
        } else {
            exibirMensagem("O carro precisa estar ligado para acelerar.");
            console.log("O carro precisa estar ligado para acelerar.");
        }
    }

    /**
     * Ativa o "Turbo", aumentando a velocidade (incremento fixo de 50).
     * @returns {void}
     */
    turbo() {
        if (this.ligado) {
            this.velocidade += 50;
            atualizarVelocidadeNaTela();
            exibirMensagem("Turbo ligado!");
            console.log("TURBO! Velocidade: " + this.velocidade + " km/h");
        } else {
            exibirMensagem("O carro precisa estar ligado para usar o turbo.");
            console.log("O carro precisa estar ligado para usar o turbo.");
        }
    }
}

// --- Instância e Funções de UI (para index.html / carroesportivo.html) ---

/** Instância de Carro usada pelos exemplos HTML. */
const meuCarro = new Carro("Exemplo", "Vermelho"); // Modelo e cor genéricos

/**
 * Atualiza o elemento HTML que exibe a velocidade.
 * @returns {void}
 */
function atualizarVelocidadeNaTela() {
    const el = document.getElementById("velocidade");
    if(el) el.textContent = meuCarro.velocidade;
}

/**
 * Atualiza o elemento HTML que exibe o estado (Ligado/Desligado).
 * @returns {void}
 */
function atualizarEstadoCarroNaTela() {
  const estado = meuCarro.ligado ? "Ligado" : "Desligado";
  const el = document.getElementById("estadoCarro"); // ID usado em index.html
  if(el) el.textContent = estado;
  // Nota: carroesportivo.html não tem o span#estadoCarro, mas não causa erro.
}

/**
 * Exibe uma mensagem no elemento #mensagem do HTML.
 * @param {string} mensagem - Texto a ser exibido.
 * @returns {void}
 */
function exibirMensagem(mensagem) {
    // console.log("exibirMensagem chamada com: " + mensagem); // Debug
    const elementoMensagem = document.getElementById("mensagem"); // Usado em ambos HTMLs
    if (elementoMensagem) {
        elementoMensagem.textContent = mensagem;
    } else {
        console.error("Elemento com ID 'mensagem' não encontrado no HTML!");
    }
}

/**
 * Preenche os dados iniciais do carro nos spans do HTML (se existirem).
 * @returns {void}
 */
function inicializarInfoCarroTela() {
    const modeloEl = document.getElementById("modelo"); // Usado em carroesportivo.html
    const corEl = document.getElementById("cor");       // Usado em carroesportivo.html
    const modeloCarroEl = document.getElementById("modeloCarro"); // Usado em index.html
    const corCarroEl = document.getElementById("corCarro");       // Usado em index.html

    if (modeloEl) modeloEl.textContent = meuCarro.modelo;
    if (corEl) corEl.textContent = meuCarro.cor;
    if (modeloCarroEl) modeloCarroEl.textContent = meuCarro.modelo;
    if (corCarroEl) corCarroEl.textContent = meuCarro.cor;

    atualizarVelocidadeNaTela();
    atualizarEstadoCarroNaTela(); // Pode não encontrar o elemento em carroesportivo.html
}


// --- Adicionando eventos aos botões (comuns a index.html e carroesportivo.html) ---
const ligarBotao = document.getElementById("ligar"); // ID 'ligar' em ambos
const desligarBotao = document.getElementById("desligar"); // ID 'desligar' em ambos
const acelerarBotao = document.getElementById("acelerar"); // ID 'acelerar' em ambos
const turboBotao = document.getElementById("turbo"); // ID 'turbo' só em carroesportivo.html

if (ligarBotao) {
    ligarBotao.addEventListener("click", () => meuCarro.ligar());
} else { console.warn("Botão 'ligar' não encontrado!"); }

if (desligarBotao) {
    desligarBotao.addEventListener("click", () => meuCarro.desligar());
} else { console.warn("Botão 'desligar' não encontrado!"); }

if (acelerarBotao) {
    acelerarBotao.addEventListener("click", () => meuCarro.acelerar());
} else { console.warn("Botão 'acelerar' não encontrado!"); }

if (turboBotao) { // Só existe em carroesportivo.html
    turboBotao.addEventListener("click", () => meuCarro.turbo());
} // Não logar erro se não encontrar, é esperado em index.html


// --- Classe Caminhao (Incompleta neste arquivo) ---
/**
 * Representa um caminhão neste exemplo standalone.
 * @note Esta classe está incompleta neste arquivo (`java.js`) e não é usada
 *       pelos HTMLs que linkam para este JS (`index.html`, `carroesportivo.html`).
 *       Uma versão completa existe em `caminhao.js`.
 */
class Caminhao extends Carro {
     /**
      * Cria uma instância de Caminhao.
      * @param {string} modelo - Modelo do caminhão.
      * @param {string} cor - Cor do caminhão.
      * @param {number} capacidadeCarga - Capacidade máxima de carga.
      */
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    /**
     * Carrega o caminhão (lógica simplificada).
     * @param {number} peso - Peso a carregar.
     * @returns {void}
     */
    carregar(peso) {
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            console.log(`${this.modelo} carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
        } else {
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

    /**
     * Simula a buzina do caminhão.
     * @returns {void}
     */
    buzinar() {
        console.log('Fom fom!');
    }
}

// --- Inicialização da UI ---
inicializarInfoCarroTela(); // Preenche os dados iniciais na tela