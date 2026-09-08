import argparse
import json
import sys


def main():
    parser = argparse.ArgumentParser(description="Transcreve audio usando faster-whisper.")
    parser.add_argument("audio_path")
    parser.add_argument("--model", default="tiny")
    parser.add_argument("--language", default="pt")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("faster-whisper nao esta instalado no container.", file=sys.stderr)
        return 2

    try:
        model = WhisperModel(args.model, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(
            args.audio_path,
            language=args.language,
            vad_filter=True,
            beam_size=1
        )
        segment_list = list(segments)
        text = " ".join(segment.text.strip() for segment in segment_list).strip()
        avg_logprob_values = [
            segment.avg_logprob
            for segment in segment_list
            if segment.avg_logprob is not None
        ]
        no_speech_values = [
            segment.no_speech_prob
            for segment in segment_list
            if segment.no_speech_prob is not None
        ]
        result = {
            "text": text,
            "avg_logprob": sum(avg_logprob_values) / len(avg_logprob_values) if avg_logprob_values else None,
            "no_speech_prob": max(no_speech_values) if no_speech_values else None,
            "segments": len(segment_list),
        }
        print(json.dumps(result, ensure_ascii=False))
        return 0 if text else 1
    except Exception as error:
        print(f"Erro ao transcrever audio: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
