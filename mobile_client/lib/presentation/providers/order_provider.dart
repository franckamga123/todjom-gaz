import 'package:flutter/material.dart';
import 'package:todjom_gaz/core/api_service.dart';
import 'package:todjom_gaz/data/models/product_model.dart';

class OrderProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  bool _isProcessing = false;

  bool get isProcessing => _isProcessing;

  Future<Map<String, dynamic>?> initiateSearch({
    required dynamic productId,
    required int quantity,
    required double lat,
    required double lng,
    required String paymentMethod,
  }) async {
    _isProcessing = true;
    notifyListeners();
    try {
      final response = await _api.instance.post('/orders/initiate-search', data: {
        'product_id': productId,
        'quantity': quantity,
        'delivery_latitude': lat,
        'delivery_longitude': lng,
        'payment_method': paymentMethod,
      });
      if (response.statusCode == 201) return response.data['data']['order'];
    } catch (e) {
      debugPrint('Initiate Search Error: $e');
    }
    _isProcessing = false;
    notifyListeners();
    return null;
  }

  Future<Map<String, dynamic>?> searchDistributor(dynamic orderId) async {
    try {
      final response = await _api.instance.post('/orders/$orderId/search-distributor');
      if (response.statusCode == 200) return response.data['data']['distributor'];
    } catch (e) {
      debugPrint('Search Distributor Error: $e');
    }
    return null;
  }

  Future<bool> finalizeOrder({
    required dynamic orderId,
    required String deliveryType, // 'delivery' or 'pickup'
  }) async {
    _isProcessing = true;
    notifyListeners();
    try {
      final response = await _api.instance.post('/orders/$orderId/finalize-delivery', data: {
        'delivery_type': deliveryType,
        'delivery_fee': deliveryType == 'delivery' ? 1500 : 0,
      });
      if (response.statusCode == 200) return true;
    } catch (e) {
      debugPrint('Finalize Order Error: $e');
    }
    _isProcessing = false;
    notifyListeners();
    return false;
  }

  Future<Map<String, dynamic>?> payOrder({
    required dynamic orderId,
    required double amount,
    required String phone,
    String method = 'mynita',
  }) async {
    _isProcessing = true;
    notifyListeners();
    try {
      final response = await _api.instance.post('/payments/init', data: {
        'orderId': orderId,
        'amount': amount,
        'phone': phone,
        'method': method,
      });
      if (response.statusCode == 200) return response.data;
    } catch (e) {
      debugPrint('Payment Error: $e');
    }
    _isProcessing = false;
    notifyListeners();
    return null;
  }

  Future<bool> placeOrder({
    required dynamic productId,
    required int quantity,
    required String paymentMethod,
  }) async {
    _isProcessing = true;
    notifyListeners();
    try {
      final response = await _api.instance.post('/orders', data: {
        'product_id': productId,
        'quantity': quantity,
        'payment_method': paymentMethod,
      });
      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Order Error: $e');
    }
    _isProcessing = false;
    notifyListeners();
    return false;
  }
}
