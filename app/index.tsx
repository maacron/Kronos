import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  const START_TIME = 25 * 60;
  const [secondsLeft, setSecondsLeft] = useState(START_TIME);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const movedDownRef = useRef(false);
  const movedUpRef = useRef(false);
  const movedBeyondThresholdRef = useRef(false);

  const animateScale = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const resetTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(START_TIME);
    setRunning(false);
  };

  const addOneMinute = () => {
    setSecondsLeft((prev) => prev + 60);
  };

  const handleStart = useCallback(() => {
    animateScale();

    if (running) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRunning(false);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setRunning(true);

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [running, animateScale]);

  const handleLongPress = useCallback(() => {
    if (!movedBeyondThresholdRef.current) {
      router.push("/settings");
    }
  }, [router]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy >= 80) {
          if (!movedDownRef.current) {
            movedDownRef.current = true;
            movedBeyondThresholdRef.current = true;
            resetTimer();
          }
        } else if (gestureState.dy <= -80) {
          if (!movedUpRef.current) {
            movedUpRef.current = true;
            movedBeyondThresholdRef.current = true;
            addOneMinute();
          }
        }
      },

      onPanResponderRelease: () => {
        movedDownRef.current = false;
        movedUpRef.current = false;
        movedBeyondThresholdRef.current = false;
      },

      onPanResponderTerminate: () => {
        movedDownRef.current = false;
        movedUpRef.current = false;
        movedBeyondThresholdRef.current = false;
      },
    })
  ).current;

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  return (
    <View {...panResponder.panHandlers} style={styles.container}>
      <Pressable
        style={styles.pressable}
        onPress={handleStart}
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        <Animated.Text
          style={[styles.timer, { transform: [{ scale: scaleAnim }] }]}
        >
          {formatTime(secondsLeft)}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  timer: {
    fontSize: 96,
    fontWeight: "bold",
    color: "#000",
  },
});
