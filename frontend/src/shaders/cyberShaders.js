// GLSL shader sources for the R3F scene.
// Two shaders included:
//   1. particleShader — noise-driven drift for the 400 point cyan/magenta field
//   2. phosphorMatrixShader — CRT phosphor-grid effect for the iris gate portal
//      (procedural signal source — mimics a live video feed without needing
//      the user's camera permission).

// ---------------- Particle field ----------------
export const particleVertexShader = /* glsl */ `
  uniform float u_time;
  uniform float u_size;
  attribute float a_seed;
  attribute vec3 a_color;
  varying vec3 v_color;
  varying float v_alpha;

  // Cheap 3D noise
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    v_color = a_color;
    vec3 pos = position;
    float t = u_time * 0.35 + a_seed * 6.28;
    pos.x += sin(t + a_seed * 4.7) * 0.6;
    pos.y += cos(t * 0.7 + a_seed * 3.3) * 0.5 + sin(u_time * 0.2 + a_seed) * 0.2;
    pos.z += sin(t * 0.5 + a_seed * 2.1) * 0.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // twinkle
    float tw = 0.5 + 0.5 * sin(u_time * 3.0 + a_seed * 12.0);
    v_alpha = 0.3 + tw * 0.5;
    gl_PointSize = u_size * (30.0 / -mv.z) * (0.6 + tw * 0.6);
  }
`;

export const particleFragmentShader = /* glsl */ `
  precision mediump float;
  varying vec3 v_color;
  varying float v_alpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(v_color, glow * v_alpha);
  }
`;

// ---------------- Phosphor Matrix (iris gate portal) ----------------
export const phosphorMatrixVertex = /* glsl */ `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const phosphorMatrixFragment = /* glsl */ `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_intensity;
  varying vec2 v_uv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = v_uv;

    // Simulated "video feed" — layered noise that flows sideways
    float feed = noise(uv * 3.0 + vec2(u_time * 0.15, 0.0));
    feed += 0.5 * noise(uv * 8.0 - vec2(u_time * 0.25, u_time * 0.05));
    feed += 0.25 * noise(uv * 18.0 + vec2(0.0, u_time * 0.4));
    feed *= 0.55;

    // downsample to phosphor tiles
    vec2 tiles = vec2(120.0, 90.0);
    vec2 gridUv = floor(uv * tiles) / tiles;
    float tileFeed = noise(gridUv * 6.0 + vec2(u_time * 0.15, 0.0));

    float brightness = mix(feed, tileFeed, 0.55);
    brightness = pow(brightness, 1.4);

    // scanlines
    float scan = sin(uv.y * u_resolution.y * 1.6 + u_time * 12.0) * 0.18;

    // color mapping — cyan phosphor with magenta chromatic drift
    vec3 col = vec3(0.0, 0.94, 1.0) * brightness;
    col.r += 0.35 * brightness * sin(u_time * 1.5 + uv.y * 40.0);
    col -= scan;

    // random glitch bursts
    if (fract(sin(u_time * 5.0) * 43758.5453) > 0.985) {
      col += vec3(0.4, 0.0, 0.6) * brightness;
    }

    // vignette
    float d = length(uv - 0.5);
    col *= smoothstep(0.75, 0.25, d);

    // alpha driven by brightness so the ring shows through darkness
    float alpha = clamp(brightness * 1.8 + 0.15, 0.0, 1.0) * u_intensity;

    gl_FragColor = vec4(col, alpha);
  }
`;
