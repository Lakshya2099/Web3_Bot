function staggeredMessages(callbacks, interval = 1200) {
  let delay = 0;
  for (const cb of callbacks) {
    setTimeout(cb, delay);
    delay += interval;
  }
}

module.exports = staggeredMessages;
