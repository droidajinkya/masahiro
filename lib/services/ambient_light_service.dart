import 'dart:async';

import 'package:ambient_light/ambient_light.dart';

class AmbientLightService {
  final AmbientLight _ambientLight = AmbientLight();

  /// Emits true when low-light is detected.
  Stream<bool> lowLightStream({double thresholdLux = 15.0}) {
    return _ambientLight.ambientLightStream
        .map((lux) => lux <= thresholdLux)
        .distinct();
  }
}
