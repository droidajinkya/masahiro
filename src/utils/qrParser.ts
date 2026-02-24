import { QRScanType, ScanRecord } from '../constants/qrTypes';

interface ParseResult {
  type: QRScanType;
  parsedData: Record<string, string>;
  title: string;
  subtitle: string;
}

export function parseQRData(rawData: string): ParseResult {
  const trimmed = rawData.trim();

  // URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return {
        type: 'URL',
        parsedData: { url: trimmed, host: url.hostname, path: url.pathname },
        title: url.hostname.replace(/^www\./, ''),
        subtitle: trimmed.length > 60 ? trimmed.slice(0, 60) + '...' : trimmed,
      };
    } catch {
      return {
        type: 'URL',
        parsedData: { url: trimmed },
        title: trimmed.slice(0, 40),
        subtitle: trimmed,
      };
    }
  }

  // Wi-Fi: WIFI:S:<SSID>;T:<auth>;P:<password>;;
  if (/^WIFI:/i.test(trimmed)) {
    const parsed = parseWiFi(trimmed);
    return {
      type: 'WiFi',
      parsedData: parsed,
      title: parsed.ssid || 'Unknown Network',
      subtitle: parsed.security
        ? `${parsed.security} · ${parsed.password ? 'Password protected' : 'Open'}`
        : 'Wi-Fi Network',
    };
  }

  // vCard Contact
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    const parsed = parseVCard(trimmed);
    return {
      type: 'Contact',
      parsedData: parsed,
      title: parsed.fullName || parsed.name || 'Unknown Contact',
      subtitle: [parsed.phone, parsed.email, parsed.org]
        .filter(Boolean)
        .slice(0, 2)
        .join(' · ') || 'Contact',
    };
  }

  // Payment (UPI)
  if (/^upi:\/\/pay/i.test(trimmed)) {
    const parsed = parseUPI(trimmed);
    return {
      type: 'Payment',
      parsedData: parsed,
      title: parsed.pa || 'UPI Payment',
      subtitle: parsed.pn ? `${parsed.pn}${parsed.am ? ' · ₹' + parsed.am : ''}` : 'UPI Payment',
    };
  }

  // Email: mailto:
  if (/^mailto:/i.test(trimmed)) {
    const withoutScheme = trimmed.replace(/^mailto:/i, '');
    const [address, queryStr] = withoutScheme.split('?');
    const params: Record<string, string> = { email: address };
    if (queryStr) {
      queryStr.split('&').forEach((part) => {
        const [k, v] = part.split('=');
        if (k && v) params[k] = decodeURIComponent(v);
      });
    }
    return {
      type: 'Email',
      parsedData: params,
      title: address || 'Email',
      subtitle: params.subject ? `Subject: ${params.subject}` : address,
    };
  }

  // Phone: tel:
  if (/^tel:/i.test(trimmed)) {
    const number = trimmed.replace(/^tel:/i, '').replace(/\s/g, '');
    return {
      type: 'Phone',
      parsedData: { number },
      title: number,
      subtitle: 'Phone Number',
    };
  }

  // SMS: smsto: or sms:
  if (/^(smsto:|sms:)/i.test(trimmed)) {
    const withoutScheme = trimmed.replace(/^(smsto:|sms:)/i, '');
    const colonIdx = withoutScheme.indexOf(':');
    const number = colonIdx >= 0 ? withoutScheme.slice(0, colonIdx) : withoutScheme;
    const message = colonIdx >= 0 ? withoutScheme.slice(colonIdx + 1) : '';
    return {
      type: 'SMS',
      parsedData: { number, message },
      title: number || 'SMS',
      subtitle: message || 'SMS Message',
    };
  }

  // Geo location: geo:lat,lon
  if (/^geo:/i.test(trimmed)) {
    const coords = trimmed.replace(/^geo:/i, '').split(',');
    const lat = coords[0] || '';
    const lon = coords[1]?.split('?')[0] || '';
    return {
      type: 'Geo',
      parsedData: { lat, lon, raw: trimmed },
      title: `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`,
      subtitle: 'Geographic Location',
    };
  }

  // Plain text fallback
  return {
    type: 'Text',
    parsedData: { text: trimmed },
    title: trimmed.length > 40 ? trimmed.slice(0, 40) + '...' : trimmed,
    subtitle: trimmed.length > 80 ? trimmed.slice(0, 80) + '...' : trimmed,
  };
}

function parseWiFi(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  // WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;H:<hidden>;;
  const ssidMatch = raw.match(/S:([^;]*)/);
  const typeMatch = raw.match(/T:([^;]*)/);
  const passMatch = raw.match(/P:([^;]*)/);
  const hiddenMatch = raw.match(/H:([^;]*)/);

  if (ssidMatch) result.ssid = ssidMatch[1];
  if (typeMatch) result.security = typeMatch[1];
  if (passMatch) result.password = passMatch[1];
  if (hiddenMatch) result.hidden = hiddenMatch[1];

  return result;
}

function parseVCard(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    if (!key || !value) continue;

    const keyBase = key.split(';')[0].toUpperCase();

    switch (keyBase) {
      case 'FN':
        result.fullName = value;
        break;
      case 'N': {
        const nameParts = value.split(';');
        result.name = [nameParts[1], nameParts[0]].filter(Boolean).join(' ');
        break;
      }
      case 'TEL':
        result.phone = value;
        break;
      case 'EMAIL':
        result.email = value;
        break;
      case 'ORG':
        result.org = value;
        break;
      case 'TITLE':
        result.title = value;
        break;
      case 'URL':
        result.url = value;
        break;
      case 'ADR':
        result.address = value.replace(/;/g, ', ').replace(/^,\s*/, '');
        break;
    }
  }

  return result;
}

function parseUPI(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const url = new URL(raw);
    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
  } catch {
    // fallback: manual parse
    const queryMatch = raw.match(/\?(.*)/);
    if (queryMatch) {
      queryMatch[1].split('&').forEach((part) => {
        const [k, v] = part.split('=');
        if (k && v) result[k] = decodeURIComponent(v);
      });
    }
  }
  return result;
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return timeStr;
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function groupScansByDate(scans: ScanRecord[]): Array<{
  title: string;
  data: ScanRecord[];
}> {
  const now = new Date();
  const today: ScanRecord[] = [];
  const yesterday: ScanRecord[] = [];
  const older: Record<string, ScanRecord[]> = {};

  for (const scan of scans) {
    const date = new Date(scan.timestamp);
    const dayDiff = Math.floor(
      (now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000
    );

    if (dayDiff === 0) {
      today.push(scan);
    } else if (dayDiff === 1) {
      yesterday.push(scan);
    } else {
      const label = new Date(scan.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!older[label]) older[label] = [];
      older[label].push(scan);
    }
  }

  const groups: Array<{ title: string; data: ScanRecord[] }> = [];
  if (today.length > 0) groups.push({ title: 'TODAY', data: today });
  if (yesterday.length > 0) groups.push({ title: 'YESTERDAY', data: yesterday });
  for (const [label, items] of Object.entries(older)) {
    groups.push({ title: label.toUpperCase(), data: items });
  }

  return groups;
}
