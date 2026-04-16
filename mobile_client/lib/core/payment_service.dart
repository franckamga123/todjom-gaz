import 'dart:async';

enum PaymentStatus { pending, success, failed }

class PaymentService {
  // Simule l'appel à l'API de My Nita ou Amana
  static Future<Map<String, dynamic>> processPayment({
    required String method,
    required double amount,
    required String phoneNumber,
  }) async {
    // Dans un cas réel, cet appel irait vers le SDK My Nita / Amana
    await Future.delayed(const Duration(seconds: 3));

    // Simulation d'une réussite (90% de succès)
    bool isSuccess = true; 

    if (isSuccess) {
      return {
        'status': PaymentStatus.success,
        'transaction_id': 'TXN-${DateTime.now().millisecondsSinceEpoch}',
        'message': 'Paiement effectué avec succès via ${method.toUpperCase()}'
      };
    } else {
      return {
        'status': PaymentStatus.failed,
        'message': 'Fonds insuffisants ou transaction annulée.'
      };
    }
  }
}
