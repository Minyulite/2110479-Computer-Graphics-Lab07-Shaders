#ifndef NOISE_GLSL_INCLUDED
#define NOISE_GLSL_INCLUDED

uint pcg(uint v) {
  v = v * 747796405u + 2891336453u;
  uint w = ((v >> ((v >> 28u) + 4u)) ^ v) * 277803737u;
  return (w >> 22u) ^ w;
}

float hash(uvec2 p) { return float(pcg(p.x ^ pcg(p.y))) / 4294967296.0; }

float value_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  uvec2 cell = uvec2(ivec2(i) + 1000);

  float bottomLeft  = hash(cell);
  float bottomRight = hash(cell + uvec2(1u, 0u));
  float topLeft     = hash(cell + uvec2(0u, 1u));
  float topRight    = hash(cell + uvec2(1u, 1u));

  vec2 blend = f * f * (3.0 - 2.0 * f);
  float bottom = mix(bottomLeft, bottomRight, blend.x);
  float top    = mix(topLeft, topRight, blend.x);
  return mix(bottom, top, blend.y);
}

float fbm(vec2 p, uint octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (uint i = 0u; i < octaves; ++i) {
    total += amplitude * value_noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return total;
}

#endif
