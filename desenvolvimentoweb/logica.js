// Variáveis globais para os objetos
let carroEsportivo;
let caminhao;

// Funções para o Carro Esportivo
function criarCarroEsportivo() {
  const modelo = document.getElementById("modeloEsportivo").value;
  const cor = document.getElementById("corEsportivo").value;
  carroEsportivo = new CarroEsportivo(modelo, cor);
  atualizarStatusEsportivo();
}

function ligarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.ligar();
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function desligarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.desligar();
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function acelerarEsportivo(incremento) {
  if (carroEsportivo) {
    carroEsportivo.acelerar(incremento);
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function frearEsportivo(decremento) {
  if (carroEsportivo) {
    carroEsportivo.frear(decremento);
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function ativarTurbo() {
    if (carroEsportivo) {
        carroEsportivo.ativarTurbo();
        atualizarStatusEsportivo();
    } else {
        alert("Crie o carro esportivo primeiro!");
    }
}

function desativarTurbo() {
    if (carroEsportivo) {
        carroEsportivo.desativarTurbo();
        atualizarStatusEsportivo();
    } else {
        alert("Crie o carro esportivo primeiro!");
    }
}

function atualizarStatusEsportivo() {
  if (carroEsportivo) {
    document.getElementById("statusEsportivo").textContent = carroEsportivo.exibirStatus();
  } else {
    document.getElementById("statusEsportivo").textContent = "Crie o carro esportivo primeiro!";
  }
}


// Funções para o Caminhão
function criarCaminhao() {
  const modelo = document.getElementById("modeloCaminhao").value;
  const cor = document.getElementById("corCaminhao").value;
  const capacidadeCarga = parseInt(document.getElementById("capacidadeCarga").value);
  caminhao = new Caminhao(modelo, cor, capacidadeCarga);
  atualizarStatusCaminhao();
}

function ligarCaminhao() {
  if (caminhao) {
    caminhao.ligar();
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function desligarCaminhao() {
  if (caminhao) {
    caminhao.desligar();
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function acelerarCaminhao(incremento) {
  if (caminhao) {
    caminhao.acelerar(incremento);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function frearCaminhao(decremento) {
  if (caminhao) {
    caminhao.frear(decremento);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function carregarCaminhao() {
  if (caminhao) {
    const peso = parseInt(document.getElementById("pesoCarga").value);
    caminhao.carregar(peso);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function descarregarCaminhao() {
  if (caminhao) {
    const peso = parseInt(document.getElementById("pesoCarga").value);
    caminhao.descarregar(peso);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function atualizarStatusCaminhao() {
  if (caminhao) {
    document.getElementById("statusCaminhao").textContent = caminhao.exibirStatus();
  } else {
    document.getElementById("statusCaminhao").textContent = "Crie o caminhão primeiro!";
  }
}