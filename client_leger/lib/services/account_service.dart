import 'dart:convert';
import 'dart:io';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/pages/account_creation.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_interceptor/http_interceptor.dart';

class AccountService {
  String username = '';
  final String baseUrl = environment['serverUrl'];
  final httpClient =
      InterceptedClient.build(interceptors: [AuthenticationInterceptor()]);

  Future<bool> logInAccount(String username, String password) async {
    final response = await httpClient.post(Uri.parse('$baseUrl/auth/login'),
        body: jsonEncode(<String, String>{
          'username': username,
          'password': password,
        }));
    if (response.statusCode == HttpStatus.created) {
      final decodedResponse =
          json.decode(response.body) as Map<String, dynamic>;
      TokenService().setTokens(
          decodedResponse["accessToken"], decodedResponse["refreshToken"]);
      return true;
    }
    return false;
  }

  Future<bool> registerAccount(UserInfo user) async {
    final response = await httpClient.post(
      Uri.parse('$baseUrl/auth/signup'),
      body: jsonEncode(user.toMap()),
    );
    return response.statusCode == HttpStatus.created;
  }
}
