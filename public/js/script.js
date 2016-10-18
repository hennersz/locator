var socket = io.connect();
socket.on('locationUpdated', function (data) {
  Push.create("Location Updated!", {
      body: data.user + " is at " + data.location,
      icon: 'location.png',
      timeout: 4000,
      onClick: function () {
          window.focus();
          this.close();
      }
  });
});
