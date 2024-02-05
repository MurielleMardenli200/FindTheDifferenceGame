import 'dart:collection';

import 'package:client_leger/interfaces/chat_message.dart';
import 'package:flutter/material.dart';

class ChatService extends ChangeNotifier {
  // FIXME: Only for testing purposes
  final String _username = 'client_leger_user';

  final List<ChatMessage> _messages = [];

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
