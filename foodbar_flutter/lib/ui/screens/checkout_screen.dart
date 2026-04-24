import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/providers/cart_provider.dart';
import '../../data/providers/config_provider.dart';
import '../theme/app_theme.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  String _paymentMethod = 'Cash on Delivery';

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final config = Provider.of<ConfigProvider>(context);
    final total = cart.totalAmount + config.deliveryFee;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('CHECKOUT'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Delivery Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Enter your full delivery address...',
              ),
            ),
            const SizedBox(height: 24),
            const Text('Contact Number', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                hintText: 'Enter your phone number...',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
            ),
            const SizedBox(height: 32),
            const Text('Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  RadioListTile(
                    title: const Text('Cash on Delivery'),
                    value: 'Cash on Delivery',
                    groupValue: _paymentMethod,
                    activeColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _paymentMethod = val.toString()),
                  ),
                  const Divider(color: AppTheme.border, height: 1),
                  RadioListTile(
                    title: const Text('Online Payment (Disabled)'),
                    value: 'Online',
                    groupValue: _paymentMethod,
                    activeColor: AppTheme.primary,
                    onChanged: null, // Disabled for now
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text('Order Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildSummaryRow('Subtotal', 'Rs. ${cart.totalAmount.toStringAsFixed(0)}'),
            _buildSummaryRow('Delivery Fee', 'Rs. ${config.deliveryFee.toStringAsFixed(0)}'),
            const Divider(color: AppTheme.border, height: 32),
            _buildSummaryRow('Grand Total', 'Rs. ${total.toStringAsFixed(0)}', isTotal: true),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // Place Order Logic
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Order placed successfully!')),
                  );
                  cart.clear();
                  Navigator.of(context).popUntil((route) => route.isFirst);
                },
                child: const Text('PLACE ORDER'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: isTotal ? 18 : 14, color: isTotal ? AppTheme.textMain : AppTheme.textMuted)),
          Text(value, style: TextStyle(fontSize: isTotal ? 22 : 16, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal, color: isTotal ? AppTheme.primary : AppTheme.textMain)),
        ],
      ),
    );
  }
}
