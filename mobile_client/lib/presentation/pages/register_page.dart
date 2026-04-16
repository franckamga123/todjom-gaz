import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:todjom_gaz/core/theme.dart';
import 'package:todjom_gaz/presentation/providers/auth_provider.dart';
import 'package:todjom_gaz/core/contracts.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'client'; // 'client', 'delivery', 'distributor'
  
  // Specific fields
  final _shopNameController = TextEditingController(); // for distributor
  final _vehicleController = TextEditingController(); // for delivery
  final _licenseController = TextEditingController(); // for delivery

  bool _isLoading = false;
  bool _contractAccepted = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Créer un compte')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FadeInDown(
              child: const Text(
                'Rejoignez TODJOM GAZ',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            const Text('Choisissez votre rôle pour commencer', style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 30),

            // Role Selector
            Row(
              children: [
                _roleIcon('client', Icons.person, 'Client'),
                _roleIcon('delivery', Icons.moped, 'Livreur'),
                _roleIcon('distributor', Icons.store, 'Point Vente'),
              ],
            ),
            const SizedBox(height: 30),

            FadeInUp(
              child: TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: _selectedRole == 'client' ? 'Nom complet' : 'Nom responsable',
                  prefixIcon: const Icon(Icons.person_outline, color: TodjomTheme.orange),
                  filled: true,
                  fillColor: TodjomTheme.darkGray,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FadeInUp(
              child: TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'Téléphone',
                  prefixIcon: const Icon(Icons.phone_outlined, color: TodjomTheme.orange),
                  filled: true,
                  fillColor: TodjomTheme.darkGray,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Role specific fields
            if (_selectedRole == 'distributor') ...[
              FadeInUp(
                child: TextField(
                  controller: _shopNameController,
                  decoration: InputDecoration(
                    hintText: 'Nom de la Boutique',
                    prefixIcon: const Icon(Icons.shopping_bag_outlined, color: TodjomTheme.orange),
                    filled: true, fillColor: TodjomTheme.darkGray,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            if (_selectedRole == 'delivery') ...[
              FadeInUp(
                child: TextField(
                  controller: _vehicleController,
                  decoration: InputDecoration(
                    hintText: 'Type de véhicule (Moto/Tricycle)',
                    prefixIcon: const Icon(Icons.delivery_dining, color: TodjomTheme.orange),
                    filled: true, fillColor: TodjomTheme.darkGray,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              FadeInUp(
                child: TextField(
                  controller: _licenseController,
                  decoration: InputDecoration(
                    hintText: 'Numéro de Permis / ID',
                    prefixIcon: const Icon(Icons.badge_outlined, color: TodjomTheme.orange),
                    filled: true, fillColor: TodjomTheme.darkGray,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            FadeInUp(
              child: TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Mot de passe',
                  prefixIcon: const Icon(Icons.lock_outline, color: TodjomTheme.orange),
                  filled: true,
                  fillColor: TodjomTheme.darkGray,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
            ),
            const SizedBox(height: 20),

            if (_selectedRole != 'client') ...[
              FadeInUp(
                child: Row(
                  children: [
                    Checkbox(
                      value: _contractAccepted,
                      activeColor: TodjomTheme.orange,
                      onChanged: (val) => setState(() => _contractAccepted = val ?? false),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: _showContract,
                        child: const Text.rich(
                          TextSpan(
                            text: "J'accepte les termes du ",
                            children: [
                              TextSpan(
                                text: "Contrat de Partenariat",
                                style: TextStyle(color: TodjomTheme.orange, decoration: TextDecoration.underline),
                              )
                            ],
                          ),
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
            ],

            FadeInUp(
              child: ElevatedButton(
                onPressed: (_isLoading || (_selectedRole != 'client' && !_contractAccepted)) ? null : _register,
                child: _isLoading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text("S'INSCRIRE"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleIcon(String role, IconData icon, String label) {
    bool selected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRole = role),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: selected ? TodjomTheme.orange.withOpacity(0.1) : TodjomTheme.darkGray,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: selected ? TodjomTheme.orange : Colors.transparent),
          ),
          child: Column(
            children: [
              Icon(icon, color: selected ? TodjomTheme.orange : Colors.white38),
              const SizedBox(height: 8),
              Text(label, style: TextStyle(
                fontSize: 10, 
                color: selected ? Colors.white : Colors.white38,
                fontWeight: selected ? FontWeight.bold : FontWeight.normal
              )),
            ],
          ),
        ),
      ),
    );
  }

  void _showContract() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: TodjomTheme.darkGray,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Expanded(
              child: Markdown(
                data: Contracts.getContract(_selectedRole),
                styleSheet: MarkdownStyleSheet(
                  p: const TextStyle(color: Colors.white70),
                  h1: const TextStyle(color: TodjomTheme.orange, fontSize: 20, fontWeight: FontWeight.bold),
                  h2: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                setState(() => _contractAccepted = true);
                Navigator.pop(context);
              },
              child: const Text("J'AI LU ET J'ACCEPTE"),
            )
          ],
        ),
      ),
    );
  }

  Future<void> _register() async {
    setState(() => _isLoading = true);
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    Map<String, dynamic> extraData = {
      'has_accepted_contract': _contractAccepted,
    };

    if (_selectedRole == 'distributor') {
      extraData['shop_name'] = _shopNameController.text;
    } else if (_selectedRole == 'delivery') {
      extraData['vehicle_type'] = _vehicleController.text;
      extraData['license_number'] = _licenseController.text;
    }

    final success = await authProvider.register(
      name: _nameController.text,
      phone: _phoneController.text,
      password: _passwordController.text,
      role: _selectedRole,
      extraData: extraData,
    );
    
    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_selectedRole == 'client' 
              ? 'Bienvenue sur TODJOM GAZ ! Vous pouvez maintenant vous connecter.' 
              : 'Inscription réussie ! Votre dossier est en cours de revue par TODJOM.'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de l\'inscription. Veuillez réessayer.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
