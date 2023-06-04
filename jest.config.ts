import type { Config } from '@jest/types'

const jestConfig: Config.InitialOptions = {
    collectCoverageFrom: [
        'src/**/*.ts',
    ],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    roots: [
        '<rootDir>/src',
    ],
    testEnvironment: 'node',
    transform: {
        '.+\.tsx?$': '@swc/jest',
    },
}

export default jestConfig
