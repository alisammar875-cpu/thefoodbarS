import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../data/providers/menu_provider.dart';
import '../../data/providers/config_provider.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    final menuProvider = Provider.of<MenuProvider>(context, listen: false);
    final configProvider = Provider.of<ConfigProvider>(context, listen: false);
    
    // Initial data fetching
    await Future.wait([
      menuProvider.fetchMenu(),
      configProvider.fetchConfig(),
    ]);

    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primary.withOpacity(0.05),
              ),
              child: Image.asset(
                'assets/images/logo.png',
                width: 120,
                height: 120,
              ),
            ).animate().scale(duration: 800.ms, curve: Curves.easeOutBack).fadeIn(),
            const SizedBox(height: 24),
            Text(
              'THE FOOD BAR',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 4,
                color: AppTheme.textMain,
              ),
            ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.5),
            const SizedBox(height: 8),
            Text(
              'Premium Taste, Delivered.',
              style: TextStyle(
                fontSize: 16,
                color: AppTheme.textMuted,
              ),
            ).animate().fadeIn(delay: 500.ms),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
            ).animate().fadeIn(delay: 800.ms),
          ],
        ),
      ),
    );
  }
}
