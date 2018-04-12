export function runMigrations(currentState) {
  const migrator = {migrated: false, newState: {...currentState}}
  switch (currentState.version) {
    case undefined:
      migrator.newState.userData.following = []
      migrator.newState.version = 1
      migrator.migrated = true
    //  Make sure to update initialState in reducer!
  }
  return migrator
}