import 'package:flutter_test/flutter_test.dart';
import 'package:foodbar_flutter/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    // Note: Since the app uses Firebase and Providers, this test might need more setup
    // to pass, but this fixes the build error in the test file.
    await tester.pumpWidget(const FoodBarApp());
    expect(find.byType(FoodBarApp), findsOneWidget);
  });
}
