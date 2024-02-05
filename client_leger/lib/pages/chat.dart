import 'package:client_leger/services/chat_service.dart';
import 'package:client_leger/widgets/message_bubble.dart';
import 'package:client_leger/widgets/message_input_field.dart';
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
          MessageBubble(message: message),
        // FIXME: Put the message bar at the bottom
        // Based on https://stackoverflow.com/questions/45746636/trying-to-bottom-center-an-item-in-a-column-but-it-keeps-left-aligning
        const Align(
          alignment: FractionalOffset.bottomCenter,
          child: Padding(
              padding: EdgeInsets.only(bottom: 12.0),
              child: MessageInputField()),
        ),
      ],
    );
  }
}
