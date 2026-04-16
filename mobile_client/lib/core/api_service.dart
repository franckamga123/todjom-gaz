import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final Dio _dio = Dio();
  // IP locale pour le test (à changer par l'IP du serveur en prod)
  // IMPORTANT: Remplacez l'IP ci-dessous par l'adresse IPv4 de votre serveur/PC actuel
  static const String baseUrl = 'http://192.168.1.218:3000/api'; 

  ApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (e, handler) {
        // Gérer les erreurs de token expiré ici
        return handler.next(e);
      },
    ));
  }

  Dio get instance => _dio;
}
