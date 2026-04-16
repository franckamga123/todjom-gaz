import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:todjom_gaz/core/theme.dart';
import 'package:todjom_gaz/presentation/pages/tracking_page.dart';

class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Commandes', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 3, // Simulation
        itemBuilder: (context, index) {
          final statuses = ['En livraison', 'En attente', 'Livrée'];
          final colors = [Colors.blue, Colors.orange, Colors.green];
          
          return FadeInUp(
            delay: Duration(milliseconds: 200 * index),
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: TodjomTheme.darkGray,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Commande #TG-${1024 + index}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          const Text('12 Avril 2026, 14:30', style: TextStyle(fontSize: 12, color: Colors.white38)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: colors[index].withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          statuses[index],
                          style: TextStyle(color: colors[index], fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 30, color: Colors.white10),
                  Row(
                    children: [
                      const Icon(Icons.local_gas_station, color: TodjomTheme.orange),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text('Bouteille Niger Gaz - 12.5kg', style: TextStyle(fontSize: 14)),
                      ),
                      const Text('7 500 F', style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (index == 0) // Si en livraison
                    ElevatedButton.icon(
                      onPressed: () {
                         Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => TrackingPage(orderId: '#TG-${1024 + index}'),
                          ),
                        );
                      },
                      icon: const Icon(Icons.map_outlined),
                      label: const Text('SUIVRE LE LIVREUR'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        minimumSize: const Size(double.infinity, 45),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
