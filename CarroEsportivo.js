// js/classes/CarroEsportivo.js
import { Veiculo } from './Veiculo.js';

/**
 * Representa um Carro Esportivo, que herda de Veiculo e adiciona a funcionalidade de Turbo.
 */
export class CarroEsportivo extends Veiculo {
     /**
      * Cria uma instância de CarroEsportivo.
      * @param {string} modelo - O modelo do carro esportivo.
      * @param {string} cor - A cor do carro esportivo.
      * @param {boolean} [turbo=false] - O estado inicial do turbo.
      * @param {string|null} [id=null] - O ID único do carro esportivo. Se null, um novo ID será gerado.
      */
    constructor(modelo, cor, turbo = false, id = null) {
        super(modelo, cor, id, 'CarroEsportivo');
        this.turbo = turbo;
    }

    /**
     * Ativa o turbo do carro esportivo, se estiver ligado e o turbo desativado.
     * Atualiza o estado, exibe notificação e persiste a alteração.
     * @returns {void}
     */
    ativarTurbo() {
        if (this.turbo) {
            exibirNotificacao('Turbo já está ativado!', 'warning'); // Assume global scope or import
            return;
        }
         if (!this.ligado) {
             exibirNotificacao('Ligue o carro esportivo antes de ativar o turbo!', 'error');
             return;
         }
        this.turbo = true;
        exibirNotificacao('🚀 Turbo ativado!', 'success');
        atualizarInfoVeiculoNoModal(this.id); // Assume global scope or import
        salvarGaragem(); // Assume global scope or import
    }

    /**
     * Desativa o turbo do carro esportivo, se estiver ativado.
     * Atualiza o estado, exibe notificação e persiste a alteração.
     * @returns {void}
     */
    desativarTurbo() {
        if (!this.turbo) {
            exibirNotificacao('Turbo já está desativado!', 'warning');
            return;
        }
        this.turbo = false;
        exibirNotificacao('Turbo desativado.', 'info');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem();
    }

    /**
     * Retorna HTML com informações específicas do Carro Esportivo (estado do Turbo).
     * Sobrescreve o método da classe pai.
     * @returns {string} String HTML indicando o estado do turbo.
     */
    getInfoEspecificaHTML() {
        // Adicionar classes CSS 'status-on' e 'status-off' para estilizar
        return `<p><strong>Turbo:</strong> <span class="status-${this.turbo ? 'on' : 'off'}">${this.turbo ? 'Ativado' : 'Desativado'}</span></p>`;
    }

    /**
     * Prepara o objeto CarroEsportivo para serialização em JSON.
     * Inclui a propriedade 'turbo' além das propriedades da classe pai.
     * @returns {object} Um objeto simples contendo os dados do carro esportivo.
     */
    toJSON() {
        const json = super.toJSON(); // Pega o JSON da classe pai
        json.turbo = this.turbo;    // Adiciona a propriedade específica
        return json;
    }
}

// Make functions global or accessible via an app object when using modules
// window.exibirNotificacao = window.exibirNotificacao || function() {};
// window.atualizarInfoVeiculoNoModal = window.atualizarInfoVeiculoNoModal || function() {};
// window.salvarGaragem = window.salvarGaragem || function() {};