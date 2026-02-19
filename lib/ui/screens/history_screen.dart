import 'package:flutter/material.dart';

import '../../models/scan_record.dart';
import 'scan_controller.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key, required this.controller});

  final ScanController controller;

  @override
  Widget build(BuildContext context) {
    final records = controller.history;

    return Scaffold(
      appBar: AppBar(title: const Text('Scan History')),
      body: records.isEmpty
          ? const Center(child: Text('No scans yet.'))
          : ListView.separated(
              itemCount: records.length,
              separatorBuilder: (_, __) => const Divider(height: 0),
              itemBuilder: (context, index) {
                final record = records[index];
                return ListTile(
                  title: Text(record.type.toUpperCase()),
                  subtitle: Text(
                    record.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Text(_shortDate(record.timestamp)),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ScanDetailsScreen(record: record),
                    ),
                  ),
                );
              },
            ),
    );
  }

  String _shortDate(DateTime value) {
    return '${value.year}-${value.month.toString().padLeft(2, '0')}-${value.day.toString().padLeft(2, '0')}';
  }
}

class ScanDetailsScreen extends StatelessWidget {
  const ScanDetailsScreen({super.key, required this.record});

  final ScanRecord record;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Details')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Type: ${record.type.toUpperCase()}'),
            const SizedBox(height: 8),
            Text('Timestamp: ${record.timestamp.toLocal()}'),
            const SizedBox(height: 8),
            Text('Platform: ${record.platform}'),
            const SizedBox(height: 16),
            const Text('Decoded Content:'),
            const SizedBox(height: 8),
            SelectableText(record.content),
          ],
        ),
      ),
    );
  }
}
