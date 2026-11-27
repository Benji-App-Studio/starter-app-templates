#!/bin/bash
# Synthesizes the Nightmix sound library with ffmpeg: 24 s seamless mono AAC loops.
# Each sound is rendered 27 s long, then the last 3 s are equal-power crossfaded
# over the first 3 s so the loop point is inaudible.
set -euo pipefail

FF=/opt/homebrew/bin/ffmpeg
OUT="$1"
TMP="$(mktemp -d)"
LEN=24
FADE=3
TOTAL=$((LEN + FADE))
SR=44100

render() {
  local name="$1" graph="$2"
  "$FF" -hide_banner -loglevel error -y \
    -filter_complex "${graph},loudnorm=I=-18:TP=-1.5:LRA=6,aresample=${SR},aformat=channel_layouts=mono[out]" \
    -map "[out]" -t "$TOTAL" "$TMP/$name.wav"
  "$FF" -hide_banner -loglevel error -y -i "$TMP/$name.wav" \
    -filter_complex "[0:a]asplit[a][b];\
[a]atrim=0:${LEN},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${FADE}:curve=qsin[main];\
[b]atrim=${LEN}:${TOTAL},asetpts=PTS-STARTPTS,afade=t=out:st=0:d=${FADE}:curve=qsin,apad=whole_dur=${LEN}[tail];\
[main][tail]amix=inputs=2:normalize=0:dropout_transition=0[mix]" \
    -map "[mix]" -t "$LEN" -ac 1 -ar "$SR" -c:a aac -b:a 64k -movflags +faststart "$OUT/$name.m4a"
  printf '%-12s %s bytes\n' "$name" "$(stat -f%z "$OUT/$name.m4a")"
}

mkdir -p "$OUT"

render white-noise "anoisesrc=d=${TOTAL}:c=white:r=${SR}:a=0.3:s=1,lowpass=f=9000"
render pink-noise  "anoisesrc=d=${TOTAL}:c=pink:r=${SR}:a=0.6:s=2"
render brown-noise "anoisesrc=d=${TOTAL}:c=brown:r=${SR}:a=0.9:s=3"
render rain "anoisesrc=d=${TOTAL}:c=white:r=${SR}:a=0.5:s=4,highpass=f=500,lowpass=f=6500,tremolo=f=0.5:d=0.25[hiss];\
anoisesrc=d=${TOTAL}:c=brown:r=${SR}:a=0.6:s=5,lowpass=f=300,volume=0.6[rumble];\
[hiss][rumble]amix=inputs=2:normalize=0"
render ocean "anoisesrc=d=${TOTAL}:c=brown:r=${SR}:a=0.9:s=6,lowpass=f=1200,volume='0.55+0.45*sin(2*PI*t/12)':eval=frame[swell];\
anoisesrc=d=${TOTAL}:c=white:r=${SR}:a=0.25:s=7,lowpass=f=3000,highpass=f=400,volume='0.35*(0.5+0.5*sin(2*PI*t/12-0.6))':eval=frame[wash];\
[swell][wash]amix=inputs=2:normalize=0"
render wind "anoisesrc=d=${TOTAL}:c=pink:r=${SR}:a=0.6:s=8,highpass=f=150,lowpass=f=1500,tremolo=f=0.125:d=0.6"
render fan "anoisesrc=d=${TOTAL}:c=brown:r=${SR}:a=0.8:s=9,lowpass=f=2500[body];\
sine=f=120:r=${SR}:d=${TOTAL},volume=0.06[hum];\
[body][hum]amix=inputs=2:normalize=0"
render low-drone "sine=f=55:r=${SR}:d=${TOTAL}[a];sine=f=110.3:r=${SR}:d=${TOTAL},volume=0.5[b];sine=f=164.6:r=${SR}:d=${TOTAL},volume=0.25[c];\
[a][b][c]amix=inputs=3:normalize=0,volume='0.85+0.15*sin(2*PI*t/12)':eval=frame,lowpass=f=400"

rm -rf "$TMP"
