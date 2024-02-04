class UserInfo {
  String username;
  String password;
  String? email;

  UserInfo({required this.username, required this.password, this.email});

  Map<String, dynamic> toMap() {
    return {
      'username': username,
      'password': password,
      'email': email,
    };
  }

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'username': String username,
        'password': String password,
        'email': String email,
      } =>
        UserInfo(
          username: username,
          password: password,
          email: email,
        ),
      _ => throw const FormatException('Failed to create UserInfo.'),
    };
  }
}
