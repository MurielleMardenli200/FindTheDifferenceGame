import 'package:client_leger/base-widgets/wrapper_widget.dart';
import 'package:client_leger/constants/form_constants.dart';
import 'package:client_leger/services/google_signin_service.dart';
import 'package:client_leger/validators/account_form_validator.dart';
import 'package:flutter/material.dart';

class AccountCreationPage extends StatefulWidget {
  const AccountCreationPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _AccountCreationPageState createState() => _AccountCreationPageState();
}

class _AccountCreationPageState extends State<AccountCreationPage> {
  final GlobalKey<FormState> accountCreationPageFormKey =
      GlobalKey<FormState>();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController passwordConfirmationController =
      TextEditingController();
  final GoogleSigninService googleSigninService = GoogleSigninService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WrapperWidget(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
            Column(
              children: [
                const Text('Profile page'),
                ElevatedButton(
                  onPressed: () async {
                    await googleSigninService.logout();
                    Navigator.pop(context);
                  },
                  child: const Text('Logout'),
                ),
              ],
            ),
            const Column(
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
                  "Création de compte",
                  style: TextStyle(
                    fontSize: 40.0,
                    fontFamily: 'Pirata',
                  ),
                ),
              ],
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
                        key: accountCreationPageFormKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            buildLabel(
                                "Nom d'utilisateur", AccountInfo.username),
                            buildTextField(usernameController,
                                AccountInfo.username, AccountInfo.username),
                            buildLabel("Courriel", AccountInfo.email),
                            buildTextField(emailController, AccountInfo.email,
                                AccountInfo.email),
                            buildLabel("Mot de passe", AccountInfo.password),
                            buildTextField(passwordController,
                                AccountInfo.password, AccountInfo.password),
                            buildLabel("Réécrivez votre mot de passe",
                                AccountInfo.passwordConfirmation),
                            buildTextField(
                                passwordConfirmationController,
                                AccountInfo.passwordConfirmation,
                                AccountInfo.passwordConfirmation),
                            ElevatedButton(
                              onPressed: () {
                                if (accountCreationPageFormKey.currentState
                                        ?.validate() ??
                                    false) {
                                  // TODO: handle account creation
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFC3E0E5),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(4.0),
                                ),
                              ),
                              child: const Text(
                                "CRÉER UN NOUVEAU COMPTE",
                                style: TextStyle(
                                    fontSize: 14.0,
                                    fontFamily: 'Pirata',
                                    color: Colors.black),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ])),
          ],
        ),
      ),
    );
  }

  Widget buildLabel(String text, String htmlFor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          text,
          style: const TextStyle(
            fontSize: 14.0,
            fontFamily: 'Pirata',
            color: Color(0xFFC3E0E5),
          ),
        ),
      ],
    );
  }

  Widget buildTextField(TextEditingController controller, String inputType,
      String formControlName) {
    return TextFormField(
      controller: controller,
      keyboardType: inputType == AccountInfo.password ||
              inputType == AccountInfo.passwordConfirmation
          ? TextInputType.visiblePassword
          : TextInputType.text,
      obscureText: inputType == AccountInfo.password ||
          inputType == AccountInfo.passwordConfirmation,
      decoration: InputDecoration(
        filled: true,
        fillColor: const Color(0xFFf2f2f2),
        contentPadding: const EdgeInsets.all(10.0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4.0),
          borderSide: BorderSide.none,
        ),
      ),
      validator: (value) =>
          accountFormValidator(value, inputType, passwordController.text),
    );
  }
}
