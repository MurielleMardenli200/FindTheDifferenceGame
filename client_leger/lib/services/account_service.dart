import 'dart:convert';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:http/http.dart' as http;

class AccountService {
  final String baseUrl = environment['serverUrl'];

  Future<http.Response> logInAccount(UserInfo user) async {
    return http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(user.toMap()),
    );
  }

  Future<http.Response> registerAccount(UserInfo user) async {
    try {
      return http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(user.toMap()),
      );
    } catch (error) {
      throw error;
    }
  }
}
