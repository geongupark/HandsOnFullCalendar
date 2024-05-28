document.addEventListener('DOMContentLoaded', function() {
  // Initialize Materialize components
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);

  // Initialize flatpickr
  flatpickr(".datetimepicker", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
  });

  // Initialize Materialize chips
  var chipElems = document.querySelectorAll('.chips');
  var chipInstances = M.Chips.init(chipElems, {
      placeholder: 'Enter a tag',
      secondaryPlaceholder: '+Tag',
      autocompleteOptions: {
          data: {
              'Tag1': null,
              'Tag2': null,
              'Tag3': null
          },
          limit: Infinity,
          minLength: 1
      }
  });

  // Initialize FullCalendar
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridYear,listYear",
      },
      views: {
        dayGridYear: {
          type: "dayGrid",
          duration: { years: 1 },
          buttonText: "Year",
        },
      },
      dateClick: function(info) {
          openModal(info.dateStr);
      },
      eventClick: function(info) {
          openModal(info.event.startStr, info.event);
      },
      timeZone: "UTC",
      events: []
  });
  calendar.render();

  // Handle form submission to add/update event
  document.getElementById('eventForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var title = document.getElementById('title').value;
      var start = document.getElementById('start').value;
      var end = document.getElementById('end').value;
      var body = document.getElementById('body').value;
      var tags = M.Chips.getInstance(document.getElementById('tags')).chipsData.map(chip => chip.tag);
      var url = document.getElementById('url').value;

      var existingEvent = document.getElementById('eventForm').getAttribute('data-event-id');
      if (existingEvent) {
          var event = calendar.getEventById(existingEvent);
          event.setProp('title', title);
          event.setStart(start);
          event.setEnd(end);
          event.setExtendedProp('body', body);
          event.setExtendedProp('tags', tags);
          event.setExtendedProp('url', url);
      } else {
          calendar.addEvent({
              id: String(new Date().getTime()),
              title: title,
              start: start,
              end: end,
              extendedProps: {
                  body: body,
                  tags: tags,
                  url: url
              }
          });
      }

      var modal = M.Modal.getInstance(document.getElementById('eventModal'));
      modal.close();
      document.getElementById('eventForm').reset();
      M.Chips.getInstance(document.getElementById('tags')).chipsData = [];
      document.getElementById('eventForm').removeAttribute('data-event-id');
  });

  function openModal(dateStr, event = null) {
      var modal = M.Modal.getInstance(document.getElementById('eventModal'));
      modal.open();

      if (event) {
          document.getElementById('title').value = event.title;
          document.getElementById('start').value = event.start.toISOString().slice(0, 16);
          document.getElementById('end').value = event.end ? event.end.toISOString().slice(0, 16) : '';
          document.getElementById('body').value = event.extendedProps.body || '';
          var tags = event.extendedProps.tags || [];
          M.Chips.getInstance(document.getElementById('tags')).chipsData = tags.map(tag => ({ tag: tag }));
          document.getElementById('url').value = event.extendedProps.url || '';
          document.getElementById('eventForm').setAttribute('data-event-id', event.id);
      } else {
          document.getElementById('start').value = dateStr + 'T00:00';
          document.getElementById('end').value = dateStr + 'T00:00';
          document.getElementById('eventForm').reset();
          M.Chips.getInstance(document.getElementById('tags')).chipsData = [];
          document.getElementById('eventForm').removeAttribute('data-event-id');
      }

      M.updateTextFields();
  }
});