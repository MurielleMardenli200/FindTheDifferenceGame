// import 'package:client_leger/firebase_options.dart';
import 'package:client_leger/pages/account_creation.dart';
import 'package:client_leger/pages/login.dart';
// import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
//   await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spot Seven',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      routes: {
        '/login': (context) => const LoginPage(),
        '/account-creation': (context) => const AccountCreationPage(),
      },
      home: const LoginPage(),
    );
  }
}
