import type { AnatomyPath } from "./types"

// ── ANTERIOR MUSCLES (Front View) ───────────────────────────────────────────
export const ANTERIOR_MUSCLES: AnatomyPath[] = [
  // Sternocleidomastoid left
  {
    id: "scm-l",
    d: "M 96 50 Q 90 56, 86 62 Q 82 66, 78 70 L 80 72 Q 84 68, 88 64 Q 92 58, 98 52 Z",
  },
  // Sternocleidomastoid right
  {
    id: "scm-r",
    d: "M 104 50 Q 110 56, 114 62 Q 118 66, 122 70 L 120 72 Q 116 68, 112 64 Q 108 58, 102 52 Z",
  },
  // Left deltoid
  {
    id: "deltoid-l",
    d: "M 68 70 Q 60 72, 56 78 Q 52 84, 54 92 Q 56 96, 60 94 Q 64 90, 66 84 Q 70 78, 72 74 Z",
  },
  // Right deltoid
  {
    id: "deltoid-r",
    d: "M 132 70 Q 140 72, 144 78 Q 148 84, 146 92 Q 144 96, 140 94 Q 136 90, 134 84 Q 130 78, 128 74 Z",
  },
  // Left pectoralis major
  {
    id: "pec-l",
    d: "M 94 72 Q 84 70, 72 76 Q 66 80, 64 88 Q 68 94, 78 92 Q 86 90, 94 86 Z",
  },
  // Right pectoralis major
  {
    id: "pec-r",
    d: "M 106 72 Q 116 70, 128 76 Q 134 80, 136 88 Q 132 94, 122 92 Q 114 90, 106 86 Z",
  },
  // Left biceps
  {
    id: "biceps-l",
    d: "M 58 92 Q 54 96, 50 104 Q 46 112, 44 120 L 48 122 Q 50 114, 54 106 Q 58 98, 62 94 Z",
  },
  // Right biceps
  {
    id: "biceps-r",
    d: "M 142 92 Q 146 96, 150 104 Q 154 112, 156 120 L 152 122 Q 150 114, 146 106 Q 142 98, 138 94 Z",
  },
  // Rectus abdominis
  {
    id: "rectus-abd",
    d: "M 92 96 L 92 162 Q 96 166, 100 166 Q 104 166, 108 162 L 108 96 Q 104 92, 100 92 Q 96 92, 92 96 Z",
  },
  // Left external oblique
  {
    id: "oblique-l",
    d: "M 90 96 Q 82 100, 76 110 Q 72 120, 70 132 Q 68 144, 70 156 L 74 156 Q 74 144, 76 132 Q 78 120, 82 112 Q 86 104, 92 100 Z",
  },
  // Right external oblique
  {
    id: "oblique-r",
    d: "M 110 96 Q 118 100, 124 110 Q 128 120, 130 132 Q 132 144, 130 156 L 126 156 Q 126 144, 124 132 Q 122 120, 118 112 Q 114 104, 108 100 Z",
  },
  // Left rectus femoris (quad center)
  {
    id: "rectus-fem-l",
    d: "M 80 180 Q 78 200, 76 224 Q 74 248, 74 272 L 80 278 Q 82 254, 84 230 Q 86 206, 86 184 Z",
  },
  // Left vastus lateralis
  {
    id: "vastus-lat-l",
    d: "M 74 182 Q 70 200, 68 224 Q 66 248, 66 272 L 72 274 Q 72 250, 74 228 Q 76 206, 78 184 Z",
  },
  // Left vastus medialis
  {
    id: "vastus-med-l",
    d: "M 88 186 Q 90 206, 90 228 Q 90 250, 86 274 L 82 278 Q 82 254, 82 230 Q 82 206, 84 186 Z",
  },
  // Right rectus femoris
  {
    id: "rectus-fem-r",
    d: "M 120 180 Q 122 200, 124 224 Q 126 248, 126 272 L 120 278 Q 118 254, 116 230 Q 114 206, 114 184 Z",
  },
  // Right vastus lateralis
  {
    id: "vastus-lat-r",
    d: "M 126 182 Q 130 200, 132 224 Q 134 248, 134 272 L 128 274 Q 128 250, 126 228 Q 124 206, 122 184 Z",
  },
  // Right vastus medialis
  {
    id: "vastus-med-r",
    d: "M 112 186 Q 110 206, 110 228 Q 110 250, 114 274 L 118 278 Q 118 254, 118 230 Q 118 206, 116 186 Z",
  },
  // Left tibialis anterior
  {
    id: "tib-ant-l",
    d: "M 74 306 Q 72 320, 70 340 Q 68 354, 68 366 L 72 366 Q 74 354, 76 340 Q 78 320, 78 308 Z",
  },
  // Right tibialis anterior
  {
    id: "tib-ant-r",
    d: "M 126 306 Q 128 320, 130 340 Q 132 354, 132 366 L 128 366 Q 126 354, 124 340 Q 122 320, 122 308 Z",
  },
]

// ── POSTERIOR MUSCLES (Back View) ───────────────────────────────────────────
export const POSTERIOR_MUSCLES: AnatomyPath[] = [
  // Trapezius (central diamond shape)
  {
    id: "trapezius",
    d: "M 100 52 Q 88 56, 72 68 Q 66 74, 64 82 L 68 84 Q 78 76, 92 70 L 100 74 L 108 70 Q 122 76, 132 84 L 136 82 Q 134 74, 128 68 Q 112 56, 100 52 Z",
  },
  // Left posterior deltoid
  {
    id: "deltoid-post-l",
    d: "M 66 72 Q 58 76, 54 82 Q 50 88, 52 96 Q 56 98, 60 94 Q 62 88, 64 82 Q 66 78, 70 74 Z",
  },
  // Right posterior deltoid
  {
    id: "deltoid-post-r",
    d: "M 134 72 Q 142 76, 146 82 Q 150 88, 148 96 Q 144 98, 140 94 Q 138 88, 136 82 Q 134 78, 130 74 Z",
  },
  // Left infraspinatus
  {
    id: "infraspinatus-l",
    d: "M 92 80 Q 84 82, 76 86 Q 70 90, 68 96 Q 72 100, 80 98 Q 86 94, 92 90 Z",
  },
  // Right infraspinatus
  {
    id: "infraspinatus-r",
    d: "M 108 80 Q 116 82, 124 86 Q 130 90, 132 96 Q 128 100, 120 98 Q 114 94, 108 90 Z",
  },
  // Left latissimus dorsi
  {
    id: "lat-l",
    d: "M 68 98 Q 64 108, 62 120 Q 60 134, 62 148 Q 66 156, 74 152 Q 78 142, 80 130 Q 82 118, 80 106 Q 78 100, 72 98 Z",
  },
  // Right latissimus dorsi
  {
    id: "lat-r",
    d: "M 132 98 Q 136 108, 138 120 Q 140 134, 138 148 Q 134 156, 126 152 Q 122 142, 120 130 Q 118 118, 120 106 Q 122 100, 128 98 Z",
  },
  // Left triceps
  {
    id: "triceps-l",
    d: "M 56 94 Q 52 100, 48 108 Q 44 116, 42 124 L 46 126 Q 48 118, 52 110 Q 56 102, 60 96 Z",
  },
  // Right triceps
  {
    id: "triceps-r",
    d: "M 144 94 Q 148 100, 152 108 Q 156 116, 158 124 L 154 126 Q 152 118, 148 110 Q 144 102, 140 96 Z",
  },
  // Erector spinae (parallel bands along spine)
  {
    id: "erector-spinae-l",
    d: "M 92 70 Q 90 90, 90 110 Q 88 130, 88 148 L 92 150 Q 92 130, 94 110 Q 94 90, 94 72 Z",
  },
  {
    id: "erector-spinae-r",
    d: "M 108 70 Q 110 90, 110 110 Q 112 130, 112 148 L 108 150 Q 108 130, 106 110 Q 106 90, 106 72 Z",
  },
  // Left gluteus maximus
  {
    id: "glute-l",
    d: "M 98 168 Q 90 172, 82 178 Q 74 184, 70 190 Q 68 196, 76 196 Q 82 194, 88 190 Q 94 184, 98 176 Z",
  },
  // Right gluteus maximus
  {
    id: "glute-r",
    d: "M 102 168 Q 110 172, 118 178 Q 126 184, 130 190 Q 132 196, 124 196 L 118 196 Q 112 194, 106 184 Q 102 176, 102 168 Z",
  },
  // Left biceps femoris (hamstring lateral)
  {
    id: "bf-l",
    d: "M 74 198 Q 72 218, 70 240 Q 68 260, 68 280 L 72 282 Q 74 262, 76 242 Q 78 222, 78 200 Z",
  },
  // Left semitendinosus (hamstring medial)
  {
    id: "semitend-l",
    d: "M 86 198 Q 86 218, 86 240 Q 84 260, 84 280 L 80 282 Q 80 262, 80 242 Q 82 222, 82 200 Z",
  },
  // Right biceps femoris
  {
    id: "bf-r",
    d: "M 126 198 Q 128 218, 130 240 Q 132 260, 132 280 L 128 282 Q 126 262, 124 242 Q 122 222, 122 200 Z",
  },
  // Right semitendinosus
  {
    id: "semitend-r",
    d: "M 114 198 Q 114 218, 114 240 Q 116 260, 116 280 L 120 282 Q 120 262, 120 242 Q 118 222, 118 200 Z",
  },
  // Left gastrocnemius
  {
    id: "gastroc-l",
    d: "M 72 302 Q 70 316, 70 332 Q 70 346, 72 358 L 76 358 Q 78 346, 78 332 Q 80 316, 80 304 Z M 82 304 Q 82 316, 82 332 Q 82 346, 80 358 L 84 358 Q 86 346, 86 332 Q 86 316, 86 304 Z",
  },
  // Right gastrocnemius
  {
    id: "gastroc-r",
    d: "M 128 302 Q 130 316, 130 332 Q 130 346, 128 358 L 124 358 Q 122 346, 122 332 Q 120 316, 120 304 Z M 118 304 Q 118 316, 118 332 Q 118 346, 120 358 L 116 358 Q 114 346, 114 332 Q 114 316, 114 304 Z",
  },
]
