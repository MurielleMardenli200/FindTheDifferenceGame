import 'package:client_leger/interfaces/user-info.dart';
import 'package:env_variables/env_variables.dart';
import 'package:http/http.dart' as http;

class AccountService {
  final String baseUrl = EnvVariables.fromEnvironment('serverUrl');

  Future<http.Response> logInAccount(UserInfo user) async {
    return http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: user,
    );
  }
  
  Future<http.Response> registerAccount(UserInfo user) async {
    return http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: user,
    );
  }
  
}
