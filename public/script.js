$('#file-list').sortable({
  handle: '.drag-handle',
  axis: 'y',
  containment: 'parent',
  start: function (event, ui) {
    //console.log('start drag');
  },
  stop: function (event, ui) {
    //console.log('stop drag');
  }
});