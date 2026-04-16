import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:todjom_gaz/core/theme.dart';
import 'package:animate_do/animate_do.dart';

class TrackingPage extends StatefulWidget {
  final String orderId;
  const TrackingPage({super.key, required this.orderId});

  @override
  State<TrackingPage> createState() => _TrackingPageState();
}

class _TrackingPageState extends State<TrackingPage> {
  final Completer<GoogleMapController> _controller = Completer();
  
  // Position initiale (Niamey)
  static const CameraPosition _niameyCenter = CameraPosition(
    target: LatLng(13.5127, 2.1128),
    zoom: 14.4746,
  );

  late LatLng _deliveryPos;
  late Marker _deliveryMarker;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _deliveryPos = const LatLng(13.5150, 2.1150);
    _updateMarker();
    _startSimulation();
  }

  void _updateMarker() {
    _deliveryMarker = Marker(
      markerId: const MarkerId('delivery_guy'),
      position: _deliveryPos,
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      infoWindow: const InfoWindow(title: 'Livreur Todjom'),
    );
  }

  void _startSimulation() {
    // Simule le déplacement du livreur toutes le 2 secondes
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted) {
        setState(() {
          _deliveryPos = LatLng(
            _deliveryPos.latitude + 0.0002, 
            _deliveryPos.longitude + 0.0001
          );
          _updateMarker();
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Suivi Commande ${widget.orderId}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Stack(
        children: [
          GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: _niameyCenter,
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
            },
            markers: {
              _deliveryMarker,
              const Marker(
                markerId: MarkerId('customer'),
                position: LatLng(13.5200, 2.1200),
                infoWindow: InfoWindow(title: 'Moi'),
              ),
            },
            style: '''[
              {"elementType": "geometry", "stylers": [{"color": "#212121"}]},
              {"elementType": "labels.text.fill", "stylers": [{"color": "#757575"}]},
              {"elementType": "labels.text.stroke", "stylers": [{"color": "#212121"}]}
            ]''', // Dark mode maps
          ),
          
          // Bottom Info Card
          Positioned(
            bottom: 20, left: 20, right: 20,
            child: FadeInUp(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: TodjomTheme.darkGray,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black54, blurRadius: 10, offset: Offset(0, 5))],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        const CircleAvatar(
                          radius: 25,
                          backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=driver'),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Issaka Moussa', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text('Livreur certifié Todjom', style: TextStyle(color: Colors.white54, fontSize: 12)),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () {},
                          icon: const Icon(Icons.phone, color: Colors.green),
                          style: IconButton.styleFrom(backgroundColor: Colors.green.withOpacity(0.1)),
                        ),
                      ],
                    ),
                    const Divider(height: 30, color: Colors.white10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Temps estimé', style: TextStyle(color: Colors.white54, fontSize: 12)),
                            Text('8 - 12 min', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: TodjomTheme.orange)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: const [
                            Text('Distance', style: TextStyle(color: Colors.white54, fontSize: 12)),
                            Text('2.5 km', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
