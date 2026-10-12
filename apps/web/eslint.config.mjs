import { createConfig } from '@me/config/eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig } from 'eslint/config';

export default defineConfig([...nextVitals, ...createConfig(import.meta.dirname)]);
