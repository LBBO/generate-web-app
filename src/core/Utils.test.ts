import { generateMockExtension } from '../extensions/MockExtension'
import { getDeepDependencies } from './Utils'

describe('getDeepDependencies', () => {
  it('should return the normal dependencies', () => {
    const a = generateMockExtension()
    const b = generateMockExtension()
    const c = generateMockExtension()
    const d = generateMockExtension({ dependsOn: [a, b, c] })

    const deepDependencies = getDeepDependencies(d)

    expect(deepDependencies).toContain(a)
    expect(deepDependencies).toContain(b)
    expect(deepDependencies).toContain(c)
  })

  it('should return all deep dependencies', () => {
    const a = generateMockExtension()
    const b = generateMockExtension({ dependsOn: [a] })
    const c = generateMockExtension()
    const d = generateMockExtension({ dependsOn: [c] })
    const e = generateMockExtension({ dependsOn: [d] })
    const f = generateMockExtension({ dependsOn: [b, e] })

    const deepDependencies = getDeepDependencies(f)

    expect(deepDependencies).toContain(a)
    expect(deepDependencies).toContain(b)
    expect(deepDependencies).toContain(c)
    expect(deepDependencies).toContain(d)
    expect(deepDependencies).toContain(e)
  })
})
