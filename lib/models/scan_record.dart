class ScanRecord {
  ScanRecord({
    required this.id,
    required this.content,
    required this.type,
    required this.timestamp,
    required this.platform,
  });

  final String id;
  final String content;
  final String type;
  final DateTime timestamp;
  final String platform;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'type': type,
      'timestamp': timestamp.toIso8601String(),
      'platform': platform,
    };
  }

  factory ScanRecord.fromJson(Map<dynamic, dynamic> json) {
    return ScanRecord(
      id: json['id'] as String,
      content: json['content'] as String,
      type: json['type'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      platform: json['platform'] as String,
    );
  }
}
