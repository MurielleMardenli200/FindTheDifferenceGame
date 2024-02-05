import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    var chatService = context.watch<ChatService>();

    return ListView(
      children: [
        for (var message in chatService.messages)
          Text(
              '${message.time.toLocal()} ${message.author}: ${message.content}'),
      ],
    );
  }
}
