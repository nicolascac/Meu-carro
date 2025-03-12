class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
      super(modelo, cor);
      this.capacidadeCarga = capacidadeCarga;
      this.cargaAtual = 0;
    }
  
    carregar(peso) {
      if (this.cargaAtual + peso <= this.capacidadeCarga) {
        this.cargaAtual += peso;
        console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
      } else {
        console.log("Carga excede a capacidade do caminhão!");
      }
    }
  
    descarregar(peso) {
      this.cargaAtual = Math.max(0, this.cargaAtual - peso);
      console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
    }
  
    exibirStatus() {
      return `${super.exibirStatus()}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;

    }
  }

  function carregarCaminhao() {
    console.log("Função carregarCaminhao chamada");
    if (caminhao) {
      console.log("Caminhao existe:", caminhao); //ADICIONE ESTA LINHA
      const peso = parseInt(document.getElementById("pesoCarga").value);
      console.log("Peso a carregar:", peso);
      caminhao.carregar(peso);
      atualizarStatusCaminhao();
    } else {
      alert("Crie o caminhão primeiro!");
    }
  }
  