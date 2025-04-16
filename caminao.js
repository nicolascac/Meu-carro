// caminhao.js - Script para o exemplo standalone caminhao.html

/**
 * Classe base Carro (simplificada para este exemplo).
 * Necessária porque Caminhao herda dela.
 */
class Carro {
    /**
     * @param {string} modelo
     * @param {string} cor
     */
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    /** Liga o carro. */
    ligar() {
        this.ligado = true;
        console.log(`${this.modelo} ligado.`);
    }

    /** Desliga o carro e zera a velocidade. */
    desligar() {
        this.ligado = false;
        this.velocidade = 0;
        console.log(`${this.modelo} desligado.`);
    }

    /**
     * Acelera se estiver ligado.
     * @param {number} incremento
     */
    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
        } else {
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }

    /**
     * Freia o carro, sem deixar a velocidade ficar negativa.
     * @param {number} decremento
     */
    frear(decremento) {
        this.velocidade = Math.max(0, this.velocidade - decremento);
        console.log(`${this.modelo} freou para ${this.velocidade} km/h.`);
    }
}

/**
 * Representa um Caminhão neste exemplo standalone. Herda de Carro.
 * Adiciona funcionalidade de carga.
 */
class Caminhao extends Carro {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} modelo - Modelo do caminhão.
     * @param {string} cor - Cor do caminhão.
     * @param {number} capacidadeCarga - Capacidade máxima de carga em kg.
     */
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor); // Chama o construtor da classe pai (Carro)
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    /**
     * Adiciona peso à carga atual, respeitando a capacidade máxima.
     * @param {number} peso - Peso a ser carregado (deve ser positivo).
     * @returns {void}
     */
    carregar(peso) {
        // Validação adicionada aqui (melhor que depender apenas do HTML)
        if (isNaN(peso) || peso <= 0) {
            console.error('Peso inválido para carregar:', peso);
            alert('Por favor, insira um peso válido (número positivo).'); // Feedback para o usuário
            return;
        }
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            console.log(`${this.modelo} carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
        } else {
            console.log(`Carga (${peso}kg) excedeu a capacidade máxima de ${this.capacidadeCarga}kg!`);
            alert(`Carga (${peso}kg) excede a capacidade! Espaço livre: ${this.capacidadeCarga - this.cargaAtual}kg.`); // Feedback
        }
    }

    /**
     * Simula a buzina específica do caminhão.
     * @returns {void}
     */
    buzinar() { // Método específico do caminhão
        console.log(`${this.modelo} buzinou: Fom fom!`);
        alert('Fom fom!'); // Feedback
    }
}

// --- Instância e Controle de UI (para caminhao.html) ---

/** Instância do Caminhão para o exemplo. */
const meuCaminhao = new Caminhao("Caminhão Exemplo", "Verde Musgo", 5000); // Capacidade 5T

/**
 * Atualiza o texto no elemento #caminhaoStatus com os dados atuais.
 * @returns {void}
 */
function atualizarCaminhaoStatus() {
    const statusElement = document.getElementById('caminhaoStatus');
    if (statusElement) {
        statusElement.textContent = `Status: ${meuCaminhao.ligado ? 'Ligado' : 'Desligado'}, Velocidade: ${meuCaminhao.velocidade} km/h, Carga: ${meuCaminhao.cargaAtual} kg / ${meuCaminhao.capacidadeCarga} kg`;
    } else {
        console.error("Elemento #caminhaoStatus não encontrado!");
    }
}

// --- Event Listeners (para caminhao.html) ---
document.getElementById('ligarCaminhao')?.addEventListener('click', () => {
    meuCaminhao.ligar();
    atualizarCaminhaoStatus();
});

document.getElementById('desligarCaminhao')?.addEventListener('click', () => {
    meuCaminhao.desligar();
    atualizarCaminhaoStatus();
});

document.getElementById('acelerarCaminhao')?.addEventListener('click', () => {
    meuCaminhao.acelerar(5); // Caminhão acelera mais devagar
    atualizarCaminhaoStatus();
});

document.getElementById('frearCaminhao')?.addEventListener('click', () => {
    meuCaminhao.frear(10); // Caminhão freia mais forte (exemplo)
    atualizarCaminhaoStatus();
});

document.getElementById('carregar')?.addEventListener('click', () => {
    const cargaInput = document.getElementById('carga');
    const carga = parseInt(cargaInput?.value); // Usa optional chaining e parseInt

    // Validação movida para o método carregar, mas podemos limpar o input aqui
    meuCaminhao.carregar(carga); // Deixa o método validar e dar feedback
    if (cargaInput) cargaInput.value = ""; // Limpa o campo sempre

    atualizarCaminhaoStatus(); // Atualiza status após tentativa de carregar
});

// Adicionar listener para buzinar (se existir botão)
const buzinarCaminhaoBtn = document.getElementById('buzinarCaminhao'); // Assumindo que poderia existir
if (buzinarCaminhaoBtn) {
    buzinarCaminhaoBtn.addEventListener('click', () => meuCaminhao.buzinar());
}

// --- Inicialização ---
atualizarCaminhaoStatus(); // Mostra o status inicial ao carregar a página