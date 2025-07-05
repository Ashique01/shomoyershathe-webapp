import { useState, useEffect, useRef } from "react";

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

export function useSpeechRecognition(
  onResult: (transcript: string) => void,
  lang: string = "bn-BD"
) {
  const recognition = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.warn("Speech Recognition API not supported in this browser.");
      setSupported(false);
      return;
    }

    recognition.current = new SpeechRecognitionConstructor() as SpeechRecognition;
    recognition.current.lang = lang;
    recognition.current.continuous = false;
    recognition.current.interimResults = false; // set to true to get live partial results
    recognition.current.maxAlternatives = 1;

    recognition.current.onstart = () => {
      setIsListening(true);
      console.log("Speech recognition started");
    };

    recognition.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcriptRaw = event.results[0][0].transcript;
      const transcript = transcriptRaw.trim();
      console.log("Recognized speech:", transcript);
      onResult(transcript);
    };

    recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.current.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");
    };

    return () => {
      if (recognition.current) {
        recognition.current.onstart = null;
        recognition.current.onresult = null;
        recognition.current.onerror = null;
        recognition.current.onend = null;
        recognition.current.abort();
      }
    };
  }, [onResult, lang]);

  const startListening = () => {
    if (recognition.current && !isListening) {
      try {
        recognition.current.start();
      } catch (err) {
        console.error("Speech recognition start error:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  };

  return { isListening, startListening, stopListening, supported };
}
