import 'package:client_leger/exceptions/token_exceptions.dart';
import 'package:client_leger/interfaces/tokens.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

class TokenService {
  static final TokenService _tokenService = TokenService._internal();
  JWT? _accessToken;
  JWT? _refreshToken;
  TokenPayload? _tokenPayload;

  // Dart factory makes singletons easier
  factory TokenService() {
    return _tokenService;
  }

  // This creates the singleton
  TokenService._internal();

  Tokens getTokens() {
    if (_accessToken == null || _refreshToken == null) {
      throw TokenExpiredException('No tokens found');
    }
    return Tokens(_accessToken, _refreshToken);
  }

  void setTokens(String accessToken, String refreshToken) {
    _accessToken = JWT(accessToken);
    _refreshToken = JWT(refreshToken);
    final payload = JWT.decode(_accessToken!.payload).payload;
    _tokenPayload = TokenPayload(
      payload['username'],
      DateTime.fromMillisecondsSinceEpoch(payload['exp'] * 1000),
      DateTime.fromMillisecondsSinceEpoch(payload['iat'] * 1000),
    );
  }

  bool isAccessTokenExpired() {
    if (_tokenPayload == null) {
      throw TokenExpiredException('No tokens found');
    }
    return _tokenPayload!.isExpired();
  }

  void removeTokens() {
    _accessToken = null;
    _refreshToken = null;
    _tokenPayload = null;
  }
}
