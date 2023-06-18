const months = [
  'Juan',
  'Feb',
  'March',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
const daysWeek = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat']

export const getDates = (string: string) => {
  const date = new Date(string)

  const diffTime = Math.abs(new Date().getTime() - date.getTime())
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `${setZero(date.getHours())}:${setZero(date.getMinutes())}`
  }

  if (diffDays < 7) {
    return daysWeek[date.getDay()]
  }

  return `${months[date.getMonth()]}, ${setZero(date.getDate())} ${date.getFullYear()}`
}

const setZero = (number: number) => {
  if (number < 10) return `0${number}`

  return number
}

export const getBlocksDate = (string: string) => {
  const date = new Date(string)
  let newDate = `${months[date.getMonth()]}, ${date.getDate()}`

  if (date.getFullYear() < new Date().getFullYear()) {
    newDate += `${date.getFullYear()}`
  }

  return newDate
}

export const getTime = (string: string) => {
  const date = new Date(string)

  return `${setZero(date.getHours())}:${setZero(date.getMinutes())}`
}
