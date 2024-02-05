import 'dart:collection';

import 'package:client_leger/interfaces/chat_message.dart';
import 'package:flutter/material.dart';

class ChatService extends ChangeNotifier {
  // FIXME: Only for testing purposes
  final String _username = 'client_leger_user';

  final List<ChatMessage> _messages = [
    ChatMessage(
        author: 'client_leger_user',
        content: 'Hello everyone!',
        time: DateTime.now()),
    ChatMessage(
        author: 'joe',
        content: 'Hello!',
        time: DateTime.now().add(const Duration(seconds: 10))),
    ChatMessage(
        author: 'joe',
        content: 'You are writting!',
        time: DateTime.now().add(const Duration(seconds: 20))),
    ChatMessage(
        author: 'client_leger_user',
        content: 'Yes',
        time: DateTime.now().add(const Duration(seconds: 30))),
  ];

  UnmodifiableListView<ChatMessage> get messages =>
      UnmodifiableListView(_messages);

  void addMessage(ChatMessage message) {
    _messages.add(message);
    notifyListeners();
  }

  bool isMessageSentByUser(ChatMessage message) {
    return _username == message.author;
  }
}
