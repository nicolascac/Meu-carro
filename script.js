class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0; // Novo atributo: velocidade
        this.ligado = false;
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            this.exibirMensagem("Carro ligado!");
            console.log("Carro ligado!");
        } else {
            this.exibirMensagem("O carro já está ligado.");
            console.log("O carro já está ligado.");
        }
        this.atualizarEstadoCarroNaTela();
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            this.atualizarVelocidadeNaTela();
            this.exibirMensagem("Carro desligado!");
            console.log("Carro desligado!");
        } else {
            this.exibirMensagem("O carro já está desligado.");
            console.log("O carro já está desligado.");
        }
        this.atualizarEstadoCarroNaTela();
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 20; // Aumenta a velocidade em 20 km/h
            this.atualizarVelocidadeNaTela();
            this.exibirMensagem("Acelerando! Velocidade: " + this.velocidade + " km/h");
            console.log("Acelerando! Velocidade: " + this.velocidade + " km/h");
        } else {
            this.exibirMensagem("O carro precisa estar ligado para acelerar.");
            console.log("O carro precisa estar ligado para acelerar.");
        }
    }

    buzinar() {  // Nova função para buzinar
        this.exibirMensagem("BEEP BEEP!");
        console.log("BEEP BEEP!");
    }

    // Funções para atualizar a velocidade e o estado do carro na tela
    atualizarVelocidadeNaTela() {
        document.getElementById("velocidadeCarro").textContent = this.velocidade;
    }

    atualizarEstadoCarroNaTela() {
        const estado = this.ligado ? "Ligado" : "Desligado";
        document.getElementById("estadoCarro").textContent = estado;
    }

    // Nova função para exibir mensagens
    exibirMensagem(mensagem) {
        document.getElementById("mensagemCarro").textContent = mensagem;
    }
}

// Criação de um objeto Carro
const meuCarro = new Carro("Sedan", "Vermelho");

// Exibição das informações do carro na página
document.getElementById("modeloCarro").textContent = meuCarro.modelo;
document.getElementById("corCarro").textContent = meuCarro.cor;



// Adicionando eventos aos botões
document.getElementById("ligarBotao").addEventListener("click", function() {
    meuCarro.ligar();
});

document.getElementById("desligarBotao").addEventListener("click", function() {
    meuCarro.desligar();
});

document.getElementById("acelerarBotao").addEventListener("click", function() {
    meuCarro.acelerar();
});

document.getElementById("buzinarBotao").addEventListener("click", function() { // Adiciona o evento para o botão buzinar
    meuCarro.buzinar();
});


// Inicializa o estado do carro na tela
meuCarro.atualizarEstadoCarroNaTela(); // Usando a função do objeto
meuCarro.atualizarVelocidadeNaTela();