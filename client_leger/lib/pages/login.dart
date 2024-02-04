import 'package:client_leger/base-widgets/wrapper_widget.dart';
import 'package:client_leger/pages/account_creation.dart';
import 'package:client_leger/services/google_signin_service.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final logInFormKey = GlobalKey<FormState>();
  final googleSigninService = GoogleSigninService();
  TextEditingController usernameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WrapperWidget(
            child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.95,
            width: MediaQuery.of(context).size.width * 0.95,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  margin: const EdgeInsets.all(70.0),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "SPOT SEVEN",
                        style: TextStyle(
                          fontSize: 50.0,
                          color: Colors.black,
                          fontFamily: 'Pirata',
                        ),
                      ),
                      Text(
                        "Connexion",
                        style: TextStyle(
                          fontSize: 40.0,
                          fontFamily: 'Pirata',
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(30.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1b3b6f),
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Image.asset(
                        "assets/logo/logo.png",
                        height: 150.0,
                        width: 150.0,
                      ),
                      Form(
                        key: logInFormKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Nom d'utilisateur",
                              style: TextStyle(
                                  fontSize: 14.0,
                                  fontFamily: 'Pirata',
                                  color: Color(0xFFC3E0E5)),
                            ),
                            TextFormField(
                              controller: usernameController,
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: const Color(0xFFf2f2f2),
                                contentPadding: const EdgeInsets.all(10.0),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(4.0),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10.0),
                            const Text(
                              "Mot de passe",
                              style: TextStyle(
                                  fontSize: 14.0,
                                  fontFamily: 'Pirata',
                                  color: Color(0xFFC3E0E5)),
                            ),
                            TextFormField(
                              controller: passwordController,
                              obscureText: true,
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: const Color(0xFFf2f2f2),
                                contentPadding: const EdgeInsets.all(10.0),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(4.0),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10.0),
                            GestureDetector(
                              child: const Text(
                                "Mot de passe oublié ?",
                                style: TextStyle(
                                    fontSize: 12.0,
                                    fontFamily: 'Pirata',
                                    color: Color(0xFFC3E0E5)),
                              ),
                              onTap: () {
                                // TODO: Handle the password reset action
                              },
                            ),
                            const SizedBox(height: 10.0),
                            ElevatedButton(
                              onPressed: () {
                                // TODO: handle login
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFC3E0E5),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(4.0),
                                ),
                              ),
                              child: const Text(
                                "SE CONNECTER",
                                style: TextStyle(
                                    fontSize: 14.0,
                                    fontFamily: 'Pirata',
                                    color: Colors.black),
                              ),
                            ),
                            const SizedBox(height: 10.0),
                            const Text(
                              "Ou se connecter avec :",
                              style: TextStyle(
                                  fontSize: 14.0,
                                  fontFamily: 'Pirata',
                                  color: Color(0xFFC3E0E5)),
                            ),
                            GestureDetector(
                              onTap: () async {
                                await googleSigninService.signIn();
                                if (mounted) {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          // TODO: replace with Page with chat box
                                          const AccountCreationPage(),
                                    ),
                                  );
                                }
                              },
                              child: Container(
                                width: double.infinity,
                                height: 45,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Colors.grey,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8.0),
                                      child: Image.asset(
                                          'assets/logo/google_logo.png'),
                                    ),
                                    const Text(
                                      'Continue with google',
                                      style: TextStyle(
                                        fontSize: 17,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            // const SizedBox(height: 10.0),
                            // const Row(
                            //   mainAxisAlignment: MainAxisAlignment.center,
                            //   children: [
                            //     // TODO: add Google Sign-In button

                            //   ],
                            // ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10.0),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    const AccountCreationPage()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC3E0E5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4.0),
                          ),
                        ),
                        child: const Text(
                          "SE CRÉER UN COMPTE",
                          style: TextStyle(
                              fontSize: 14.0,
                              fontFamily: 'Pirata',
                              color: Colors.black),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(10.0),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // TODO: add surrounding dark blue container
                    ],
                  ),
                ),
              ],
            ),
          ),
        ])));
  }
}

class TeamMember {
  final String name;

  TeamMember(this.name);
}
