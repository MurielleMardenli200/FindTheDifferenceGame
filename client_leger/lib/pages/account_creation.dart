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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        height: MediaQuery.of(context).size.height * 0.95,
        width: MediaQuery.of(context).size.width * 0.95,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.5),
          color: const Color(0xFF11cfcf),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () {
                      Navigator.pop(context); // Navigate back to the login page
                    },
                  ),
                ],
              ),
            ),
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
                    "Création de compte",
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
              child: Form(
                key: accountCreationPageFormKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    buildLabel("Nom d'utilisateur", "username"),
                    buildTextField(usernameController, 'text', 'username'),
                    buildLabel("Courriel", "email"),
                    buildTextField(emailController, 'text', 'email'),
                    buildLabel("Mot de passe", "password"),
                    buildTextField(passwordController, 'password', 'password'),
                    buildLabel("Réécrivez votre mot de passe",
                        "password confirmation"),
                    buildTextField(passwordConfirmationController, 'password',
                        'password-confirmation'),
                    const Padding(
                      padding: EdgeInsets.only(top: 8.0),
                      child: Text(
                        "Le mot de passe n'est pas le même",
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
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
            ),
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
        const Row(
          children: [
            Icon(
              Icons.error,
              color: Colors.red,
              size: 18.0,
            ),
            SizedBox(width: 5.0),
          ],
        ),
      ],
    );
  }

  Widget buildTextField(TextEditingController controller, String inputType,
      String formControlName) {
    return TextFormField(
      controller: controller,
      keyboardType: inputType == 'text'
          ? TextInputType.text
          : TextInputType.visiblePassword,
      obscureText: inputType == 'password',
      decoration: InputDecoration(
        filled: true,
        fillColor: const Color(0xFFf2f2f2),
        contentPadding: const EdgeInsets.all(10.0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4.0),
          borderSide: BorderSide.none,
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Veuillez entrer une valeur';
        }
        return null;
      },
    );
  }
}
