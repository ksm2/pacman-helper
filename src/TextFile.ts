import fs from 'fs'

const BUFFER_SIZE = 4069

export class TextFile {
  readonly path: fs.PathLike
  private readonly buffer = Buffer.alloc(BUFFER_SIZE)
  private handle?: fs.promises.FileHandle
  private offset = -1
  private position = -1
  private eof = false

  constructor(path: fs.PathLike) {
    this.path = path
  }

  [Symbol.asyncIterator]() {
    return this
  }

  async open() {
    this.handle = await fs.promises.open(this.path, 'r')
    const stat = await this.handle.stat()
    this.position = stat.size
    this.eof = await this.readBuffer()
  }

  async next(): Promise<IteratorResult<string>> {
    return this.internalNext()
  }

  private async internalNext(str?: string): Promise<IteratorResult<string>> {
    if (this.eof) {
      if (typeof str === 'string') {
        return { done: false, value: str }
      }

      return { done: true, value: undefined }
    }

    const start = this.offset
    for (let p = start - 1; p >= 0; p -= 1) {
      if (this.buffer.readUInt8(p) === 10) {
        const line = this.buffer.slice(p + 1, start).toString()
        this.offset = p

        return { done: false, value: line + (str || '') }
      }
    }

    const currentStr = `${this.buffer.slice(0, start)}${str || ''}`
    this.eof = await this.readBuffer()
    return this.internalNext(currentStr)
  }

  private async readBuffer(): Promise<boolean> {
    if (!this.handle) throw new TypeError('Please open the file first.')

    if (this.position === 0) {
      return true
    }

    const length = Math.min(this.position, BUFFER_SIZE)
    this.position -= length
    this.offset = length
    await this.handle.read(this.buffer, 0, length, this.position)
    return false
  }

  async close() {
    if (this.handle) {
      await this.handle.close()
      this.handle = null
      this.position = -1
    }
  }
}
