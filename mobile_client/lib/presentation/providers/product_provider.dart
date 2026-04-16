import 'package:flutter/material.dart';
import 'package:todjom_gaz/core/api_service.dart';
import 'package:todjom_gaz/data/models/product_model.dart';

class ProductProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<GasProduct> _products = [];
  List<Map<String, String>> _nonAuthCenters = [];
  bool _isLoading = false;

  List<GasProduct> get products => _products;
  List<Map<String, String>> get nonAuthCenters => _nonAuthCenters;
  bool get isLoading => _isLoading;

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.instance.get('/products');
      if (response.statusCode == 200) {
        final List data = response.data;
        _products = data.map((json) => GasProduct.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching products: $e');
      // Fallback data
      _products = [
        GasProduct(id: '1', providerName: 'Niger Gaz', gasType: '12.5kg (Moyen)', price: 3750, stock: 50, imageUrl: ''),
        GasProduct(id: '2', providerName: 'SONIGAZ', gasType: '6kg (Petit)', price: 1800, stock: 45, imageUrl: ''),
        GasProduct(id: '3', providerName: 'Ténéré Gaz', gasType: '12.5kg (Moyen)', price: 3750, stock: 30, imageUrl: ''),
        GasProduct(id: '4', providerName: 'ORIBA Gaz', gasType: '6kg (Petit)', price: 1800, stock: 25, imageUrl: ''),
        GasProduct(id: '5', providerName: 'Star Oil', gasType: '3kg (Mini)', price: 900, stock: 15, imageUrl: ''),
        GasProduct(id: '6', providerName: 'Arewa Gaz', gasType: '12.5kg (Moyen)', price: 3750, stock: 20, imageUrl: ''),
      ];
    }

    _nonAuthCenters = [
      { "name": "Centre Artisanal Saga", "reason": "Non conforme", "location": "Saga" },
      { "name": "Vente Gamkalé", "reason": "Illégal", "location": "Gamkalé" },
      { "name": "Dépôt Talladjé", "reason": "Risque explosion", "location": "Talladjé" },
    ];

    _isLoading = false;
    notifyListeners();
  }

}
