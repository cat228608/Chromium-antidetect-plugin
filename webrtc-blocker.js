(() => {
  const originalCreateOffer = RTCPeerConnection.prototype.createOffer;

  RTCPeerConnection.prototype.createOffer = function() {
    if (!this._patched) {
      this._patched = true;

      this.addEventListener('icecandidate', event => {
        if (event && event.candidate && event.candidate.candidate) {
          const modifiedCandidate = event.candidate.candidate.replace(
            /candidate:(\d+) (\w+) (\d+) (\d+\.\d+\.\d+\.\d+)/g,
            (match, p1, p2, p3, p4) => {
              return `candidate:${p1} ${p2} ${p3} 0.0.0.0`;
            }
          );

          Object.defineProperty(event.candidate, 'candidate', {
            value: modifiedCandidate,
            writable: false
          });
        }
      }, true);
    }
    return originalCreateOffer.apply(this, arguments);
  };
})();
