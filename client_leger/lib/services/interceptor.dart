import 'dart:convert';
import 'dart:io';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/exceptions/token_exceptions.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:http/http.dart' as http;
import 'package:http_interceptor/http_interceptor.dart';

class HttpClient {
  static final HttpClient _httpClient = HttpClient._internal();
  Client client =
      InterceptedClient.build(interceptors: [AuthenticationInterceptor()]);
  factory HttpClient() {
    return _httpClient;
  }
  HttpClient._internal();
}

class AuthenticationInterceptor extends RetryPolicy
    implements InterceptorContract {
  final String baseUrl = environment['serverUrl'];

  @override
  Future<BaseRequest> interceptRequest({required BaseRequest request}) async {
    print("Intercepting request to ${request.url.toString()}");
    request.headers["Content-Type"] = "application/json;charset=UTF-8";

    if (request.url.toString().contains('auth')) {
      return request;
    }

    JWT? accessToken;
    try {
      accessToken = TokenService().getTokens().accessToken;
    } on TokenExpiredException catch (_) {
      await refreshTokens();
      accessToken = TokenService().getTokens().accessToken;
    }
    request.headers['Authorization'] = 'Bearer ${accessToken.toString()}';

    return request;
  }

  @override
  Future<bool> shouldAttemptRetryOnResponse(BaseResponse response) async {
    if (response.statusCode == HttpStatus.unauthorized ||
        response.statusCode == HttpStatus.forbidden) {
      await refreshTokens();
      return true;
    }
    return false;
  }

  Future<void> refreshTokens() async {
    final Response response =
        await http.post(Uri.parse('$baseUrl/auth/refresh'));
    var jsonResponse = jsonDecode(response.body);
    TokenService().setTokens(
      jsonResponse['accessToken'],
      jsonResponse['refreshToken'],
    );
  }

  @override
  Future<http.BaseResponse> interceptResponse(
      {required http.BaseResponse response}) async {
    return response;
  }

  @override
  Future<bool> shouldInterceptRequest() async {
    return true;
  }

  @override
  Future<bool> shouldInterceptResponse() async {
    return true;
  }
}
