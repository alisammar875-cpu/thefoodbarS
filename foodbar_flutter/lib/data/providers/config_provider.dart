import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class ConfigProvider with ChangeNotifier {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Map<String, dynamic> _config = {};
  Map<String, dynamic> get config => _config;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  ConfigProvider() {
    fetchConfig();
  }

  Future<void> fetchConfig() async {
    try {
      DocumentSnapshot doc = await _db.collection('site_config').doc('main').get();
      if (doc.exists) {
        _config = doc.data() as Map<String, dynamic>;
      }
    } catch (e) {
      print('Error fetching config: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  bool get maintenanceMode => _config['maintenanceMode'] ?? false;
  double get deliveryFee => (_config['deliveryFee'] ?? 0).toDouble();
  String get announcement => _config['announcementBanner'] ?? '';
}
