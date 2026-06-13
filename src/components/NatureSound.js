import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { COLORS } from '../theme';

const VARIANTS = [
  { key: 'rain', label: '雨声', file: require('../../assets/sounds/rain.mp3') },
  { key: 'forest', label: '森林', file: require('../../assets/sounds/forest.mp3') },
  { key: 'ocean', label: '海浪', file: require('../../assets/sounds/ocean.mp3') },
];

export default function NatureSound({ active, onComplete, defaultDuration, color, subMode }) {
  const [internalSubMode, setInternalSubMode] = useState(subMode || 'rain');
  const currentSubMode = subMode !== undefined ? subMode : internalSubMode;
  const activeVariant = VARIANTS.find(v => v.key === currentSubMode) || VARIANTS[0];
  const [remaining, setRemaining] = useState(defaultDuration);
  const [cacheMap, setCacheMap] = useState({});
  const timerRef = useRef(null);
  const player = useAudioPlayer(VARIANTS[0].file);

  // Cache audio files locally for smooth looping
  useEffect(() => {
    let cancelled = false;
    async function cacheAll() {
      const map = {};
      for (const v of VARIANTS) {
        const cacheUri = FileSystem.cacheDirectory + v.key + '.mp3';
        try {
          const info = await FileSystem.getInfoAsync(cacheUri);
          if (info.exists) {
            map[v.key] = cacheUri;
            continue;
          }
        } catch (e) { /* download */ }
        try {
          const asset = Asset.fromModule(v.file);
          await asset.downloadAsync();
          const src = asset.localUri || asset.uri;
          await FileSystem.copyAsync({ from: src, to: cacheUri });
          map[v.key] = cacheUri;
        } catch (e) { /* keep using direct require */ }
      }
      if (!cancelled) setCacheMap(map);
    }
    cacheAll();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (active) {
      const total = defaultDuration;
      const startTime = Date.now();
      // Use cached local file if available, otherwise fall back to direct module
      const source = cacheMap[currentSubMode];
      if (source) {
        try { player.replace({ uri: source }); } catch (e) {}
      } else {
        try { player.replace(activeVariant.file); } catch (e) {}
      }
      player.loop = true;
      player.volume = 0.6;
      try { player.play(); } catch (e) {}
      setRemaining(total);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const r = total - elapsed;
        if (r <= 0) {
          clearInterval(timerRef.current);
          setRemaining(0);
          try { player.pause(); } catch (e) {}
          onComplete && onComplete(total);
        } else {
          setRemaining(r);
        }
      }, 250);
    } else {
      clearInterval(timerRef.current);
      try { player.pause(); } catch (e) {}
    }
    return () => {
      clearInterval(timerRef.current);
      try { player.pause(); } catch (e) {}
    };
  }, [active, currentSubMode, defaultDuration, cacheMap]);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{active ? '沉浸在自然的声音中' : '选择声音，点击开始'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  hint: { fontSize: 12, color: COLORS.textLight },
});
