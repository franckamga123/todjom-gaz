import 'package:flutter/material.dart';
import 'package:todjom_gaz/core/api_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:dio/dio.dart';
import 'package:provider/provider.dart';
import 'package:todjom_gaz/core/theme.dart';
import 'package:todjom_gaz/presentation/providers/product_provider.dart';
import 'package:todjom_gaz/presentation/providers/auth_provider.dart';
import 'package:todjom_gaz/presentation/providers/order_provider.dart';
import 'package:animate_do/animate_do.dart';
import 'package:todjom_gaz/data/models/product_model.dart';
import 'package:todjom_gaz/core/payment_service.dart'; // Added
import 'package:todjom_gaz/presentation/pages/orders_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

enum OrderStep { configuration, searchPayment, searching, matched, finalPayment, success }

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;
  int _orderQty = 1;
  String _selectedPayment = 'my_nita';
  bool _isPaying = false;
  OrderStep _currentStep = OrderStep.configuration;
  Map<String, dynamic>? _activeOrder;
  Map<String, dynamic>? _matchedDistributor;
  bool _isDelivery = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => 
      Provider.of<ProductProvider>(context, listen: false).fetchProducts()
    );
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = Provider.of<ProductProvider>(context);
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeContent(productProvider, user),
          const OrdersPage(),
          const Center(child: Text('Profil (Bientôt)')),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: TodjomTheme.darkGray,
        selectedItemColor: TodjomTheme.orange,
        unselectedItemColor: Colors.white38,
        showSelectedLabels: true,
        showUnselectedLabels: false,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Accueil'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag), label: 'Commandes'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }

  Widget _buildHomeContent(ProductProvider productProvider, Map<String, dynamic>? user) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Livrer à', style: TextStyle(fontSize: 12, color: Colors.white54)),
            Row(
              children: const [
                Icon(Icons.location_on, size: 14, color: TodjomTheme.orange),
                SizedBox(width: 4),
                Text('Niamey, Niger', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: TodjomTheme.orange,
            radius: 18,
            child: Text(user?['full_name']?[0] ?? 'U', style: const TextStyle(color: Colors.white)),
          ),
          const SizedBox(width: 16),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _sendEmergencyAlert(context),
        backgroundColor: Colors.red,
        icon: const Icon(Icons.sos, color: Colors.white, size: 30),
        label: const Text('SOS URGENCE', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FadeInLeft(
              child: Text(
                'Bonjour, ${user?['full_name'] ?? 'Invité'} 👋',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            const Text('De quel gaz avez-vous besoin ?', style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 24),
            
            // Search Bar
            FadeInUp(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: TodjomTheme.darkGray,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const TextField(
                  decoration: InputDecoration(
                    hintText: 'Rechercher une station ou un type...',
                    border: InputBorder.none,
                    icon: Icon(Icons.search, color: Colors.white38),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),
            
            // Promo Banner
            FadeInRight(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [TodjomTheme.orange, Color(0xFFFFB347)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Promotion Spéciale', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          SizedBox(height: 8),
                          Text('-10% sur votre 1ère recharge via l\'app', style: TextStyle(fontSize: 12)),
                        ],
                      ),
                    ),
                    const Icon(Icons.local_offer, size: 50, color: Colors.white24),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),

            const Text('Nos Produits', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            // Product Grid
            // Product Grid
            productProvider.isLoading 
              ? const Center(child: CircularProgressIndicator(color: TodjomTheme.orange))
              : GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.75,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                  ),
                  itemCount: productProvider.products.length,
                  itemBuilder: (context, index) {
                    final product = productProvider.products[index];
                    return FadeInUp(
                      delay: Duration(milliseconds: 100 * index),
                      child: GestureDetector(
                        onTap: () => _showOrderSheet(context, product),
                        child: Container(
                          decoration: BoxDecoration(
                            color: TodjomTheme.darkGray,
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Center(
                                  child: Image.network(product.imageUrl.isNotEmpty ? product.imageUrl : 'https://cdn-icons-png.flaticon.com/512/8243/8243003.png', height: 80),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(product.providerName, style: const TextStyle(color: TodjomTheme.orange, fontSize: 10, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text(product.gasType, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('${product.price.toInt()} F', style: const TextStyle(fontWeight: FontWeight.bold)),
                                        const Icon(Icons.add_circle, color: TodjomTheme.orange, size: 24),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
            const SizedBox(height: 30),
            
            const Text('Alerte Sécurité', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.redAccent)),

            const SizedBox(height: 4),
            const Text('Centres non-homologués à éviter', style: TextStyle(color: Colors.white38, fontSize: 12)),
            const SizedBox(height: 16),
            
            Column(
              children: productProvider.nonAuthCenters.map((center) => FadeInLeft(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: Colors.red.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(center['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Text(center['location']!, style: const TextStyle(fontSize: 12, color: Colors.white54)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          center['reason']!, 
                          style: const TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              )).toList(),
            ),
            const SizedBox(height: 100), // Space for FAB
          ],
        ),
      ),
    );

  }

  void _showOrderSheet(BuildContext context, GasProduct product) {
    _currentStep = OrderStep.configuration;
    _activeOrder = null;
    _matchedDistributor = null;
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: TodjomTheme.darkGray,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) {
          return Container(
            padding: const EdgeInsets.all(24),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.8),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   _buildStepsHeader(),
                   const SizedBox(height: 20),
                   if (_currentStep == OrderStep.configuration) _buildConfigStep(setSheetState, product),
                   if (_currentStep == OrderStep.searchPayment) _buildSearchPaymentStep(setSheetState, product),
                   if (_currentStep == OrderStep.searching) _buildSearchingStep(setSheetState),
                   if (_currentStep == OrderStep.matched) _buildMatchedStep(setSheetState),
                   if (_currentStep == OrderStep.finalPayment) _buildFinalPaymentStep(setSheetState, product),
                   const SizedBox(height: 20),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStepsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        bool completed = index < _currentStep.index;
        bool active = index == _currentStep.index;
        return Row(
          children: [
            Container(
              width: 24, height: 24,
              decoration: BoxDecoration(
                color: active ? TodjomTheme.orange : (completed ? Colors.green : Colors.white10),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: completed 
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : Text('${index + 1}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
            if (index < 4) Container(width: 20, height: 2, color: completed ? Colors.green : Colors.white10),
          ],
        );
      }),
    );
  }

  Widget _buildConfigStep(StateSetter setSheetState, GasProduct product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(product.gasType, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        Text(product.providerName, style: const TextStyle(color: TodjomTheme.orange, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        const Text('Quantité', style: TextStyle(fontWeight: FontWeight.bold)),
        Row(
          children: [
            IconButton(onPressed: () => setSheetState(() => _orderQty > 1 ? _orderQty-- : null), icon: const Icon(Icons.remove_circle_outline)),
            Text('$_orderQty', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            IconButton(onPressed: () => setSheetState(() => _orderQty++), icon: const Icon(Icons.add_circle_outline, color: TodjomTheme.orange)),
          ],
        ),
        const SizedBox(height: 30),
        ElevatedButton(
          onPressed: () => setSheetState(() => _currentStep = OrderStep.searchPayment),
          child: const Text('CONTINUER'),
        ),
      ],
    );
  }

  Widget _buildSearchPaymentStep(StateSetter setSheetState, GasProduct product) {
    return Column(
      children: [
        const Icon(Icons.search, size: 60, color: TodjomTheme.orange),
        const SizedBox(height: 16),
        const Text('Frais de Recherche', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text(
          'Pour trouver le distributeur le plus proche avec du stock, des frais de 500 CFA s\'appliquent.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white54),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            _paymentOption(setSheetState, 'my_nita', 'My Nita'),
            const SizedBox(width: 12),
            _paymentOption(setSheetState, 'amana', 'Amana'),
          ],
        ),
        const SizedBox(height: 30),
        ElevatedButton(
          onPressed: () async {
            setSheetState(() => _isPaying = true);
            final orderProvider = Provider.of<OrderProvider>(context, listen: false);
            
            // 1. Initialiser la recherche (crée la commande en base)
            final order = await orderProvider.initiateSearch(
              productId: product.id,
              quantity: _orderQty,
              lat: 13.5127, // Mock Niamey
              lng: 2.1128,
              paymentMethod: _selectedPayment,
            );

            if (order != null) {
              _activeOrder = order;
              
              // 2. Payer les frais de recherche (500 CFA)
              final paymentResult = await orderProvider.payOrder(
                orderId: order['id'],
                amount: 500,
                phone: Provider.of<AuthProvider>(context, listen: false).user?['phone'] ?? '',
                method: _selectedPayment,
              );

              if (paymentResult != null && paymentResult['success']) {
                // Simulation: Le paiement est validé
                setSheetState(() {
                  _currentStep = OrderStep.searching;
                  _isPaying = false;
                });
                _startSearch(setSheetState);
              } else {
                setSheetState(() => _isPaying = false);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Échec du paiement')),
                );
              }
            } else {
              setSheetState(() => _isPaying = false);
            }
          },
          child: _isPaying ? const CircularProgressIndicator(color: Colors.white) : const Text('PAYER 500 CFA ET RECHERCHER'),
        ),
      ],
    );
  }

  void _startSearch(StateSetter setSheetState) async {
    // Simuler le radar pendant 3 secondes
    await Future.delayed(const Duration(seconds: 3));
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);
    final dist = await orderProvider.searchDistributor(_activeOrder!['id']);
    if (dist != null) {
      setSheetState(() {
        _matchedDistributor = dist;
        _currentStep = OrderStep.matched;
      });
    }
  }

  Widget _buildSearchingStep(StateSetter setSheetState) {
    return Column(
      children: [
        SizedBox(
          height: 200,
          width: 200,
          child: Stack(
            alignment: Alignment.center,
            children: [
              const RadarWidget(),
              const Icon(Icons.person_pin_circle, size: 40, color: Colors.white),
            ],
          ),
        ),
        const Text('Recherche en cours...', style: TextStyle(fontWeight: FontWeight.bold)),
        const Text('Nous localisons le stock le plus proche', style: TextStyle(color: Colors.white38, fontSize: 12)),
      ],
    );
  }

  Widget _buildMatchedStep(StateSetter setSheetState) {
    return Column(
      children: [
        const Icon(Icons.check_circle, color: Colors.green, size: 60),
        const SizedBox(height: 16),
        Text(_matchedDistributor?['shop_name'] ?? 'Distributeur Trouvé', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const Text('Ce distributeur a votre gaz en stock !', style: TextStyle(color: Colors.greenAccent, fontSize: 12)),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(15)),
          child: Column(
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on, color: TodjomTheme.orange, size: 16),
                  const SizedBox(width: 8),
                  const Text('À 1.2 km de vous', style: TextStyle(fontSize: 12)),
                ],
              ),
              const Divider(color: Colors.white10, height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _actionButton(Icons.call, 'Appeler', () {}),
                  _actionButton(Icons.directions, 'Itinéraire', () {}),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 30),
        Row(
          children: [
             Expanded(
               child: OutlinedButton(
                 onPressed: () => setSheetState(() {
                   _isDelivery = false;
                   _currentStep = OrderStep.finalPayment;
                 }),
                 child: const Text('J\'Y VAIS'),
               ),
             ),
             const SizedBox(width: 12),
             Expanded(
               child: ElevatedButton(
                 onPressed: () => setSheetState(() {
                   _isDelivery = true;
                   _currentStep = OrderStep.finalPayment;
                 }),
                 child: const Text('LIVRAISON'),
               ),
             ),
          ],
        ),
      ],
    );
  }

  Widget _buildFinalPaymentStep(StateSetter setSheetState, GasProduct product) {
    double gasPrice = product.price * _orderQty;
    double deliveryFee = _isDelivery ? 1500 : 0;
    double total = gasPrice + deliveryFee;

    return Column(
      children: [
        const Text('Résumé Final', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _summaryRow('Gaz (${product.gasType} x $_orderQty)', '${gasPrice.toInt()} F'),
        if (_isDelivery) _summaryRow('Frais Livraison', '${deliveryFee.toInt()} F'),
        const Divider(color: Colors.white24),
        _summaryRow('Total à payer', '${total.toInt()} F', isBold: true),
        const SizedBox(height: 30),
        ElevatedButton(
          onPressed: () async {
            setSheetState(() => _isPaying = true);
            final orderProvider = Provider.of<OrderProvider>(context, listen: false);
            
            // 1. Payer le montant total (Gaz + Livraison)
            final paymentResult = await orderProvider.payOrder(
              orderId: _activeOrder!['id'],
              amount: total,
              phone: Provider.of<AuthProvider>(context, listen: false).user?['phone'] ?? '',
              method: _selectedPayment,
            );

            if (paymentResult != null && paymentResult['success']) {
              // 2. Finaliser la commande
              final success = await orderProvider.finalizeOrder(
                orderId: _activeOrder!['id'],
                deliveryType: _isDelivery ? 'delivery' : 'pickup',
              );
              if (success) {
                Navigator.pop(context);
                _showSuccessDialog();
              }
            } else {
              setSheetState(() => _isPaying = false);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Échec du paiement final')),
              );
            }
          },
          child: _isPaying ? const CircularProgressIndicator(color: Colors.white) : const Text('CONFIRMER ET PAYER'),
        ),
      ],
    );
  }

  Widget _summaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.white54, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(value, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: isBold ? 18 : 14)),
        ],
      ),
    );
  }

  Widget _actionButton(IconData icon, String label, VoidCallback onTap) {
    return Column(
      children: [
        CircleAvatar(backgroundColor: TodjomTheme.orange.withOpacity(0.1), child: Icon(icon, color: TodjomTheme.orange, size: 20)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white54)),
      ],
    );
  }

  Widget _paymentOption(StateSetter setSheetState, String id, String label) {
    bool selected = _selectedPayment == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setSheetState(() => _selectedPayment = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? TodjomTheme.orange.withOpacity(0.2) : Colors.black26,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: selected ? TodjomTheme.orange : Colors.transparent),
          ),
          child: Text(label, textAlign: TextAlign.center, style: TextStyle(
            color: selected ? TodjomTheme.orange : Colors.white54,
            fontWeight: selected ? FontWeight.bold : FontWeight.normal,
          )),
        ),
      ),
    );
  }

  Future<void> _sendEmergencyAlert(BuildContext context) async {
    try {
      final position = await Geolocator.getCurrentPosition();
      final dio = Dio();
      
      // Appel API d'urgence
      await dio.post(
        '${ApiService.baseUrl}/emergency',
        data: {
          'lat': position.latitude,
          'lng': position.longitude,
          'media': null,
        },
      );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚨 ALERTE ENVOYÉE ! Les secours ont été prévenus.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'envoi de l\'alerte')),
        );
      }
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: TodjomTheme.darkGray,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            FadeInDown(child: const Icon(Icons.check_circle, color: Colors.green, size: 80)),
            const SizedBox(height: 20),
            const Text('Commande Réussie !', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            const Text('Votre gaz est en route. Un livreur vous contactera sous peu.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
              child: const Text('SUPER !'),
            ),
          ],
        ),
      ),
    );
  }
}
class RadarWidget extends StatefulWidget {
  const RadarWidget({super.key});

  @override
  State<RadarWidget> createState() => _RadarWidgetState();
}

class _RadarWidgetState extends State<RadarWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: RadarPainter(_controller.value),
          size: const Size(200, 200),
        );
      },
    );
  }
}

class RadarPainter extends CustomPainter {
  final double progress;
  RadarPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = TodjomTheme.orange.withOpacity(1 - progress)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    canvas.drawCircle(center, (size.width / 2) * progress, paint);
    canvas.drawCircle(center, (size.width / 2) * (progress > 0.5 ? progress - 0.5 : progress + 0.5), 
      paint..color = TodjomTheme.orange.withOpacity(1 - (progress > 0.5 ? progress - 0.5 : progress + 0.5)));
  }

  @override
  bool shouldRepaint(RadarPainter oldDelegate) => true;
}
