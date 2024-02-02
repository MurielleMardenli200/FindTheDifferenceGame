String? noWhiteSpaceValidator(String? value, String fieldName) {
  if (value == null || value.isEmpty) {
    return 'Veuillez entrer votre $fieldName.';
  }
  return null;
}
