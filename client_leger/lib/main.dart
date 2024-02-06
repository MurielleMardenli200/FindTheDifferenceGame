import 'package:client_leger/bindings/chat_bindings.dart';
import 'package:client_leger/bindings/global_bingings.dart';
import 'package:client_leger/pages/chat.dart';
import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      initialRoute: '/chat',
      initialBinding: GlobalBinding(),
      getPages: [
        GetPage(
            name: '/chat',
            page: () => const ChatPage(),
            binding: ChatBinding()),
      ],
    );
  }
}
