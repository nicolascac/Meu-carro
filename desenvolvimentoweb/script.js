// Definindo a classe Carro
class Carro {
  constructor(modelo, cor) {
    this.modelo = modelo;
    this.cor = cor;
    this.velocidade = 0;
    this.ligado = false;
    this.mensagemElement = document.getElementById("mensagem");
    this.modeloElement = document.getElementById("modeloCarro");
    this.corElement = document.getElementById("corCarro");

    this.somLigar = document.getElementById("somLigar"); // Busca o elemento de áudio no HTML
    this.somLigar.volume = 0.5; // Ajusta o volume (opcional)

    this.atualizarInfoCarro();
  }

  ligar() {
    if (!this.ligado) {
      this.ligado = true;
      this.exibirMensagem("Carro ligado!");
      this.somLigar.play(); // Toca o som
    } else {
      this.exibirMensagem("O carro já está ligado!");
    }
  }

  desligar() {
    if (this.ligado) {
      this.ligado = false;
      this.velocidade = 0;
      this.exibirMensagem("Carro Desligado!");
      atualizarVelocidadeNaTela();
    } else {
      this.exibirMensagem("O carro já está desligado!");
    }
  }

  acelerar(incremento) {
    if (this.ligado) {
      this.velocidade += incremento;
      this.exibirMensagem(`Acelerando para ${this.velocidade} km/h`);
      atualizarVelocidadeNaTela();
    } else {
      this.exibirMensagem("O carro precisa estar ligado para acelerar!");
    }
  }

  exibirMensagem(mensagem) {
    this.mensagemElement.textContent = mensagem;
  }

  atualizarInfoCarro() {
    this.modeloElement.textContent = `Modelo: ${this.modelo}`;
    this.corElement.textContent = `Cor: ${this.cor}`;
  }

  exibirStatus() {
    this.mensagemElement.textContent = "status";
  }


}

// Criando um objeto Carro
const meuCarro = new Carro("Fusca", "Azul");

// Obtendo referências aos elementos HTML
const ligarBtn = document.getElementById("ligarBtn");
const desligarBtn = document.getElementById("desligarBtn");
const acelerarBtn = document.getElementById("acelerarBtn");
const velocidadeAtualElement = document.getElementById("velocidadeAtual");


// Funções para atualizar a tela
function atualizarVelocidadeNaTela() {
  velocidadeAtualElement.textContent = `Velocidade: ${meuCarro.velocidade} km/h`;
}


// Adicionando os event listeners aos botões
ligarBtn.addEventListener("click", function() {
  meuCarro.ligar();
});

desligarBtn.addEventListener("click", function() {
  meuCarro.desligar();
});

acelerarBtn.addEventListener("click", function() {
  meuCarro.acelerar(10); // Acelera em 10 km/h
});

// Inicialização (exibe a velocidade inicial)
atualizarVelocidadeNaTela();

