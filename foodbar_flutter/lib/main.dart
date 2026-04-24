import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'ui/theme/app_theme.dart';
import 'data/providers/auth_provider.dart';
import 'data/providers/cart_provider.dart';
import 'data/providers/menu_provider.dart';
import 'data/providers/config_provider.dart';
import 'ui/screens/home_screen.dart';
import 'ui/screens/login_screen.dart';
import 'ui/screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Multi-platform Firebase Initialization
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: 'AIzaSyDmiGtND8DDnQT1ml0iqwW_0VaNJfP5aq4',
      appId: '1:510471626:web:aadd97e8641cb5659df333',
      messagingSenderId: '510471626',
      projectId: 'thefoodbar-d7ffd',
      authDomain: 'thefoodbar-d7ffd.firebaseapp.com',
      storageBucket: 'thefoodbar-d7ffd.firebasestorage.app',
      measurementId: 'G-7JQB9NF5Q0',
    ),
  );
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => MenuProvider()),
        ChangeNotifierProvider(create: (_) => ConfigProvider()),
      ],
      child: const FoodBarApp(),
    ),
  );
}

class FoodBarApp extends StatelessWidget {
  const FoodBarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Food Bar',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
      },
    );
  }
}
