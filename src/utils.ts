export default {
  shout: (spirit: Spirit, message: string) => {
    spirit.shout(('' + message).substring(0, 20))
  }
}
