module.exports = async (client, rateLimitInfo) => {
    client.logger.warn(`Ratelimit Hit (${millisToMinutesAndSeconds(rateLimitInfo.timeout)}) on Route ${rateLimitInfo.route}\n${rateLimitInfo.path}`)
};

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }