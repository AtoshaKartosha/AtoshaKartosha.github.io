# Промпты для генерации иллюстраций карт («Агент» и «Информатор»)

Ниже представлены промпты на английском языке для генерации в **Flux** или **Nano Banana 2 (Gemini 3.1 Flash Image)**. Они оптимизированы под квадратный формат (1:1), эстетику нуарного детектива 1940-х годов и стиль винтажных полароидных снимков с теплыми сепия-тонами, глубокими тенями и текстурой пленочного зерна.

---

## 1. Карточка «АГЕНТ» (Suspect 1)

### Prompt
```text
A vintage 1940s Polaroid photograph of a mysterious female secret agent. She is wearing a dark, elegant wool trench coat and a wide-brimmed noir fedora hat that casts a deep shadow over her eyes. She is looking slightly downwards and away from the camera, avoiding eye contact. Moody, cinematic chiaroscuro lighting with dramatic dark shadows and warm amber light sources. The background is a dimly lit, foggy Saint Petersburg vintage railway station with faint iron arch structures and steam. Warm sepia color grading, heavy analog film grain, soft focus edges, realistic retro photo texture with tiny dust specks and minor scratches. Aspect ratio 1:1, square framing.
```

---

## 2. Карточка «ИНФОРМАТОР» (Suspect 2)

### Prompt
```text
A vintage 1940s Polaroid photograph of a secretive male informant. He is wearing a dark double-breasted wool overcoat with the collar turned up to hide his lower face, and a classic fedora hat. He is looking back cautiously over his shoulder with a tense, secretive expression. Dramatic chiaroscuro noir lighting with deep shadows and a warm glow from a distant lamp. The background is a misty Obvodny Canal in Saint Petersburg at night, with faint silhouettes of brick architecture and soft streetlamp glare in the fog. Warm sepia color palette, dark charcoal and beige tones, vintage analog film grain, dusty texture, minor scratches. Aspect ratio 1:1, square framing.
```

---

## Рекомендации по генерации и сохранению:
1. **Соотношение сторон (Aspect Ratio):** Выставляйте строго **1:1** (квадрат).
2. **Разрешение:** Оптимально генерировать в разрешении **1024x1024** px.
3. **После генерации:**
   - Сохраните картинку Агента как `suspect-1.png`
   - Сохраните картинку Информатора как `suspect-2.png`
   - Положите их в папку `frontend/public/images/board/`.
   - Напишите мне, и мы обновим код, чтобы вместо векторных силуэтов отображались ваши новые сгенерированные файлы!
