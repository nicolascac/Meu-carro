// js/classes/Carro.js
import { Veiculo } from './Veiculo.js';

/**
 * Representa um Carro comum, herdando as funcionalidades básicas de Veiculo.
 */
export class Carro extends Veiculo {
    /**
     * Cria uma instância de Carro.
     * @param {string} modelo - O modelo do carro.
     * @param {string} cor - A cor do carro.
     * @param {string|null} [id=null] - O ID único do carro. Se null, um novo ID será gerado.
     */
    constructor(modelo, cor, id = null) {
        super(modelo, cor, id, 'Carro'); // Passa o tipoVeiculo específico
    }

    // Não precisa sobrescrever getInfoEspecificaHTML se não houver info extra.
    // O toJSON da classe pai (Veiculo) é suficiente se não houver propriedades extras.
}