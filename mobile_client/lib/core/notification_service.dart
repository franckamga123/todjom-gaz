import 'package:flutter/material.dart';

class NotificationService {
  static void showNotification(BuildContext context, {required String title, required String body}) {
    // Dans un cas réel, cela passerait par flutter_local_notifications ou FCM
    // Ici, nous simulons une notification in-app pour le test
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.only(top: 10, left: 10, right: 10),
        padding: const EdgeInsets.all(16),
        backgroundColor: Colors.blueAccent,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            Text(body, style: const TextStyle(fontSize: 12, color: Colors.white70)),
          ],
        ),
      ),
    );
  }
}
