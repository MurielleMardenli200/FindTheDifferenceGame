import 'package:client_leger/interfaces/chat_message.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';

class MessageBubble extends StatelessWidget {
  const MessageBubble({
    super.key,
    required this.message,
  });

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    AlignmentGeometry alignment = ChatService.to.isMessageSentByUser(message)
        ? Alignment.centerRight
        : Alignment.centerLeft;

    return Align(
      alignment: alignment,
      child: Text(
          '${message.time.hour}:${message.time.minute}:${message.time.second} ${message.author}: ${message.content}'),
    );
  }
}
