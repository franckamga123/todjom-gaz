import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TodjomTheme {
  static const Color orange = Color(0xFFFF8C00);
  static const Color black = Color(0xFF111111);
  static const Color darkGray = Color(0xFF1E1E1E);
  static const Color lightGray = Color(0xFFF5F5F5);

  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: orange,
    scaffoldBackgroundColor: black,
    cardColor: darkGray,
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary: orange,
      secondary: orange,
      surface: darkGray,
    ),
    textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      bodyLarge: const TextStyle(color: Colors.white70),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: orange,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
    ),
  );
}
