export function userName (user) {
  const firstName = user.get('firstName')
  const lastName = user.get('lastName')
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName || lastName) {
    return firstName || lastName
  } else {
    return 'No Name'
  }
}
