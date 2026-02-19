class QueuedApiEvent {
  QueuedApiEvent({
    required this.id,
    required this.payload,
    required this.createdAt,
    this.retryCount = 0,
  });

  final String id;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final int retryCount;

  QueuedApiEvent copyWith({int? retryCount}) {
    return QueuedApiEvent(
      id: id,
      payload: payload,
      createdAt: createdAt,
      retryCount: retryCount ?? this.retryCount,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'payload': payload,
      'createdAt': createdAt.toIso8601String(),
      'retryCount': retryCount,
    };
  }

  factory QueuedApiEvent.fromJson(Map<dynamic, dynamic> json) {
    return QueuedApiEvent(
      id: json['id'] as String,
      payload: Map<String, dynamic>.from(json['payload'] as Map),
      createdAt: DateTime.parse(json['createdAt'] as String),
      retryCount: json['retryCount'] as int? ?? 0,
    );
  }
}
