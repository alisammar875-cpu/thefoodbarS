import 'package:cloud_firestore/cloud_firestore.dart';

class Product {
  final String id;
  final String name;
  final double price;
  final String category;
  final String imageUrl;
  final String description;
  final String shortDescription;
  final List<String> tags;
  final bool isAvailable;
  final bool isFeatured;
  final bool isNew;
  final double averageRating;
  final int reviewCount;
  final int prepTimeMinutes;
  final int calories;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.imageUrl,
    required this.description,
    required this.shortDescription,
    required this.tags,
    required this.isAvailable,
    required this.isFeatured,
    required this.isNew,
    required this.averageRating,
    required this.reviewCount,
    required this.prepTimeMinutes,
    required this.calories,
  });

  factory Product.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Product(
      id: doc.id,
      name: data['name'] ?? '',
      price: (data['price'] ?? 0).toDouble(),
      category: data['category'] ?? '',
      imageUrl: data['imageUrl'] ?? '',
      description: data['description'] ?? '',
      shortDescription: data['shortDescription'] ?? '',
      tags: List<String>.from(data['tags'] ?? []),
      isAvailable: data['isAvailable'] ?? true,
      isFeatured: data['isFeatured'] ?? false,
      isNew: data['isNew'] ?? false,
      averageRating: (data['averageRating'] ?? 0).toDouble(),
      reviewCount: data['reviewCount'] ?? 0,
      prepTimeMinutes: data['prepTimeMinutes'] ?? 15,
      calories: data['calories'] ?? 0,
    );
  }
}
