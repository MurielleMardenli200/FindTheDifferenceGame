import 'package:flutter/material.dart';

class WrapperWidget extends StatelessWidget {
  final Widget child;

  const WrapperWidget({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height,
      width: MediaQuery.of(context).size.width,
      color: const Color(0xFF1b3b6f),
      padding: const EdgeInsets.all(30.0),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.5),
          color: const Color(
              0xFF11cfcf), // Light blue color (background of your existing content)
        ),
        child: child,
      ),
    );
  }
}
