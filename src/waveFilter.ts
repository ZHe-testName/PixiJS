import { Filter, GlProgram, defaultFilterVert } from 'pixi.js'

const fragment = `
  in vec2 vTextureCoord;
  out vec4 finalColor;
  
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec4 uInputClamp;

  void main() {
    vec2 uv = vTextureCoord;
    uv.x += sin(uv.y * 20.0 + uTime) * 0.08;
    uv = clamp(uv, uInputClamp.xy, uInputClamp.zw);
    finalColor = texture(uTexture, uv);
  }
`

export function createWaveFilter(): Filter {
  return new Filter({
    padding: 20,
    glProgram: GlProgram.from({
      fragment,
      vertex: defaultFilterVert,
      name: 'wave-filter',
    }),
    resources: {
      timeUniforms: {
        uTime: { value: 0, type: 'f32', }
      }
    }
  })
}