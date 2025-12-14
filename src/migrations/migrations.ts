import { SaveState } from "../core/types"
import { uid } from "../core/utils"

interface Migration {
  from: string
  to: string
  migrate: (state: SaveState, new_version:string) => SaveState
}

const migrations: Migration[] = []

const migrate_0_0_3_to_0_1_0 = (state: any, new_version:string): any => {
  state.version = new_version
  state.audios.map((audio: any) => {
    audio.positions = [{
      track_id: audio.track_id,
      id: uid(),
      offset: audio.offset,
      duration: audio.duration
    }]

    audio.is_recoding = audio.recording

    delete audio.offset
    delete audio.active
    delete audio.track_id
  })
  return state
}

migrations.push({ from: "0.0.3", to: "0.1.0", migrate: migrate_0_0_3_to_0_1_0 })

export const run_migration_scripts = (state: any, npm_version: string): SaveState => {
  let curr_version = state.version ?? "0.0.3"

  if (curr_version === npm_version) {
    console.log("No migrations needed, config file up-to-date!")
    return state
  }

  console.log(`Current version: ${curr_version}, Target: ${npm_version}`)

  let ran = false

  for (const migration of migrations) {
    if (migration.from === curr_version) {
      console.log(`Migrating from: ${migration.from}, to: ${migration.to}`)
      state = migration.migrate(state, migration.to)
      curr_version = migration.to
      ran = true
    }
  }

  if (!ran || curr_version !== npm_version) {
    throw new Error(
      "Could not migrate state to target version. Manual migration required."
    )
  }

  return state
}