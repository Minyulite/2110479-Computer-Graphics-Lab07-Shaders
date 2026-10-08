#version 450
#extension GL_GOOGLE_include_directive : require

#include <shadertoy.glsl>
#include <noise.glsl>

float sdf_circle(vec2 p, float r) {
  return length(p) - r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  vec2 mouseP = (2.0 * iMouse.xy - iResolution.xy) / iResolution.y;

  vec2 center = vec2(0.38 * sin(iTime * 0.55),
                     0.20 * cos(iTime * 0.73));
  if (iMouse.z > 0.0) center = mouseP;

  vec2 heading = normalize(vec2(1.0, 0.35 * sin(iTime * 0.9)));
  float mist = fbm(p * 2.3 + vec2(iTime * 0.08, -iTime * 0.05), 4u);

  float coreD = sdf_circle(p - center, 0.105 + 0.008 * sin(iTime * 4.0));

  vec2 tailVector = -heading * 0.82;
  vec2 fromCore = p - center;
  float tailPosition = clamp(dot(fromCore, tailVector) /
                             dot(tailVector, tailVector), 0.0, 1.0);
  float tailRadius = mix(0.055, 0.004, tailPosition);
  float tailD = length(fromCore - tailVector * tailPosition) - tailRadius;
  tailD += (mist - 0.5) * 0.035 * tailPosition;

  float cometD = min(coreD, tailD);
  float edgeWidth = 2.0 / iResolution.y;
  float cometMask = smoothstep(edgeWidth, -edgeWidth, cometD);
  float coreMask = smoothstep(edgeWidth, -edgeWidth, coreD);
  float tailMask = smoothstep(edgeWidth, -edgeWidth, tailD);
  float glow = exp(-10.0 * max(cometD, 0.0));

  vec2 starPosition = (p + vec2(2.0)) * 34.0;
  uvec2 starCell = uvec2(ivec2(floor(starPosition)));
  vec2 starLocal = fract(starPosition) - 0.5;
  float starRandom = hash(starCell);
  float star = step(0.985, starRandom)
             * smoothstep(0.10, 0.0, length(starLocal))
             * (0.65 + 0.35 * sin(iTime * 3.0 + starRandom * 20.0));

  vec3 col = mix(vec3(0.005, 0.010, 0.035),
                 vec3(0.10, 0.025, 0.16), smoothstep(0.22, 0.82, mist));
  col += star * vec3(0.65, 0.80, 1.0);

  vec3 tailColor = mix(vec3(0.10, 0.75, 1.0),
                       vec3(0.95, 0.30, 0.75), tailPosition);
  col += tailColor * tailMask * (0.45 + 0.55 * (1.0 - tailPosition));
  col += vec3(0.20, 0.75, 1.0) * glow * 0.35;
  col = mix(col, vec3(1.0, 0.88, 0.58), coreMask);

  uint mode = iMode;
  if (mode == 1u)
    col = vec3(mist);
  else if (mode == 2u)
    col = vec3(clamp(cometD * 0.5 + 0.5, 0.0, 1.0));
  else if (mode == 3u)
    col = vec3(coreMask, tailMask, glow);

  fragColor = vec4(col, 1.0);
}
