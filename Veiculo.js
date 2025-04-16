// js/classes/Veiculo.js
import { Manutencao } from './Manutencao.js'; // Importa a classe Manutencao

/**
 * Representa um veículo genérico na garagem.
 * Serve como classe base para tipos específicos de veículos (Carro, Caminhao, etc.).
 * Gerencia estado (ligado/desligado, velocidade) e histórico de manutenção.
 */
export class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @param {string|null} [id=null] - O ID único do veículo. Se null, um novo ID será gerado.
     * @param {string} [tipoVeiculo='Veiculo'] - O tipo específico do veículo (usado para recriação).
     */
    constructor(modelo, cor, id = null, tipoVeiculo = 'Veiculo') {
        this.id = id || `veh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        /** @type {Manutencao[]} */
        this.historicoManutencao = []; // Array para objetos Manutencao
        this.tipoVeiculo = tipoVeiculo; // Essencial para reidratação
    }

    /**
     * Liga o motor do veículo, se estiver desligado.
     * Atualiza o estado e exibe notificação. Persiste a alteração.
     * @returns {void}
     */
    ligar() {
        if (this.ligado) {
            exibirNotificacao(`${this.modelo} já está ligado.`, 'warning'); // Assumes exibirNotificacao is global or imported
            return;
        }
        this.ligado = true;
        exibirNotificacao(`${this.modelo} ligado.`, 'info');
        atualizarInfoVeiculoNoModal(this.id); // Assumes atualizarInfoVeiculoNoModal is global or imported
        salvarGaragem(); // Assumes salvarGaragem is global or imported
    }

    /**
     * Desliga o motor do veículo, se estiver ligado.
     * Reseta a velocidade para 0. Atualiza o estado e exibe notificação. Persiste a alteração.
     * @returns {void}
     */
    desligar() {
        if (!this.ligado) {
            exibirNotificacao(`${this.modelo} já está desligado.`, 'warning');
            return;
        }
        this.ligado = false;
        this.velocidade = 0; // Resetar velocidade ao desligar
        exibirNotificacao(`${this.modelo} desligado.`, 'info');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem();
    }

    /**
     * Aumenta a velocidade do veículo, se estiver ligado.
     * @param {number} [incremento=10] - O valor a ser adicionado à velocidade atual.
     * @returns {void}
     */
    acelerar(incremento = 10) {
        if (!this.ligado) {
            exibirNotificacao(`${this.modelo} não pode acelerar, está desligado.`, 'error');
            return;
        }
        this.velocidade += incremento;
        // Limitar velocidade máxima (opcional)
        // const VELOCIDADE_MAXIMA = 180;
        // if (this.velocidade > VELOCIDADE_MAXIMA) this.velocidade = VELOCIDADE_MAXIMA;

        exibirNotificacao(`${this.modelo} acelerou para ${this.velocidade} km/h.`, 'info');
        atualizarInfoVeiculoNoModal(this.id);
        // Opcional: salvarGaragem(); // Evitar salvar em ações muito frequentes
    }

    /**
     * Simula a buzina do veículo.
     * @returns {void}
     */
    buzinar() {
        exibirNotificacao(`${this.modelo} buzinou: 📣 Beep beep!`, 'info');
    }

    /**
     * Gera HTML com as informações básicas do veículo (modelo, cor, estado, velocidade).
     * @returns {string} String HTML contendo as informações básicas.
     */
    getInfoBasicaHTML() {
        // Adicionar classes CSS 'status-on' e 'status-off' para estilizar o status 'Ligado'
        return `
            <p><strong>ID:</strong> ${this.id}</p>
            <p><strong>Tipo:</strong> ${this.tipoVeiculo}</p>
            <p><strong>Modelo:</strong> ${this.modelo}</p>
            <p><strong>Cor:</strong> ${this.cor}</p>
            <p><strong>Ligado:</strong> <span class="${this.ligado ? 'status-on' : 'status-off'}">${this.ligado ? 'Sim' : 'Não'}</span></p>
            <p><strong>Velocidade:</strong> ${this.velocidade} km/h</p>
        `;
    }

    /**
     * Retorna HTML com informações específicas do tipo de veículo.
     * Deve ser sobrescrito pelas classes filhas se houver informações adicionais.
     * @returns {string} String HTML com informações específicas (vazio por padrão).
     */
    getInfoEspecificaHTML() {
        return '';
    }

    /**
     * Combina informações básicas e específicas para exibição completa.
     * @returns {string} String HTML completa com todas as informações do veículo.
     */
    exibirInformacoesCompletaHTML() {
        return this.getInfoBasicaHTML() + this.getInfoEspecificaHTML();
    }

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * Valida a manutenção, a adiciona, ordena o histórico e salva a garagem.
     * @param {Manutencao} manutencao - A instância de Manutencao a ser adicionada.
     * @returns {boolean} True se a manutenção foi adicionada com sucesso, False caso contrário.
     */
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Objeto inválido passado para adicionarManutencao:", manutencao);
            exibirNotificacao("Erro interno: Tentativa de adicionar manutenção inválida.", 'error');
            return false;
        }

        const erros = manutencao.validar();
        if (erros.length > 0) {
            exibirNotificacao(`Erro ao adicionar/agendar: ${erros.join(' ')}`, 'error');
            return false;
        }

        this.historicoManutencao.push(manutencao);
        // Ordena sempre por data (mais recente primeiro)
        this.historicoManutencao.sort((a, b) => b.data - a.data);

        const acao = manutencao.data > new Date() ? 'agendada' : 'registrada';
        exibirNotificacao(`Manutenção (${manutencao.tipo}) ${acao} para ${this.modelo}.`, 'success');
        salvarGaragem();
        return true;
    }

     /**
     * Remove um registro de manutenção do histórico pelo seu ID.
     * Salva a garagem se a remoção for bem-sucedida.
     * @param {string} manutencaoId - O ID da manutenção a ser removida.
     * @returns {boolean} True se a manutenção foi removida, False caso contrário.
     */
     removerManutencaoPorId(manutencaoId) {
        const tamanhoAntes = this.historicoManutencao.length;
        this.historicoManutencao = this.historicoManutencao.filter(m => m.id !== manutencaoId);
        const removido = this.historicoManutencao.length < tamanhoAntes;
        if (removido) {
            salvarGaragem();
        }
        return removido;
    }

    /**
     * Gera HTML para exibir o histórico de manutenção e agendamentos futuros.
     * Separa visualmente registros passados e futuros.
     * @returns {string} String HTML contendo o histórico formatado.
     */
    getHistoricoHTML() {
        if (this.historicoManutencao.length === 0) {
            return '<p>Nenhum registro de manutenção.</p>';
        }

        const agora = new Date();
        let html = '';

        // Separa por Passado e Futuro
        const passadas = this.historicoManutencao.filter(m => m.data <= agora);
        const futuras = this.historicoManutencao.filter(m => m.data > agora);

        // Ordena passadas (mais recente primeiro) e futuras (mais próxima primeiro) - Já ordenado em adicionarManutencao
        // passadas.sort((a, b) => b.data - a.data); // Já ordenado assim
        futuras.sort((a, b) => a.data - b.data); // Ordena futuras por data mais próxima

        if (passadas.length > 0) {
            html += '<h4>Histórico Passado</h4>';
            passadas.forEach(m => {
                html += `<div class="maintenance-item" data-id="${m.id}">
                           <span>${m.formatar()}</span>
                           <button class="small-warning" onclick="window.app.removerManutencao('${this.id}', '${m.id}')" title="Remover este registro">Remover</button>
                         </div>`;
                         // Note: Changed onclick to use window.app scope for modules
            });
        }

        if (futuras.length > 0) {
            html += '<h4>Agendamentos Futuros</h4>';
            futuras.forEach(m => {
                 html += `<div class="schedule-item" data-id="${m.id}">
                            <span>${m.formatar()}</span>
                            <button class="small-warning" onclick="window.app.removerManutencao('${this.id}', '${m.id}')" title="Cancelar este agendamento">Cancelar</button>
                          </div>`;
                          // Note: Changed onclick to use window.app scope for modules
            });
        }

         if (!html) {
             return '<p>Nenhum registro de manutenção válido encontrado.</p>';
         }

        return html;
    }

    /**
     * Recria uma instância de Veiculo (ou suas subclasses) a partir de um objeto JSON.
     * Este método estático é crucial para carregar dados do LocalStorage, pois instancia
     * a classe correta (Carro, Caminhao, etc.) com base na propriedade 'tipoVeiculo'.
     * @param {object} json - O objeto JSON contendo os dados do veículo.
     * @returns {Veiculo|Carro|CarroEsportivo|Caminhao|null} A instância do veículo recriada, ou null se ocorrer um erro.
     * @static
     */
    static fromJSON(json) {
        // NOTE: This requires Carro, CarroEsportivo, Caminhao to be defined BEFORE this method is called
        // when loading script files sequentially. With modules, import order handles this.
        // We need to import them here if using modules, or ensure load order.
        // This is a simplified placeholder for the actual dynamic class instantiation
        // that would typically happen in the main script loading these classes.
        // A better approach in main.js would be a factory function.

        if (!json || !json.tipoVeiculo) {
            console.error("Tentativa de reidratar veículo a partir de JSON inválido:", json);
            return null;
        }

        let veiculo;
        // Dynamic class instantiation would happen here based on json.tipoVeiculo
        // For now, returning a generic Veiculo to avoid circular dependencies if not using modules
        // Or rely on the fact that the actual fromJSON logic is called from main.js which has access to all classes.
        console.warn("Veiculo.fromJSON needs actual implementation in main context or via factory pattern");
        veiculo = new Veiculo(json.modelo, json.cor, json.id, json.tipoVeiculo);

        // Restore common properties
        veiculo.ligado = json.ligado || false;
        veiculo.velocidade = json.velocidade || 0;

        // Reidrata o histórico de manutenção
        if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
            veiculo.historicoManutencao = json.historicoManutencao.map(mJson => {
                if (!mJson || !mJson.data || !mJson.tipo) {
                    console.warn("Registro de manutenção inválido encontrado no JSON:", mJson);
                    return null;
                }
                const manutencao = new Manutencao(mJson.data, mJson.tipo, mJson.custo, mJson.descricao);
                 if (mJson.id) {
                     manutencao.id = mJson.id;
                 }
                 if (isNaN(manutencao.data.getTime())) {
                     console.warn(`Manutenção ${manutencao.id || mJson.tipo} carregada com data inválida.`);
                 }
                return manutencao;
            }).filter(m => m !== null);

            veiculo.historicoManutencao.sort((a, b) => b.data - a.data);
        } else {
            veiculo.historicoManutencao = [];
        }

        // Specific properties (turbo, carga) should be handled by the specific fromJSON logic
        // in the main script or factory function.

        return veiculo; // Return the partially hydrated base vehicle
    }


    /**
     * Prepara o objeto Veiculo para serialização em JSON.
     * Garante que o tipoVeiculo seja salvo para permitir a recriação correta.
     * Chama o método toJSON de cada objeto Manutencao no histórico.
     * @returns {object} Um objeto simples contendo os dados do veículo, pronto para JSON.stringify.
     */
    toJSON() {
        return {
            id: this.id,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            velocidade: this.velocidade,
            historicoManutencao: this.historicoManutencao.map(m => m.toJSON()),
            tipoVeiculo: this.tipoVeiculo // Essencial!
        };
    }
}

// Make functions global or accessible via an app object when using modules
// This is a placeholder; proper handling depends on how main.js is structured.
// window.exibirNotificacao = window.exibirNotificacao || function() {};
// window.atualizarInfoVeiculoNoModal = window.atualizarInfoVeiculoNoModal || function() {};
// window.salvarGaragem = window.salvarGaragem || function() {};