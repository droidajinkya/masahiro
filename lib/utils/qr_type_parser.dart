class QrTypeParser {
  static String detectType(String value) {
    final data = value.trim();
    final lower = data.toLowerCase();

    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return 'url';
    }
    if (lower.startsWith('begin:vcard')) {
      return 'vcard';
    }
    if (lower.startsWith('wifi:')) {
      return 'wifi';
    }
    if (lower.startsWith('upi://') || lower.contains('pa=') && lower.contains('pn=')) {
      return 'payment';
    }
    return 'text';
  }
}
