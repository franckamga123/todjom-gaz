import 'package:flutter/material.dart';
import 'package:todjom_gaz/presentation/pages/home_page.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:todjom_gaz/core/theme.dart';
import 'package:todjom_gaz/presentation/providers/auth_provider.dart';
import 'package:todjom_gaz/presentation/pages/register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          height: MediaQuery.of(context).size.height,
          padding: const EdgeInsets.symmetric(horizontal: 30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FadeInDown(
                duration: const Duration(milliseconds: 800),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: TodjomTheme.orange.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.local_gas_station, size: 80, color: TodjomTheme.orange),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              FadeInDown(
                delay: const Duration(milliseconds: 200),
                child: const Text(
                  'Bienvenue',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
              ),
              FadeInDown(
                delay: const Duration(milliseconds: 400),
                child: const Text(
                  'Connectez-vous pour commander votre gaz',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white54),
                ),
              ),
              const SizedBox(height: 50),
              FadeInLeft(
                delay: const Duration(milliseconds: 600),
                child: TextField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    hintText: 'Email',
                    prefixIcon: const Icon(Icons.email_outlined, color: TodjomTheme.orange),
                    filled: true,
                    fillColor: TodjomTheme.darkGray,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              FadeInRight(
                delay: const Duration(milliseconds: 600),
                child: TextField(
                  controller: _passwordController,
                  obscureText: _obscureText,
                  decoration: InputDecoration(
                    hintText: 'Mot de passe',
                    prefixIcon: const Icon(Icons.lock_outline, color: TodjomTheme.orange),
                    suffixIcon: IconButton(
                      icon: Icon(_obscureText ? Icons.visibility_off : Icons.visibility, color: Colors.white38),
                      onPressed: () => setState(() => _obscureText = !_obscureText),
                    ),
                    filled: true,
                    fillColor: TodjomTheme.darkGray,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              FadeInUp(
                delay: const Duration(milliseconds: 800),
                child: ElevatedButton(
                  onPressed: authProvider.isLoading ? null : () async {
                    final success = await authProvider.login(
                      _emailController.text,
                      _passwordController.text,
                    );
                    if (success && mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => HomePage()),
                      );
                    } else if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Identifiants invalides')),
                      );
                    }
                  },
                  child: authProvider.isLoading 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('SE CONNECTER'),
                ),
              ),
              const SizedBox(height: 30),
              FadeIn(
                delay: const Duration(milliseconds: 1000),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Vous n'avez pas de compte ? "),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const RegisterPage()),
                        );
                      },
                      child: const Text('S\'inscrire', style: TextStyle(color: TodjomTheme.orange, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
