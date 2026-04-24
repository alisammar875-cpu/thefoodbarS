import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CategoryChip extends StatelessWidget {
  final String category;
  const CategoryChip({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    String emoji = '🍔';
    switch (category) {
      case 'Burgers': emoji = '🍔'; break;
      case 'Wraps': emoji = '🌯'; break;
      case 'Pizza': emoji = '🍕'; break;
      case 'Fries & Sides': emoji = '🍟'; break;
      case 'Drinks': emoji = '🥤'; break;
      case 'Desserts': emoji = '🍰'; break;
      case 'Deals': emoji = '🏷️'; break;
    }

    return Container(
      width: 80,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(
            category,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
