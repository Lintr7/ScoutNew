"use client";;
import { cn } from "../../lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  opacities = [0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.6, 0.6, 0.6, 0.8],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true
}) => {
  return (
    <div className={cn("h-full relative", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={
            opacities ?? [0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.6, 0.6, 0.6, 0.8]
          }
          shader={`
              // Create independent clusters: 15 small (2-3 dots) + 5 large (5-15 dots)
              float base_frequency = 0.08; // Very slow base timing
              
              float total_opacity = 0.0;
              
              // Create 20 independent clusters total (15 small + 5 large)
              for (float i = 0.0; i < 28.0; i++) {
                  // Each cluster has its own frequency and offset
                  float cluster_frequency = base_frequency + random(vec2(i * 17.0, i * 23.0)) * 0.04;
                  float cluster_offset = random(vec2(i * 31.0, i * 37.0)) * 100.0; // Random start time
                  
                  float time_cycle = (u_time + cluster_offset) * cluster_frequency;
                  float cluster_phase = fract(time_cycle);
                  vec2 cluster_seed = vec2(floor(time_cycle), i * 41.0);
                  
                  // Each cluster has a chance to be active (some cycles can be empty)
                  float cluster_active_chance = random(cluster_seed * 0.789);
                  if (cluster_active_chance < 0.4) continue; // 60% chance to be active
                  
                  // Random cluster center (changes each cycle)
                  float cluster_center_x = random(cluster_seed) * (u_resolution.x / u_total_size);
                  float cluster_center_y = random(cluster_seed * 2.0) * (u_resolution.y / u_total_size);
                  vec2 cluster_center = vec2(cluster_center_x, cluster_center_y);
                  
                  // Determine cluster size based on index
                  float cluster_size;
                  if (i < 12.0) {
                      // Small clusters (first 15): 2-3 dots radius
                      cluster_size = 1.0 + random(cluster_seed * 3.0) * 1.8; // 1-2 radius (2-3 dots)
                  } else {
                      // Large clusters (last 5): 5-15 dots radius  
                      cluster_size = 2.5 + random(cluster_seed * 3.0) * 6.8; // 2.5-7 radius (5-15 dots)
                  }
                  
                  // Calculate relative position from cluster center
                  vec2 rel_pos = st2 - cluster_center;
                  float dist_to_cluster = length(rel_pos);
                  
                  // Random shape parameters for this cluster
                  float shape_random = random(cluster_seed * 4.0);
                  float angle = atan(rel_pos.y, rel_pos.x);
                  
                  // Create different shapes based on random value
                  float shape_modifier = 1.0;
                  
                  if (shape_random < 0.3) {
                      // Oval/ellipse - stretch in one direction
                      float stretch = 0.5 + random(cluster_seed * 5.0) * 1.5;
                      float stretch_angle = random(cluster_seed * 6.0) * 6.28;
                      vec2 stretch_dir = vec2(cos(stretch_angle), sin(stretch_angle));
                      float stretch_factor = mix(1.0, stretch, abs(dot(normalize(rel_pos), stretch_dir)));
                      shape_modifier = stretch_factor;
                  } else if (shape_random < 0.6) {
                      // Wavy/flower shape
                      float waves = 2.0 + floor(random(cluster_seed * 9.0) * 3.0); // 3-5 waves
                      float wave_intensity = 0.2 + random(cluster_seed * 10.0) * 0.3;
                      shape_modifier = 1.0 + wave_intensity * cos(angle * waves);
                  } else if (shape_random < 0.8) {
                      // Random blob - multiple sine waves
                      float blob1 = 0.15 * sin(angle * 2.0 + random(cluster_seed * 11.0) * 6.28);
                      float blob2 = 0.1 * sin(angle * 5.0 + random(cluster_seed * 12.0) * 6.28);
                      shape_modifier = 1.0 + blob1 + blob2;
                  }
                  // else: keep circular (20% chance)
                  
                  // Apply shape modification to effective distance
                  float shaped_distance = dist_to_cluster * shape_modifier;
                  
                  // Create smooth cluster effect with falloff
                  float in_cluster = 1.0 - smoothstep(0.0, cluster_size, shaped_distance);
                  
                  // Very gradual fade timing - each cluster fades independently
                  float fade_in_duration = 0.4; // 40% of cycle for fade in
                  float visible_duration = 0.2; // 20% of cycle at full brightness
                  float fade_out_duration = 0.4; // 40% of cycle for fade out
                  
                  float fade_intensity = 0.0;
                  
                  if (cluster_phase <= fade_in_duration) {
                      // Very gradual fade in with triple smoothstep
                      float fade_progress = cluster_phase / fade_in_duration;
                      fade_intensity = smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, fade_progress)));
                  } else if (cluster_phase <= fade_in_duration + visible_duration) {
                      // Fully visible phase
                      fade_intensity = 1.0;
                  } else if (cluster_phase <= fade_in_duration + visible_duration + fade_out_duration) {
                      // Very gradual fade out with triple smoothstep
                      float fade_out_start = fade_in_duration + visible_duration;
                      float fade_progress = (cluster_phase - fade_out_start) / fade_out_duration;
                      fade_intensity = smoothstep(1.0, 0.0, smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, fade_progress)));
                  }
                  // else: invisible phase
                  
                  // Add this cluster's contribution to total opacity
                  total_opacity += in_cluster * fade_intensity;
              }
              
              // Apply final opacity, clamped to prevent over-brightening
              opacity *= clamp(total_opacity, 0.0, 1.0);
            `}
          center={["x", "y"]} />
      </div>
      {showGradient && (
        <div className="absolute inset-0" />
      )}
    </div>
  );
};

const DotMatrix = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 4,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[2],
        colors[2],
      ];
    }

    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
    };
  }, [colors, opacities, totalSize, dotSize]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        out vec4 fragColor;
        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }
        void main() {
            vec2 st = fragCoord.xy;
            ${
              center.includes("x")
                ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
                : ""
            }
            ${
              center.includes("y")
                ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
                : ""
            }
      float opacity = step(0.0, st.x);
      opacity *= step(0.0, st.y);

      vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

      float frequency = 5.0;
      float show_offset = random(st2);
      float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency) + 1.0);
      opacity *= u_opacities[int(rand * 10.0)];
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

      vec3 color = u_colors[int(show_offset * 6.0)];

      ${shader}

      fragColor = vec4(color, opacity);
      fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60} />
  );
};

const ShaderMaterial = ({
  source,
  uniforms,
  maxFps = 60
}) => {
  const { size } = useThree();
  const ref = useRef();
  let lastFrameTime = 0;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const timestamp = clock.getElapsedTime();
    if (timestamp - lastFrameTime < 1 / maxFps) {
      return;
    }
    lastFrameTime = timestamp;

    const material = ref.current.material;
    const timeLocation = material.uniforms.u_time;
    timeLocation.value = timestamp;
  });

  const getUniforms = () => {
    const preparedUniforms = {};

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];

      switch (uniform.type) {
        case "uniform1f":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
          break;
        case "uniform3f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector3().fromArray(uniform.value),
            type: "3f",
          };
          break;
        case "uniform1fv":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
          break;
        case "uniform3fv":
          preparedUniforms[uniformName] = {
            value: uniform.value.map((v) =>
              new THREE.Vector3().fromArray(v)),
            type: "3fv",
          };
          break;
        case "uniform2f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector2().fromArray(uniform.value),
            type: "2f",
          };
          break;
        default:
          console.error(`Invalid uniform type for '${uniformName}'.`);
          break;
      }
    }

    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_resolution"] = {
      value: new THREE.Vector2(size.width * 2, size.height * 2),
    }; // Initialize u_resolution
    return preparedUniforms;
  };

  // Shader material
  const material = useMemo(() => {
    const materialObject = new THREE.ShaderMaterial({
      vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        float x = position.x;
        float y = position.y;
        gl_Position = vec4(x, y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });

    return materialObject;
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader = ({ source, uniforms, maxFps = 60 }) => {
  return (
    <Canvas className="absolute inset-0  h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};