import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:get/instance_manager.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

typedef SocketCallback = dynamic Function(dynamic);

class SocketService extends GetxController {
  late IO.Socket _socket;

  static SocketService get to => Get.find();

  @override
  void onInit() {
    _connect();
    super.onInit();
  }

  @override
  void onClose() {
    _disconnect();
    super.onClose();
  }

  void _connect() {
    // FIXME: Only for testing purposes
    _socket = IO.io(
        'http://10.0.0.244:3000',
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .build());

    _socket.connect();
  }

  void _disconnect() {
    _socket.dispose();
  }

  void removeEventListener(SocketCallback listener) {
    _socket.offAny(listener as dynamic);
  }

  void send(SocketEvent event, dynamic data) {
    _socket.emit(event.name, data.toMap());
  }

  void on(SocketEvent event, SocketCallback callback) {
    _socket.on(event.name, callback);
  }
}

enum SocketEvent { message }
