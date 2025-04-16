// js/classes/Caminhao.js
import { Veiculo } from './Veiculo.js';

/**
 * Representa um Caminhão, que herda de Veiculo e adiciona funcionalidades
 * relacionadas à capacidade e gerenciamento de carga.
 */
export class Caminhao extends Veiculo {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} modelo - O modelo do caminhão.
     * @param {string} cor - A cor do caminhão.
     * @param {number|string} capacidadeCarga - A capacidade máxima de carga em kg. Será convertida para float.
     * @param {number|string} [cargaAtual=0] - A carga atual do caminhão em kg. Será convertida para float.
     * @param {string|null} [id=null] - O ID único do caminhão. Se null, um novo ID será gerado.
     */
    constructor(modelo, cor, capacidadeCarga, cargaAtual = 0, id = null) {
        super(modelo, cor, id, 'Caminhao');
        // Garante que capacidade e carga sejam números não negativos
        this.capacidadeCarga = Math.max(0, parseFloat(capacidadeCarga) || 0);
        this.cargaAtual = Math.max(0, parseFloat(cargaAtual) || 0);
    }

    /**
     * Valida se o peso fornecido é um número positivo.
     * @param {number|string} peso - O peso a ser validado.
     * @returns {number|null} O peso como número float se válido, ou null caso contrário.
     * @private
     */
    _validarPeso(peso) {
         const pesoNumerico = parseFloat(peso);
         if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
             exibirNotificacao('Peso inválido. Insira um número positivo.', 'error'); // Assume global scope or import
             return null;
         }
         return pesoNumerico;
    }

    /**
     * Adiciona peso à carga atual do caminhão, se houver capacidade.
     * Valida o peso, atualiza o estado, exibe notificação e persiste a alteração.
     * @param {number|string} peso - O peso a ser carregado.
     * @returns {void}
     */
    carregar(peso) {
        const pesoNumerico = this._validarPeso(peso);
        if (pesoNumerico === null) return;

        if (this.cargaAtual + pesoNumerico <= this.capacidadeCarga) {
            this.cargaAtual += pesoNumerico;
            exibirNotificacao(`Caminhão carregado com ${pesoNumerico.toLocaleString('pt-BR')} kg. Carga atual: ${this.cargaAtual.toLocaleString('pt-BR')} kg.`, 'success');
            atualizarInfoVeiculoNoModal(this.id); // Assume global scope or import
            salvarGaragem(); // Assume global scope or import
        } else {
            const espacoLivre = this.capacidadeCarga - this.cargaAtual;
            exibirNotificacao(`Carga (${pesoNumerico.toLocaleString('pt-BR')}kg) excede a capacidade! Espaço livre: ${espacoLivre.toLocaleString('pt-BR')}kg.`, 'error');
        }
    }

    /**
     * Remove peso da carga atual do caminhão, se houver carga suficiente.
     * Valida o peso, atualiza o estado, exibe notificação e persiste a alteração.
     * @param {number|string} peso - O peso a ser descarregado.
     * @returns {void}
     */
    descarregar(peso) {
        const pesoNumerico = this._validarPeso(peso);
         if (pesoNumerico === null) return;

        if (this.cargaAtual >= pesoNumerico) {
            this.cargaAtual -= pesoNumerico;
            exibirNotificacao(`Caminhão descarregado em ${pesoNumerico.toLocaleString('pt-BR')} kg. Carga atual: ${this.cargaAtual.toLocaleString('pt-BR')} kg.`, 'success');
            atualizarInfoVeiculoNoModal(this.id);
            salvarGaragem();
        } else {
            exibirNotificacao(`Não é possível descarregar ${pesoNumerico.toLocaleString('pt-BR')}kg. Carga atual é ${this.cargaAtual.toLocaleString('pt-BR')}kg.`, 'error');
        }
    }

    /**
     * Retorna HTML com informações específicas do Caminhão (capacidade, carga atual, % ocupada).
     * Sobrescreve o método da classe pai.
     * @returns {string} String HTML com informações de carga do caminhão.
     */
    getInfoEspecificaHTML() {
        const percentualCarga = this.capacidadeCarga > 0 ? (this.cargaAtual / this.capacidadeCarga) * 100 : 0;
        return `
            <p><strong>Capacidade:</strong> ${this.capacidadeCarga.toLocaleString('pt-BR')} kg</p>
            <p><strong>Carga Atual:</strong> ${this.cargaAtual.toLocaleString('pt-BR')} kg (${percentualCarga.toFixed(1)}%)</p>
            <!-- Opcional: Barra de progresso da carga -->
            <progress value="${this.cargaAtual}" max="${this.capacidadeCarga}" style="width: 100%; height: 15px;"></progress>
        `;
    }

    /**
     * Prepara o objeto Caminhao para serialização em JSON.
     * Inclui as propriedades 'capacidadeCarga' e 'cargaAtual' além das propriedades da classe pai.
     * @returns {object} Um objeto simples contendo os dados do caminhão.
     */
    toJSON() {
        const json = super.toJSON();
        json.capacidadeCarga = this.capacidadeCarga;
        json.cargaAtual = this.cargaAtual;
        return json;
    }
}

// Make functions global or accessible via an app object when using modules
// window.exibirNotificacao = window.exibirNotificacao || function() {};
// window.atualizarInfoVeiculoNoModal = window.atualizarInfoVeiculoNoModal || function() {};
// window.salvarGaragem = window.salvarGaragem || function() {};