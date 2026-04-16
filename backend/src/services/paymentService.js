const axios = require('axios');

/**
 * Service de Paiement TODJOM GAZ
 * Intégration My Nita / Amana Transfert
 */
class PaymentService {
    constructor() {
        this.mode = process.env.PAYMENT_MODE || 'sandbox'; // sandbox ou production
        this.apiKey = process.env.PAYMENT_API_KEY;
    }

    /**
     * Initie un paiement via My Nita
     */
    async initMyNitaPayment(amount, orderId, phoneNumber) {
        if (this.mode === 'sandbox') {
            return this.simulatePayment(amount, phoneNumber, 'MY_NITA', orderId);
        }

        try {
            // Exemple d'appel API My Nita (à adapter selon leur doc technique réelle)
            const response = await axios.post('https://api.mynita.com/v1/payments', {
                amount,
                phone: phoneNumber,
                reference: orderId,
                webhook_url: `${process.env.BASE_URL}/api/payments/callback`
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return { success: true, ...response.data };
        } catch (error) {
            console.error('Erreur My Nita:', error);
            return { success: false, message: 'Échec de la connexion avec My Nita' };
        }
    }

    /**
     * Initie un paiement via Amana Transfert
     */
    async initAmanaPayment(amount, orderId, phoneNumber) {
        if (this.mode === 'sandbox') {
            return this.simulatePayment(amount, phoneNumber, 'AMANA', orderId);
        }
        
        try {
            // Intégration Amana réelle (basée sur les spécifications standards de transfert d'argent)
            const response = await axios.post(`${process.env.AMANA_API_URL || 'https://api.amanatransfert.net/v1'}/request`, {
                amount,
                phone: phoneNumber,
                order_ref: orderId,
                callback_url: `${process.env.BASE_URL}/api/payments/callback`
            }, {
                headers: { 'X-API-KEY': process.env.AMANA_API_KEY }
            });
            return { success: true, ...response.data };
        } catch (error) {
            console.error('Erreur Amana:', error);
            return { success: false, message: 'Échec de la connexion avec Amana Transfert' };
        }
    }

    /**
     * Simulation pour le développement
     */
    async simulatePayment(amount, phone, provider, orderId) {
        console.log(`[SIMULATION ${provider}] Paiement de ${amount} CFA pour la commande ${orderId} (${phone})...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transaction_id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    status: 'completed',
                    order_id: orderId,
                    payment_url: `http://localhost:5000/payment-mock?orderId=${orderId}&amount=${amount}`
                });
            }, 800);
        });
    }

    /**
     * Gérer le callback du fournisseur de paiement
     */
    async handleCallback(transactionId, status) {
        console.log(`[PAYMENT CALLBACK] Transaction ${transactionId} -> ${status}`);
        // Ici on mettrait à jour la commande concernée
        return { success: true };
    }
}

module.exports = new PaymentService();
