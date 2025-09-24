# 📄 Content License - Chess Academy V0 Voice Play System

**Version**: 1.0
**Last Updated**: September 2024
**Project**: Chess Academy V0 - Voice Play System

---

## 🎤 Voice Content Licensing

### **Chess Coaching Text Content**
- **Copyright**: © 2024 Kumar Anand Singh
- **License**: MIT License
- **Usage**: All chess coaching phrases, templates, and instructional text
- **Files**:
  - `public/phrasebook.json`
  - All coaching text templates and phrases

**MIT License Terms**: You are free to use, modify, distribute, and sell this content commercially without restrictions. Attribution is appreciated but not required.

---

## 🎵 Audio Content Licensing

### **Voice-Over (TTS Generated Audio)**
- **Technology**: Generated via Piper TTS (MIT Licensed)
- **Source**: Piper Text-to-Speech Engine
- **License**: MIT License (Piper) + MIT License (Our Text Content)
- **Usage**: All generated .mp3/.wav voice coaching files
- **Files**: `public/audio/coach/*.mp3`

**Commercial Rights**: Generated voice audio files are fully cleared for commercial use. The Piper TTS engine is MIT licensed, and our source text is MIT licensed.

### **Sound Effects (SFX)**
- **Source**: Kenney Game Assets - UI Audio Pack
- **License**: Creative Commons CC0 (Public Domain)
- **Usage**: All game sound effects (moves, captures, notifications)
- **Files**: `public/sfx/*.ogg`

**CC0 License**: These assets are in the public domain. No attribution required, but appreciated.

**Direct Links**:
- 🔗 **Kenney UI Audio**: https://kenney.nl/assets/ui-audio
- 🔗 **Kenney Main Site**: https://kenney.nl

---

## 📦 Asset Inventory

### **Voice Coaching Files** (MIT Licensed)
```
public/audio/coach/
├── GOOD_MOVE_1_en_US_lessac.mp3      # "Nice idea!"
├── EXCELLENT_1_en_US_lessac.mp3      # "Brilliant move!"
├── CHECK_en_US_lessac.mp3            # "Check!"
├── CHECKMATE_en_US_lessac.mp3        # "Checkmate! Well played!"
├── HANGING_WARNING_en_US_lessac.mp3  # "Careful — your piece is hanging."
├── ENCOURAGEMENT_1_en_US_lessac.mp3  # "Keep thinking!"
├── [... additional TTS files]
```

### **Sound Effects** (CC0 Public Domain)
```
public/sfx/
├── positive.ogg     # Success/good move sound
├── warning.ogg      # Warning/caution sound
├── blunder.ogg      # Mistake/blunder sound
├── move.ogg         # Regular move sound
├── capture.ogg      # Piece capture sound
├── check.ogg        # Check announcement sound
├── mate.ogg         # Checkmate celebration sound
├── castle.ogg       # Castling move sound
```

### **Configuration Files** (MIT Licensed)
```
public/phrasebook.json              # Voice coaching templates
services/tts.js                     # Piper TTS service wrapper
src/services/audioBus.ts            # Client audio system
src/components/VoiceSettings.tsx    # Voice settings UI
```

---

## ⚖️ Legal Compliance

### **For Commercial Use**
1. **Voice Content**: MIT licensed - use freely in commercial products
2. **Sound Effects**: CC0 licensed - no attribution required for commercial use
3. **Generated Audio**: MIT + CC0 combination - fully commercial ready

### **Attribution Recommendations** (Optional)
While not legally required, you may include:

```
Voice coaching powered by:
- Piper TTS (MIT) - https://github.com/rhasspy/piper
- Sound effects by Kenney (CC0) - https://kenney.nl
- Chess coaching content © Kumar Anand Singh (MIT)
```

### **Redistribution Rights**
- ✅ **Sell voice-enabled chess applications**
- ✅ **Include in commercial chess platforms**
- ✅ **License to third parties**
- ✅ **Modify coaching content and voices**
- ✅ **Create derivative voice products**

---

## 🔧 Technical Implementation

### **Piper TTS Setup**
```bash
# Install Piper TTS (MIT Licensed)
pip install piper-tts

# Generate voice files
echo "Nice idea!" | piper \
  --model en_US-lessac-medium.onnx \
  --output_file good_move.wav
```

### **Audio Integration**
```typescript
// MIT Licensed - Client Audio System
import { audioBus } from './services/audioBus';

// Play coaching with SFX
await audioBus.playChessAudio(
  { key: 'positive' },      // CC0 sound effect
  {                         // MIT voice content
    key: 'GOOD_MOVE_1',
    text: 'Nice idea!',
    category: 'positive',
    priority: 'medium'
  }
);
```

---

## 📋 License Compatibility Matrix

| Content Type | License | Commercial Use | Attribution Required | Source Code Disclosure |
|--------------|---------|----------------|---------------------|----------------------|
| Chess Text Content | MIT | ✅ Yes | ❌ No | ❌ No |
| Generated Voice (TTS) | MIT | ✅ Yes | ❌ No | ❌ No |
| Sound Effects (SFX) | CC0 | ✅ Yes | ❌ No | ❌ No |
| Piper TTS Engine | MIT | ✅ Yes | ❌ No | ❌ No |
| Audio System Code | MIT | ✅ Yes | ❌ No | ❌ No |

---

## 🎯 Summary

**Chess Academy V0 Voice Play System is 100% commercially cleared** with:

- **Zero GPL contamination** - All MIT/CC0 licensed
- **No royalty requirements** - Use freely in paid products
- **No attribution mandates** - Optional but appreciated
- **Full modification rights** - Adapt for any chess platform
- **Enterprise deployment ready** - SaaS, mobile apps, VDI systems

---

## 📞 Questions?

For licensing questions about this voice system:
- **GitHub Issues**: [Chess Academy V0 Repository](https://github.com/KumarAnandSingh/chess-academy-v0)
- **Content Creator**: Kumar Anand Singh
- **Original Assets**: Kenney.nl (CC0), Piper TTS (MIT)

---

<div align="center">

**✅ CLEARED FOR COMMERCIAL USE ✅**

**Voice • SFX • Code • Content**

[![License: MIT](https://img.shields.io/badge/Voice%20Content-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![License: CC0](https://img.shields.io/badge/Sound%20Effects-CC0-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Commercial Ready](https://img.shields.io/badge/Commercial%20Use-✅%20Approved-brightgreen.svg)](#commercial-use)

</div>