import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({root:resolve('mock-relying-party-ui'),envDir:resolve('.'),build:{target:'es2022',outDir:resolve('dist'),emptyOutDir:true}});
