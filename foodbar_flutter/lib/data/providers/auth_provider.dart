import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthProvider with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? _user;
  User? get user => _user;

  bool _isAdmin = false;
  bool get isAdmin => _isAdmin;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _auth.authStateChanges().listen((User? user) {
      _user = user;
      if (user != null) {
        _checkAdminStatus(user.uid);
      } else {
        _isAdmin = false;
        _isLoading = false;
        notifyListeners();
      }
    });
  }

  Future<void> _checkAdminStatus(String uid) async {
    try {
      DocumentSnapshot doc = await _db.collection('users').doc(uid).get();
      if (doc.exists) {
        _isAdmin = (doc.data() as Map<String, dynamic>)['role'] == 'admin';
      }
    } catch (e) {
      print('Error checking admin status: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      return true;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<bool> signup(String email, String password, String name) async {
    try {
      UserCredential cred = await _auth.createUserWithEmailAndPassword(email: email, password: password);
      if (cred.user != null) {
        await _db.collection('users').doc(cred.user!.uid).set({
          'name': name,
          'email': email,
          'role': 'customer',
          'createdAt': FieldValue.serverTimestamp(),
        });
      }
      return true;
    } catch (e) {
      print('Signup error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}
