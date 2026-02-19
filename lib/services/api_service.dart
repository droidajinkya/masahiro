import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiService {
  static const String _endpoint = 'https://example.com/api/qr-scan';

  Future<void> sendScanPayload(Map<String, dynamic> payload) async {
    final response = await http.post(
      Uri.parse(_endpoint),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException('Backend API rejected payload: ${response.statusCode}');
    }
  }
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => 'ApiException($message)';
}
