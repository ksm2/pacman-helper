import fs from 'fs'

export async function fileExists(filename: fs.PathLike): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filename)
    return stat.isFile()
  } catch (e) {
    return false
  }
}
