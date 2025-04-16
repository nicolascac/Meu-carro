// js/classes/Manutencao.js

/**
 * Representa um registro de manutenção ou agendamento para um veículo.
 * Contém informações sobre data, tipo, custo e descrição do serviço.
 */
export class Manutencao {
    /**
     * Cria uma nova instância de Manutencao.
     * @param {string|Date} data - A data e hora da manutenção (string ISO 8601 ou objeto Date).
     * @param {string} tipo - O tipo de serviço realizado (ex: "Troca de óleo").
     * @param {number|string} custo - O custo do serviço. Será convertido para float.
     * @param {string} [descricao=''] - Uma descrição opcional do serviço.
     */
    constructor(data, tipo, custo, descricao = '') {
        // Armazena a data como objeto Date internamente
        this.data = data instanceof Date ? data : new Date(data);
        // Garante que mesmo uma data inválida seja armazenada como Invalid Date
        if (isNaN(this.data.getTime())) {
            console.warn("Data fornecida resultou em data inválida:", data);
            // this.data = null; // Ou mantém como Invalid Date
        }
        this.tipo = tipo.trim();
        this.custo = parseFloat(custo) || 0; // Garante que custo seja número, 0 se inválido
        this.descricao = descricao.trim();
        // ID único mais robusto
        this.id = `man-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {string[]} Um array de mensagens de erro. Retorna um array vazio se for válido.
     */
    validar() {
        const erros = [];
        // Verifica se a data é um objeto Date válido
        if (!(this.data instanceof Date) || isNaN(this.data.getTime())) {
            erros.push("Data inválida.");
        }
        if (!this.tipo) { // Verifica se tipo não é vazio após trim
            erros.push("Tipo de serviço é obrigatório.");
        }
        // Custo pode ser zero (ex: serviço na garantia), mas não negativo
        if (this.custo < 0) {
            erros.push("Custo não pode ser negativo.");
        }
        return erros; // Retorna array de erros (vazio se válido)
    }

    /**
     * Formata as informações da manutenção para exibição em HTML.
     * @param {boolean} [incluirVeiculo=false] - Se deve incluir o nome do veículo na string formatada.
     * @param {string} [nomeVeiculo=''] - O nome do veículo a ser incluído (se incluirVeiculo for true).
     * @returns {string} Uma string HTML formatada com os detalhes da manutenção.
     */
    formatar(incluirVeiculo = false, nomeVeiculo = '') {
        let dataFormatada = "Data inválida";
        if (this.data instanceof Date && !isNaN(this.data.getTime())) {
             dataFormatada = this.data.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let str = `<strong>${this.tipo}</strong> em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            str += ` <em>(${this.descricao})</em>`;
        }
         if (incluirVeiculo && nomeVeiculo) {
            str += ` - [Veículo: ${nomeVeiculo}]`;
        }
        return str;
    }

    /**
     * Prepara o objeto Manutencao para serialização em JSON.
     * A data é convertida para string ISO 8601.
     * @returns {object} Um objeto simples contendo os dados da manutenção, pronto para JSON.stringify.
     */
    toJSON() {
        return {
            // Salva a data como string ISO 8601 se for válida, senão null
            data: (this.data instanceof Date && !isNaN(this.data.getTime())) ? this.data.toISOString() : null,
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao,
            id: this.id // Inclui o ID na serialização
        };
    }
}