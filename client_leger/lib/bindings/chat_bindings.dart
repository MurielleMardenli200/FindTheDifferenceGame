import 'package:client_leger/services/chat_service.dart';
import 'package:get/instance_manager.dart';

class ChatBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<ChatService>(ChatService(), permanent: true);
  }
}
