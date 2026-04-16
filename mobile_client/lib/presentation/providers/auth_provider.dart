import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:todjom_gaz/core/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  bool _isLoading = false;
  Map<String, dynamic>? _user;

  bool get isLoading => _isLoading;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _user != null;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.instance.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['token']);
        _user = data['user'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login Error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String name,
    required String phone,
    required String password,
    required String role,
    Map<String, dynamic>? extraData,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.instance.post('/auth/register', data: {
        'full_name': name,
        'phone': phone,
        'password': password,
        'role': role,
        ...?extraData,
      });

      if (response.statusCode == 201) {
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Register Error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _user = null;
    notifyListeners();
  }
}
