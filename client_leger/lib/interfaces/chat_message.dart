class ChatMessage {
  String author;
  String content;
  DateTime time;

  ChatMessage(
      {required this.author, required this.content, required this.time});

  Map<String, dynamic> toMap() {
    return {
      'author': author,
      'content': content,
      'time': time.toUtc().millisecondsSinceEpoch,
    };
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'author': String author,
        'content': String content,
        'time': int time,
      } =>
        ChatMessage(
            author: author,
            content: content,
            time: DateTime.fromMillisecondsSinceEpoch(time)),
      _ => throw const FormatException('Cannot construct ChatMessage.'),
    };
  }
}
