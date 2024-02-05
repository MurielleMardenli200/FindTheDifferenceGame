import 'package:client_leger/pages/chat.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ChatPageProvider extends StatelessWidget {
  const ChatPageProvider({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      // FIXME: Might want to inject using value instead
      create: (context) => ChatService(),
      child: const ChatPage(),
    );
  }
}
