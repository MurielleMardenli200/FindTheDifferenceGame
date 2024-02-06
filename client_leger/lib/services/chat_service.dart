import 'package:client_leger/interfaces/chat_message.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:get/get_rx/src/rx_types/rx_types.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:get/instance_manager.dart';

class ChatService extends GetxController {
  static ChatService get to => Get.find();

  _newMessageHandler(message) => messages.add(ChatMessage.fromJson(message));

  @override
  void onInit() {
    SocketService.to.on(SocketEvent.message, _newMessageHandler);
    super.onInit();
  }

  @override
  void onClose() {
    SocketService.to.removeEventListener(_newMessageHandler);
    super.onClose();
  }

  // FIXME: Only for testing purposes
  final String _username = 'client_leger_user';

  RxList<ChatMessage> messages = [
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
  ].obs;

  void addMessage(ChatMessage message) {
    messages.add(message);
    SocketService.to.send(SocketEvent.message, message);
  }

  bool isMessageSentByUser(ChatMessage message) {
    return _username == message.author;
  }
}
