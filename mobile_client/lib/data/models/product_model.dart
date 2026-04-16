class GasProduct {
  final String id;
  final String providerName;
  final String gasType; // 6kg, 12.5kg, etc
  final double price;
  final int stock;
  final String imageUrl;

  GasProduct({
    required this.id,
    required this.providerName,
    required this.gasType,
    required this.price,
    required this.stock,
    required this.imageUrl,
  });

  factory GasProduct.fromJson(Map<String, dynamic> json) {
    return GasProduct(
      id: json['id'].toString(),
      providerName: json['supplier']?['company_name'] ?? 'Inconnu',
      gasType: json['gas_type'],
      price: double.tryParse(json['price'].toString()) ?? 0.0,
      stock: json['stock'] ?? 0,
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067800.png', // Placeholder
    );
  }
}
