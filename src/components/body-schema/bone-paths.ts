import type { AnatomyPath } from "./types"

// ── ANTERIOR BONES (Front View) ─────────────────────────────────────────────
export const ANTERIOR_BONES: AnatomyPath[] = [
  // Skull
  {
    id: "skull-front",
    d: "M 100 12 C 110 12, 117 18, 117 28 C 117 38, 110 46, 100 46 C 90 46, 83 38, 83 28 C 83 18, 90 12, 100 12 Z",
    type: "flat-bone",
  },
  // Mandible
  {
    id: "mandible",
    d: "M 90 42 Q 92 48, 100 49 Q 108 48, 110 42",
    type: "irregular",
  },
  // Cervical spine (front, subtle)
  {
    id: "c-spine-front",
    d: "M 98 50 L 98 66 M 102 50 L 102 66",
    type: "vertebra",
  },
  // Left clavicle
  {
    id: "clavicle-l",
    d: "M 98 68 Q 82 65, 66 72",
    type: "long-bone",
  },
  // Right clavicle
  {
    id: "clavicle-r",
    d: "M 102 68 Q 118 65, 134 72",
    type: "long-bone",
  },
  // Sternum
  {
    id: "sternum",
    d: "M 96 68 L 96 72 L 94 72 L 94 100 L 96 104 L 100 106 L 104 104 L 106 100 L 106 72 L 104 72 L 104 68 Z",
    type: "flat-bone",
  },
  // Left ribs (6 arcs)
  {
    id: "rib-l-1",
    d: "M 94 74 Q 80 72, 68 78",
    type: "flat-bone",
  },
  {
    id: "rib-l-2",
    d: "M 94 80 Q 78 78, 66 84",
    type: "flat-bone",
  },
  {
    id: "rib-l-3",
    d: "M 94 86 Q 76 84, 64 90",
    type: "flat-bone",
  },
  {
    id: "rib-l-4",
    d: "M 94 92 Q 76 90, 66 96",
    type: "flat-bone",
  },
  {
    id: "rib-l-5",
    d: "M 94 98 Q 78 96, 70 102",
    type: "flat-bone",
  },
  {
    id: "rib-l-6",
    d: "M 96 104 Q 82 104, 74 108",
    type: "flat-bone",
  },
  // Right ribs (6 arcs)
  {
    id: "rib-r-1",
    d: "M 106 74 Q 120 72, 132 78",
    type: "flat-bone",
  },
  {
    id: "rib-r-2",
    d: "M 106 80 Q 122 78, 134 84",
    type: "flat-bone",
  },
  {
    id: "rib-r-3",
    d: "M 106 86 Q 124 84, 136 90",
    type: "flat-bone",
  },
  {
    id: "rib-r-4",
    d: "M 106 92 Q 124 90, 134 96",
    type: "flat-bone",
  },
  {
    id: "rib-r-5",
    d: "M 106 98 Q 122 96, 130 102",
    type: "flat-bone",
  },
  {
    id: "rib-r-6",
    d: "M 104 104 Q 118 104, 126 108",
    type: "flat-bone",
  },
  // Pelvis — iliac wings + symphysis
  {
    id: "pelvis",
    d: "M 100 148 L 92 150 Q 74 152, 66 160 Q 62 166, 68 174 L 78 178 Q 84 176, 88 172 L 92 168 L 100 166 L 108 168 L 112 172 Q 116 176, 122 178 L 132 174 Q 138 166, 134 160 Q 126 152, 108 150 Z",
    type: "flat-bone",
  },
  // Left humerus
  {
    id: "humerus-l",
    d: "M 60 82 L 44 110 L 40 124 L 44 124 L 48 112 L 64 84 Z",
    type: "long-bone",
  },
  // Right humerus
  {
    id: "humerus-r",
    d: "M 140 82 L 156 110 L 160 124 L 156 124 L 152 112 L 136 84 Z",
    type: "long-bone",
  },
  // Left radius
  {
    id: "radius-l",
    d: "M 40 126 L 28 156 L 24 170 L 27 170 L 32 156 L 43 128 Z",
    type: "long-bone",
  },
  // Left ulna
  {
    id: "ulna-l",
    d: "M 42 126 L 30 156 L 26 170 L 23 170 L 26 156 L 39 126 Z",
    type: "long-bone",
  },
  // Right radius
  {
    id: "radius-r",
    d: "M 160 126 L 172 156 L 176 170 L 173 170 L 168 156 L 157 128 Z",
    type: "long-bone",
  },
  // Right ulna
  {
    id: "ulna-r",
    d: "M 158 126 L 170 156 L 174 170 L 177 170 L 174 156 L 161 126 Z",
    type: "long-bone",
  },
  // Left femur
  {
    id: "femur-l",
    d: "M 82 180 L 76 220 L 74 260 L 72 286 L 78 286 L 80 260 L 82 220 L 88 180 Z",
    type: "long-bone",
  },
  // Right femur
  {
    id: "femur-r",
    d: "M 118 180 L 124 220 L 126 260 L 128 286 L 122 286 L 120 260 L 118 220 L 112 180 Z",
    type: "long-bone",
  },
  // Left patella
  {
    id: "patella-l",
    d: "M 75 288 Q 72 294, 75 300 Q 80 304, 85 300 Q 88 294, 85 288 Q 80 284, 75 288 Z",
    type: "irregular",
  },
  // Right patella
  {
    id: "patella-r",
    d: "M 115 288 Q 112 294, 115 300 Q 120 304, 125 300 Q 128 294, 125 288 Q 120 284, 115 288 Z",
    type: "irregular",
  },
  // Left tibia
  {
    id: "tibia-l",
    d: "M 76 304 L 70 340 L 66 360 L 70 362 L 74 342 L 80 306 Z",
    type: "long-bone",
  },
  // Left fibula
  {
    id: "fibula-l",
    d: "M 82 304 L 80 340 L 78 360 L 74 362 L 76 340 L 78 304 Z",
    type: "long-bone",
  },
  // Right tibia
  {
    id: "tibia-r",
    d: "M 124 304 L 130 340 L 134 360 L 130 362 L 126 342 L 120 306 Z",
    type: "long-bone",
  },
  // Right fibula
  {
    id: "fibula-r",
    d: "M 118 304 L 120 340 L 122 360 L 126 362 L 124 340 L 122 304 Z",
    type: "long-bone",
  },
  // Left hand bones (simplified metacarpals)
  {
    id: "hand-l",
    d: "M 18 174 L 14 184 L 10 192 L 14 192 L 18 184 L 22 178 Z",
    type: "irregular",
  },
  // Right hand bones
  {
    id: "hand-r",
    d: "M 182 174 L 186 184 L 190 192 L 186 192 L 182 184 L 178 178 Z",
    type: "irregular",
  },
  // Left foot bones
  {
    id: "foot-l",
    d: "M 52 380 L 48 388 Q 46 394, 54 396 L 64 396 Q 68 392, 66 386 L 62 378 Z",
    type: "irregular",
  },
  // Right foot bones
  {
    id: "foot-r",
    d: "M 148 380 L 152 388 Q 154 394, 146 396 L 136 396 Q 132 392, 134 386 L 138 378 Z",
    type: "irregular",
  },
]

// ── POSTERIOR BONES (Back View) ─────────────────────────────────────────────
export const POSTERIOR_BONES: AnatomyPath[] = [
  // Skull (occiput)
  {
    id: "skull-back",
    d: "M 100 12 C 110 12, 117 18, 117 28 C 117 38, 110 46, 100 46 C 90 46, 83 38, 83 28 C 83 18, 90 12, 100 12 Z",
    type: "flat-bone",
  },
  // C1 Atlas
  { id: "c1", d: "M 96 52 L 104 52 L 104 55 L 96 55 Z", type: "vertebra" },
  // C2 Axis
  { id: "c2", d: "M 96 56 L 104 56 L 104 59 L 96 59 Z", type: "vertebra" },
  // C3-C7
  { id: "c3", d: "M 96 60 L 104 60 L 104 62 L 96 62 Z", type: "vertebra" },
  { id: "c4", d: "M 96 63 L 104 63 L 104 65 L 96 65 Z", type: "vertebra" },
  // T1-T12 (thoracic vertebrae with spinous processes)
  { id: "t1", d: "M 95 68 L 105 68 L 105 71 L 95 71 Z M 99 68 L 101 68 L 101 66 L 99 66 Z", type: "vertebra" },
  { id: "t2", d: "M 95 72 L 105 72 L 105 75 L 95 75 Z M 99 72 L 101 72 L 101 70 L 99 70 Z", type: "vertebra" },
  { id: "t3", d: "M 95 76 L 105 76 L 105 79 L 95 79 Z M 99 76 L 101 76 L 101 74 L 99 74 Z", type: "vertebra" },
  { id: "t4", d: "M 95 80 L 105 80 L 105 83 L 95 83 Z M 99 80 L 101 80 L 101 78 L 99 78 Z", type: "vertebra" },
  { id: "t5", d: "M 95 84 L 105 84 L 105 87 L 95 87 Z M 99 84 L 101 84 L 101 82 L 99 82 Z", type: "vertebra" },
  { id: "t6", d: "M 94 88 L 106 88 L 106 91 L 94 91 Z M 99 88 L 101 88 L 101 86 L 99 86 Z", type: "vertebra" },
  { id: "t7", d: "M 94 92 L 106 92 L 106 95 L 94 95 Z M 99 92 L 101 92 L 101 90 L 99 90 Z", type: "vertebra" },
  { id: "t8", d: "M 94 96 L 106 96 L 106 99 L 94 99 Z M 99 96 L 101 96 L 101 94 L 99 94 Z", type: "vertebra" },
  { id: "t9", d: "M 94 100 L 106 100 L 106 103 L 94 103 Z M 99 100 L 101 100 L 101 98 L 99 98 Z", type: "vertebra" },
  { id: "t10", d: "M 94 104 L 106 104 L 106 107 L 94 107 Z M 99 104 L 101 104 L 101 102 L 99 102 Z", type: "vertebra" },
  { id: "t11", d: "M 94 108 L 106 108 L 106 111 L 94 111 Z M 99 108 L 101 108 L 101 106 L 99 106 Z", type: "vertebra" },
  { id: "t12", d: "M 94 112 L 106 112 L 106 115 L 94 115 Z M 99 112 L 101 112 L 101 110 L 99 110 Z", type: "vertebra" },
  // L1-L5 (lumbar — wider vertebral bodies)
  { id: "l1", d: "M 93 117 L 107 117 L 107 121 L 93 121 Z M 99 117 L 101 117 L 101 115 L 99 115 Z", type: "vertebra" },
  { id: "l2", d: "M 93 123 L 107 123 L 107 127 L 93 127 Z M 99 123 L 101 123 L 101 121 L 99 121 Z", type: "vertebra" },
  { id: "l3", d: "M 92 129 L 108 129 L 108 133 L 92 133 Z M 99 129 L 101 129 L 101 127 L 99 127 Z", type: "vertebra" },
  { id: "l4", d: "M 92 135 L 108 135 L 108 139 L 92 139 Z M 99 135 L 101 135 L 101 133 L 99 133 Z", type: "vertebra" },
  { id: "l5", d: "M 92 141 L 108 141 L 108 145 L 92 145 Z M 99 141 L 101 141 L 101 139 L 99 139 Z", type: "vertebra" },
  // Sacrum
  {
    id: "sacrum",
    d: "M 92 147 L 108 147 L 106 162 L 102 168 L 98 168 L 94 162 Z",
    type: "irregular",
  },
  // Coccyx
  {
    id: "coccyx",
    d: "M 98 168 L 102 168 L 101 174 L 99 174 Z",
    type: "irregular",
  },
  // Left scapula
  {
    id: "scapula-l",
    d: "M 92 72 L 72 76 L 68 80 L 66 92 L 68 100 L 76 104 L 88 96 L 92 88 Z",
    type: "flat-bone",
  },
  // Right scapula
  {
    id: "scapula-r",
    d: "M 108 72 L 128 76 L 132 80 L 134 92 L 132 100 L 124 104 L 112 96 L 108 88 Z",
    type: "flat-bone",
  },
  // Posterior ribs left (6)
  {
    id: "rib-post-l-1",
    d: "M 94 74 Q 80 72, 66 80",
    type: "flat-bone",
  },
  {
    id: "rib-post-l-2",
    d: "M 94 80 Q 78 78, 64 86",
    type: "flat-bone",
  },
  {
    id: "rib-post-l-3",
    d: "M 94 88 Q 76 86, 62 94",
    type: "flat-bone",
  },
  {
    id: "rib-post-l-4",
    d: "M 94 96 Q 76 94, 64 100",
    type: "flat-bone",
  },
  {
    id: "rib-post-l-5",
    d: "M 94 104 Q 78 102, 68 108",
    type: "flat-bone",
  },
  {
    id: "rib-post-l-6",
    d: "M 94 112 Q 80 110, 72 114",
    type: "flat-bone",
  },
  // Posterior ribs right (6)
  {
    id: "rib-post-r-1",
    d: "M 106 74 Q 120 72, 134 80",
    type: "flat-bone",
  },
  {
    id: "rib-post-r-2",
    d: "M 106 80 Q 122 78, 136 86",
    type: "flat-bone",
  },
  {
    id: "rib-post-r-3",
    d: "M 106 88 Q 124 86, 138 94",
    type: "flat-bone",
  },
  {
    id: "rib-post-r-4",
    d: "M 106 96 Q 124 94, 136 100",
    type: "flat-bone",
  },
  {
    id: "rib-post-r-5",
    d: "M 106 104 Q 122 102, 132 108",
    type: "flat-bone",
  },
  {
    id: "rib-post-r-6",
    d: "M 106 112 Q 120 110, 128 114",
    type: "flat-bone",
  },
  // Pelvis posterior
  {
    id: "pelvis-post",
    d: "M 100 148 L 92 150 Q 72 154, 64 164 Q 60 170, 66 178 L 78 182 Q 86 178, 90 172 L 96 168 L 100 166 L 104 168 L 110 172 Q 114 178, 122 182 L 134 178 Q 140 170, 136 164 Q 128 154, 108 150 Z",
    type: "flat-bone",
  },
  // Left humerus posterior
  {
    id: "humerus-post-l",
    d: "M 58 84 L 42 112 L 38 126 L 42 126 L 46 114 L 62 86 Z",
    type: "long-bone",
  },
  // Right humerus posterior
  {
    id: "humerus-post-r",
    d: "M 142 84 L 158 112 L 162 126 L 158 126 L 154 114 L 138 86 Z",
    type: "long-bone",
  },
  // Left radius posterior
  {
    id: "radius-post-l",
    d: "M 38 128 L 26 158 L 22 172 L 25 172 L 30 158 L 41 130 Z",
    type: "long-bone",
  },
  // Left ulna posterior
  {
    id: "ulna-post-l",
    d: "M 40 128 L 28 158 L 24 172 L 21 172 L 24 158 L 37 128 Z",
    type: "long-bone",
  },
  // Right radius posterior
  {
    id: "radius-post-r",
    d: "M 162 128 L 174 158 L 178 172 L 175 172 L 170 158 L 159 130 Z",
    type: "long-bone",
  },
  // Right ulna posterior
  {
    id: "ulna-post-r",
    d: "M 160 128 L 172 158 L 176 172 L 179 172 L 176 158 L 163 128 Z",
    type: "long-bone",
  },
  // Left femur posterior
  {
    id: "femur-post-l",
    d: "M 82 184 L 78 220 L 76 260 L 74 288 L 80 288 L 82 260 L 84 220 L 88 184 Z",
    type: "long-bone",
  },
  // Right femur posterior
  {
    id: "femur-post-r",
    d: "M 118 184 L 122 220 L 124 260 L 126 288 L 120 288 L 118 260 L 116 220 L 112 184 Z",
    type: "long-bone",
  },
  // Left tibia posterior
  {
    id: "tibia-post-l",
    d: "M 76 302 L 72 338 L 68 358 L 72 360 L 76 340 L 80 304 Z",
    type: "long-bone",
  },
  // Left fibula posterior
  {
    id: "fibula-post-l",
    d: "M 82 302 L 80 338 L 78 358 L 74 360 L 76 338 L 78 302 Z",
    type: "long-bone",
  },
  // Right tibia posterior
  {
    id: "tibia-post-r",
    d: "M 124 302 L 128 338 L 132 358 L 128 360 L 124 340 L 120 304 Z",
    type: "long-bone",
  },
  // Right fibula posterior
  {
    id: "fibula-post-r",
    d: "M 118 302 L 120 338 L 122 358 L 126 360 L 124 338 L 122 302 Z",
    type: "long-bone",
  },
  // Left foot posterior
  {
    id: "foot-post-l",
    d: "M 70 378 L 66 386 Q 64 392, 72 394 L 82 394 Q 88 390, 86 384 L 80 376 Z",
    type: "irregular",
  },
  // Right foot posterior
  {
    id: "foot-post-r",
    d: "M 130 378 L 134 386 Q 136 392, 128 394 L 118 394 Q 112 390, 114 384 L 120 376 Z",
    type: "irregular",
  },
]
