import child_process from 'child_process'
import { listUpdatesUntil } from './listUpdatesUntil'
import { pkgFile } from './pkgFile'

async function main() {
  const until = new Date(2019, 0, 15, 23, 59, 59)
  const upgrades = await listUpdatesUntil(until)

  const files = await Promise.all(upgrades.map(upgrade => pkgFile(upgrade.name, upgrade.from)))
  child_process.spawn('pacman', ['--noconfirm', '-U', ...files], { stdio: 'inherit' })
}

main()
