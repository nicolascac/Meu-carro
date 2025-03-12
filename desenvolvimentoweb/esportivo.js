class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
      // Chama o construtor da classe pai (Carro)
      super(modelo, cor);
      this.turboAtivado = false;
    }
  
    ativarTurbo() {
      if (this.ligado) {
        this.turboAtivado = true;
        this.acelerar(50); // Aumenta a velocidade em 50 km/h quando o turbo é ativado
        console.log("Turbo ativado!");
      } else {
        console.log("Ligue o carro primeiro!");
      }
    }
  
    desativarTurbo() {
      this.turboAtivado = false;
      console.log("Turbo desativado!");
    }
  
    exibirStatus() {
      return `${super.exibirStatus()}, Turbo Ativado: ${this.turboAtivado}`; // Usa o método exibirStatus da classe pai e adiciona informações sobre o turbo
    }

    ligar() {
      console.log("Método ligar() da classe Carro chamado"); // ADICIONE ESTA LINHA
      this.ligado = true;
      console.log("Carro ligado!");
  }

}