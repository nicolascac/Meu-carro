

// Classe Carro (exemplo básico)
class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        this.ligado = true;
        console.log(`${this.modelo} ligado.`);
    }

    desligar() {
        this.ligado = false;
        this.velocidade = 0;
        console.log(`${this.modelo} desligado.`);
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
        } else {
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }

    frear(decremento) {
        this.velocidade = Math.max(0, this.velocidade - decremento);
        console.log(`${this.modelo} freou para ${this.velocidade} km/h.`);
    }
}

// Classe Caminhao (herda de Carro)
class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(peso) {
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            console.log(`${this.modelo} carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
        } else {
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

    buzinar() {
        console.log('Fom fom!');
    }
}

// Cria uma instância de Caminhao
const meuCaminhao = new Caminhao("Caminhãozão", "Vermelho", 10000);

// Função para atualizar o status do caminhão na página
function atualizarCaminhaoStatus() {
    const statusElement = document.getElementById('caminhaoStatus');
    statusElement.textContent = `Status: ${meuCaminhao.ligado ? 'Ligado' : 'Desligado'}, Velocidade: ${meuCaminhao.velocidade} km/h, Carga: ${meuCaminhao.cargaAtual} kg`;
}

// Event Listeners para os botões
document.getElementById('ligarCaminhao').addEventListener('click', () => {
    meuCaminhao.ligar();
    atualizarCaminhaoStatus();
});

document.getElementById('desligarCaminhao').addEventListener('click', () => {
    meuCaminhao.desligar();
    atualizarCaminhaoStatus();
});

document.getElementById('acelerarCaminhao').addEventListener('click', () => {
    meuCaminhao.acelerar(5);
    atualizarCaminhaoStatus();
});

document.getElementById('frearCaminhao').addEventListener('click', () => {
    meuCaminhao.frear(5);
    atualizarCaminhaoStatus();
});

document.getElementById('carregar').addEventListener('click', () => {
    const cargaInput = document.getElementById('carga');
    const carga = parseInt(cargaInput.value);

    if (isNaN(carga) || carga <= 0) {
        alert("Por favor, insira um valor de carga válido (número positivo).");
        cargaInput.value = ""; // Limpa o campo
        return; // Impede a execução do resto da função
    }

    meuCaminhao.carregar(carga);
    atualizarCaminhaoStatus();
});

// Inicializa o status na página
atualizarCaminhaoStatus();

