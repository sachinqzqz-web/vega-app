const {withGradleProperties} = require('expo/config-plugins');

// Keep the Gradle daemon within a memory budget that fits alongside the Kotlin
// compiler workers and Metro. A large heap plus concurrent workers can exceed memory-constrained hosts
// (e.g. WSL2); keep workers bounded while allowing APK packaging headroom.
const GRADLE_PROPERTIES = {
  'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=768m -Dfile.encoding=UTF-8',
  // Cap concurrent Gradle workers so parallel module builds don't spike RAM.
  'org.gradle.workers.max': '1',
  // Bound the Kotlin daemon heap; it otherwise sizes to the host and adds up.
  'kotlin.daemon.jvmargs': '-Xmx1g',
  'reactNativeArchitectures': 'armeabi-v7a,arm64-v8a',
  'expo.useLegacyPackaging': 'true',
  // Store the Hermes bundle uncompressed so it is memory-mapped at launch
  // instead of inflated into RAM first. Faster cold start and less memory on
  // low-end phones and TV boxes, for a slightly larger APK.
  'android.enableBundleCompression': 'true',
};

function upsertProperty(modResults, key, value) {
  const existing = modResults.find(
    item => item.type === 'property' && item.key === key,
  );
  if (existing) {
    existing.value = value;
  } else {
    modResults.push({type: 'property', key, value});
  }
}

module.exports = function withJvmArgs(config) {
  return withGradleProperties(config, cfg => {
    for (const [key, value] of Object.entries(GRADLE_PROPERTIES)) {
      upsertProperty(cfg.modResults, key, value);
    }
    return cfg;
  });
};
