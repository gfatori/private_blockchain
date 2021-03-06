module.exports = class Star {
  constructor (dec, ra, story, mag, constelation) {
    if (story.length > 250) {
      return new Error('Story length limit is 250 characters, or 500 bytes.')
    }
    this.ra = ra,
    this.dec = dec,
    this.mag = mag,
    this.story = Buffer.from(story, 'ascii').toString('hex'),
    this.constelation = constelation
  }
}
