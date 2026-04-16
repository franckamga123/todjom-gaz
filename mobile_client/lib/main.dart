import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:todjom_gaz/core/theme.dart';
import 'package:todjom_gaz/presentation/providers/auth_provider.dart';
import 'package:todjom_gaz/presentation/providers/product_provider.dart';
import 'package:todjom_gaz/presentation/providers/order_provider.dart'; // Added
import 'package:todjom_gaz/presentation/pages/login_page.dart';
import 'package:todjom_gaz/presentation/pages/home_page.dart'; // Added

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()), // Added
        ChangeNotifierProvider(create: (_) => OrderProvider()), // Added
      ],
      child: const TodjomApp(),
    ),
  );
}

class TodjomApp extends StatelessWidget {
  const TodjomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Todjom Gaz',
      debugShowCheckedModeBanner: false,
      theme: TodjomTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 3));
    if (!mounted) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.isAuthenticated) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomePage()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo placeholder
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: TodjomTheme.orange,
                borderRadius: BorderRadius.circular(30),
              ),
              child: const Icon(Icons.local_gas_station, size: 80, color: Colors.white),
            ),
            const SizedBox(height: 24),
            const Text(
              'TODJOM GAZ',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'La révolution du gaz au Niger',
              style: TextStyle(color: Colors.white54),
            ),
            const SizedBox(height: 50),
            const CircularProgressIndicator(color: TodjomTheme.orange),
          ],
        ),
      ),
    );
  }
}
