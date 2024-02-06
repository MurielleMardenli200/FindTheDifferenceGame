import 'package:client_leger/interfaces/chat_message.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';

// This widget is based on https://api.flutter.dev/flutter/material/TextField-class.html

class MessageInputField extends StatefulWidget {
  const MessageInputField({super.key});

  @override
  State<MessageInputField> createState() => _MessageInputFieldState();
}

class _MessageInputFieldState extends State<MessageInputField> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    void sendMessage(String message) {
      // FIXME: Validate message is not empty
      _controller.text = '';
      ChatService.to.addMessage(ChatMessage(
          author: 'client_leger_user', content: message, time: DateTime.now()));
    }

    return Center(
      child: TextField(
        controller: _controller,
        onSubmitted: (String message) {
          sendMessage(message);
        },
        decoration: InputDecoration(
          suffixIcon: IconButton(
            icon: const Icon(Icons.send_rounded),
            onPressed: () {
              sendMessage(_controller.text);
            },
          ),
          border: const OutlineInputBorder(),
        ),
      ),
    );
  }
}
