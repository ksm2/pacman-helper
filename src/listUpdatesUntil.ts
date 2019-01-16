import { TextFile } from './TextFile'
import { UpgradeInfo } from './UpgradeInfo'

const PACMAN_LOG = '/var/log/pacman.log'
const LINE_REGEXP = /^\[(?<datetime>\d{4}-\d{2}-\d{2} \d{2}:\d{2})] \[ALPM] upgraded (?<name>\S+) \((?<from>\S+) -> (?<to>\S+)\)$/

/**
 * Collect all upgrades performed until a given date.
 */
export async function listUpdatesUntil(until: Date): Promise<UpgradeInfo[]> {
  const upgrades: UpgradeInfo[] = []
  const file = new TextFile(PACMAN_LOG)
  try {
    await file.open()

    for await (const line of file) {
      const match = LINE_REGEXP.exec(line)
      if (match) {
        const info = match.groups
        const { name, from, to } = info
        const datetime = new Date(Date.parse(info.datetime))
        if (datetime < until) {
          break
        }

        upgrades.push({ name, from, to, datetime })
      }
    }
  } finally {
    await file.close()
  }

  return upgrades
}
