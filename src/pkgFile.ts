import { fileExists } from './fileExists'

/**
 * Finds a cached package file for the given package at a given version.
 */
export async function pkgFile(pkg: string, version: string): Promise<string> {
  for (const arch of ['x86_64', 'any']) {
    const file = `/var/cache/pacman/pkg/${pkg}-${version}-${arch}.pkg.tar.xz`
    if (await fileExists(file)) {
      return file;
    }
  }

  throw new Error(`Could not find package file for ${pkg}@${version}.`)
}
