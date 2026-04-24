import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/product.dart';

class MenuProvider with ChangeNotifier {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  
  List<Product> _items = [];
  List<Product> get items => _items;
  
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  List<String> _categories = [];
  List<String> get categories => _categories;

  Future<void> fetchMenu() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Fetch Categories
      final catSnap = await _db.collection('categories').orderBy('displayOrder').get();
      _categories = catSnap.docs.map((doc) => doc['name'] as String).toList();

      // Fetch Menu Items
      final menuSnap = await _db.collection('menu_items').where('isAvailable', isEqualTo: true).get();
      _items = menuSnap.docs.map((doc) => Product.fromFirestore(doc)).toList();
      
    } catch (e) {
      print('Error fetching menu: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<Product> getItemsByCategory(String category) {
    if (category == 'All') return _items;
    return _items.where((item) => item.category == category).toList();
  }

  List<Product> getFeaturedItems() {
    return _items.where((item) => item.isFeatured).toList();
  }
}
