"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"

/* ── Single Vertebra ──────────────────────────────────────────────────── */
function Vertebra({
  position,
  scale = 1,
  index,
  mousePos,
}: {
  position: [number, number, number]
  scale?: number
  index: number
  mousePos: React.MutableRefObject<{ x: number; y: number }>
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // Subtle breathing animation — each vertebra slightly offset
    const breathe = Math.sin(t * 0.8 + index * 0.3) * 0.02
    meshRef.current.scale.setScalar(scale + breathe)

    // React to mouse — tilt toward cursor
    const mx = mousePos.current.x * 0.15
    const my = mousePos.current.y * 0.08
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mx + Math.sin(t * 0.5 + index * 0.2) * 0.05,
      0.05
    )
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      my * 0.3,
      0.05
    )

    // Glow pulse
    if (glowRef.current) {
      const glowIntensity = 0.3 + Math.sin(t * 1.2 + index * 0.5) * 0.15
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity
    }
  })

  // Vertebra shape: wider than tall, with spinous process look
  const vertebraShape = useMemo(() => {
    const shape = new THREE.Shape()
    const w = 0.5 * scale
    const h = 0.25 * scale
    // Rounded kidney shape
    shape.moveTo(-w, 0)
    shape.bezierCurveTo(-w, h * 1.2, -w * 0.3, h * 1.4, 0, h * 1.5)
    shape.bezierCurveTo(w * 0.3, h * 1.4, w, h * 1.2, w, 0)
    shape.bezierCurveTo(w, -h * 0.8, w * 0.4, -h * 1.0, 0, -h * 0.6)
    shape.bezierCurveTo(-w * 0.4, -h * 1.0, -w, -h * 0.8, -w, 0)
    return shape
  }, [scale])

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.12 * scale,
      bevelEnabled: true,
      bevelThickness: 0.04 * scale,
      bevelSize: 0.03 * scale,
      bevelSegments: 4,
    }),
    [scale]
  )

  return (
    <group position={position}>
      {/* Main vertebra body */}
      <mesh ref={meshRef} castShadow>
        <extrudeGeometry args={[vertebraShape, extrudeSettings]} />
        <meshPhysicalMaterial
          color="#4a9e7a"
          transparent
          opacity={0.75}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.6}
          ior={1.4}
          thickness={0.5}
          envMapIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glow halo */}
      <mesh ref={glowRef} position={[0, 0, 0.06 * scale]}>
        <ringGeometry args={[0.35 * scale, 0.55 * scale, 32]} />
        <meshBasicMaterial
          color="#7CB69D"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/* ── Nerve Particles ──────────────────────────────────────────────────── */
function NerveParticles({ count = 120 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Spread along spine axis
      pos[i * 3] = (Math.random() - 0.5) * 1.5
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8

      // Velocity: mostly downward along spine
      vel[i * 3] = (Math.random() - 0.5) * 0.003
      vel[i * 3 + 1] = -0.005 - Math.random() * 0.008
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    return [pos, vel]
  }, [count])

  const sizes = useMemo(() => {
    const s = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      s[i] = 0.02 + Math.random() * 0.04
    }
    return s
  }, [count])

  useFrame(() => {
    if (!pointsRef.current) return
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i * 3]
      posArr[i * 3 + 1] += velocities[i * 3 + 1]
      posArr[i * 3 + 2] += velocities[i * 3 + 2]

      // Reset if too far
      if (posArr[i * 3 + 1] < -3) {
        posArr[i * 3] = (Math.random() - 0.5) * 1.2
        posArr[i * 3 + 1] = 2.5 + Math.random()
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      }

      // Attract toward center spine axis
      posArr[i * 3] *= 0.998
      posArr[i * 3 + 2] *= 0.998
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* @ts-expect-error R3F bufferAttribute args typing */}
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        {/* @ts-expect-error R3F bufferAttribute args typing */}
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#7CB69D"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Spinal Cord (center nerve line) ──────────────────────────────────── */
function SpinalCord() {
  const tubeRef = useRef<THREE.Mesh>(null)

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.8, 0),
      new THREE.Vector3(0.05, 2.0, 0.02),
      new THREE.Vector3(-0.03, 1.2, -0.01),
      new THREE.Vector3(0.02, 0.4, 0.01),
      new THREE.Vector3(-0.02, -0.4, -0.02),
      new THREE.Vector3(0.03, -1.2, 0.01),
      new THREE.Vector3(0, -2.0, 0),
      new THREE.Vector3(0, -2.6, 0),
    ])
  }, [])

  useFrame((state) => {
    if (!tubeRef.current) return
    const mat = tubeRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
  })

  return (
    <mesh ref={tubeRef}>
      <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
      <meshBasicMaterial
        color="#2D6A4F"
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

/* ── Nerve Branches ───────────────────────────────────────────────────── */
function NerveBranch({
  start,
  end,
  delay,
}: {
  start: [number, number, number]
  end: [number, number, number]
  delay: number
}) {
  const lineRef = useRef<THREE.Line>(null)

  const geometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.1,
        (start[2] + end[2]) / 2 + 0.1
      ),
      new THREE.Vector3(...end)
    )
    const points = curve.getPoints(20)
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [start, end])

  useFrame((state) => {
    if (!lineRef.current) return
    const mat = lineRef.current.material as THREE.LineBasicMaterial
    const t = state.clock.elapsedTime
    mat.opacity = 0.15 + Math.sin(t * 1.5 + delay) * 0.1
  })

  // Use primitive to avoid R3F/SVG <line> naming conflict
  return (
    <primitive
      object={Object.assign(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#D4A574", transparent: true, opacity: 0.2 })), {})}
      ref={lineRef}
    />
  )
}

/* ── Mouse-Following Light ────────────────────────────────────────────── */
function MouseLight({
  mousePos,
}: {
  mousePos: React.MutableRefObject<{ x: number; y: number }>
}) {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (!lightRef.current) return
    lightRef.current.position.x = THREE.MathUtils.lerp(
      lightRef.current.position.x,
      mousePos.current.x * 3,
      0.05
    )
    lightRef.current.position.y = THREE.MathUtils.lerp(
      lightRef.current.position.y,
      mousePos.current.y * 2,
      0.05
    )
  })

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 3]}
      intensity={2}
      color="#7CB69D"
      distance={8}
      decay={2}
    />
  )
}

/* ── Scene ────────────────────────────────────────────────────────────── */
function SpineScene() {
  const mousePos = useRef({ x: 0, y: 0 })
  const groupRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  // Slow rotation
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.05
  })

  // Vertebrae positions (curved spine shape)
  const vertebrae = useMemo(
    () => [
      { pos: [0, 2.4, 0] as [number, number, number], scale: 0.55 },
      { pos: [0.03, 2.0, 0.02] as [number, number, number], scale: 0.62 },
      { pos: [0.05, 1.55, 0.03] as [number, number, number], scale: 0.7 },
      { pos: [0.04, 1.1, 0.02] as [number, number, number], scale: 0.78 },
      { pos: [0.02, 0.6, 0.01] as [number, number, number], scale: 0.85 },
      { pos: [0, 0.1, 0] as [number, number, number], scale: 0.9 },
      { pos: [-0.02, -0.4, -0.01] as [number, number, number], scale: 0.9 },
      { pos: [-0.03, -0.9, -0.02] as [number, number, number], scale: 0.85 },
      { pos: [-0.02, -1.35, -0.01] as [number, number, number], scale: 0.78 },
      { pos: [0, -1.8, 0] as [number, number, number], scale: 0.68 },
      { pos: [0, -2.2, 0] as [number, number, number], scale: 0.55 },
    ],
    []
  )

  // Nerve branches
  const nerves = useMemo(
    () => [
      { start: [0, 2.0, 0] as [number, number, number], end: [-1.2, 2.2, 0.3] as [number, number, number] },
      { start: [0, 2.0, 0] as [number, number, number], end: [1.2, 2.3, 0.2] as [number, number, number] },
      { start: [0, 1.1, 0] as [number, number, number], end: [-1.3, 0.8, 0.4] as [number, number, number] },
      { start: [0, 1.1, 0] as [number, number, number], end: [1.3, 0.9, 0.3] as [number, number, number] },
      { start: [0, 0.1, 0] as [number, number, number], end: [-1.4, -0.1, 0.3] as [number, number, number] },
      { start: [0, 0.1, 0] as [number, number, number], end: [1.4, 0.0, 0.2] as [number, number, number] },
      { start: [0, -0.9, 0] as [number, number, number], end: [-1.3, -1.2, 0.4] as [number, number, number] },
      { start: [0, -0.9, 0] as [number, number, number], end: [1.3, -1.1, 0.3] as [number, number, number] },
      { start: [0, -1.8, 0] as [number, number, number], end: [-1.1, -2.1, 0.3] as [number, number, number] },
      { start: [0, -1.8, 0] as [number, number, number], end: [1.1, -2.0, 0.2] as [number, number, number] },
    ],
    []
  )

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-3, -2, 4]} intensity={0.4} color="#7CB69D" />
      <MouseLight mousePos={mousePos} />

      {/* Fill light for glass reflections */}
      <pointLight position={[-4, 3, 2]} intensity={1.5} color="#a8d8c0" distance={12} />
      <pointLight position={[3, -2, 4]} intensity={0.8} color="#D4A574" distance={10} />

      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.3}
        floatingRange={[-0.1, 0.1]}
      >
        <group ref={groupRef}>
          {/* Spinal cord */}
          <SpinalCord />

          {/* Vertebrae */}
          {vertebrae.map((v, i) => (
            <Vertebra
              key={i}
              position={v.pos}
              scale={v.scale}
              index={i}
              mousePos={mousePos}
            />
          ))}

          {/* Nerve branches */}
          {nerves.map((n, i) => (
            <NerveBranch
              key={`nerve-${i}`}
              start={n.start}
              end={n.end}
              delay={i * 0.5}
            />
          ))}

          {/* Particles flowing along spine */}
          <NerveParticles count={150} />
        </group>
      </Float>
    </>
  )
}

/* ── Exported Component ───────────────────────────────────────────────── */
export function Spine3D({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={className}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-landing-accent/20 border-t-landing-accent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <SpineScene />
      </Canvas>
    </div>
  )
}
