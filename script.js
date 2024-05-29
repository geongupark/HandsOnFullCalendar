document.addEventListener('DOMContentLoaded', function() {
  // Initialize FullCalendar
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,multiMonthYear,listYear",
      },
      initialView: 'dayGridMonth',
      selectable: true,
      dayMaxEvents: true,
      timeZone: 'local',  // Display events in local time
      events: [],
      eventClick: handleEventClick,
      dateClick: handleDateClick
  });
  calendar.render();

  // Initialize Materialize components
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);
  initializeChips();

  let selectedEvent = null;

  // Event handlers
  function handleDateClick(info) {
      selectedEvent = null;
      clearForm();
      const start = info.dateStr + 'T00:00';
      const end = info.dateStr + 'T01:00';
      document.getElementById('start').value = start;
      document.getElementById('end').value = end;
      M.updateTextFields();
      M.Modal.getInstance(document.getElementById('editModal')).open();
  }

  function handleEventClick(info) {
      selectedEvent = info.event;
      const { title, start, end, extendedProps } = selectedEvent;
      document.getElementById('viewTitle').innerText = title;
      document.getElementById('viewStart').innerText = formatDateTimeLocal(start);
      document.getElementById('viewEnd').innerText = formatDateTimeLocal(end);
      document.getElementById('viewBody').innerText = extendedProps.body;
      document.getElementById('viewTags').innerText = extendedProps.tags.join(', ');
      document.getElementById('viewUrl').href = extendedProps.url;
      document.getElementById('viewUrl').innerText = extendedProps.url;
      M.Modal.getInstance(document.getElementById('viewModal')).open();
  }

  document.getElementById('editButton').addEventListener('click', function() {
      if (selectedEvent) {
          const { title, start, end, extendedProps } = selectedEvent;
          populateForm(selectedEvent);
          document.getElementById('start').value = convertToLocalISO(start);
          document.getElementById('end').value = convertToLocalISO(end);
          M.Modal.getInstance(document.getElementById('viewModal')).close();
          M.Modal.getInstance(document.getElementById('editModal')).open();
      }
  });
  
  document.getElementById('deleteButton').addEventListener('click', function() {
    if (selectedEvent) {
        selectedEvent.remove();
        M.Modal.getInstance(document.getElementById('viewModal')).close();
    }
  });

  document.getElementById('saveButton').addEventListener('click', function() {
      const title = document.getElementById('title').value;
      const start = new Date(document.getElementById('start').value);
      const end = new Date(document.getElementById('end').value);
      const body = document.getElementById('body').value;
      const tags = M.Chips.getInstance(document.getElementById('tags')).chipsData.map(chip => chip.tag);
      const url = document.getElementById('url').value;

      if (selectedEvent) {
          selectedEvent.setProp('title', title);
          selectedEvent.setStart(start.toISOString());
          selectedEvent.setEnd(end.toISOString());
          selectedEvent.setExtendedProp('body', body);
          selectedEvent.setExtendedProp('tags', tags);
          selectedEvent.setExtendedProp('url', url);
      } else {
          calendar.addEvent({
              title: title,
              start: start.toISOString(),
              end: end.toISOString(),
              extendedProps: {
                  body: body,
                  tags: tags,
                  url: url
              }
          });
      }
  });

  function clearForm() {
      document.getElementById('title').value = '';
      document.getElementById('start').value = '';
      document.getElementById('end').value = '';
      document.getElementById('body').value = '';
      initializeChips([]);
      document.getElementById('url').value = '';
      M.updateTextFields();
  }

  function populateForm(event) {
      const { title, start, end, extendedProps } = event;
      document.getElementById('title').value = title;
      document.getElementById('start').value = new Date(start).toISOString().slice(0, 16);
      document.getElementById('end').value = new Date(end).toISOString().slice(0, 16);
      document.getElementById('body').value = extendedProps.body;
      initializeChips(extendedProps.tags.map(tag => ({ tag })));
      document.getElementById('url').value = extendedProps.url;
      M.updateTextFields();
  }

  function initializeChips(chipsData = []) {
      const chipsElem = document.querySelectorAll('.chips');
      M.Chips.init(chipsElem, {
          data: chipsData,
          placeholder: 'Enter tags',
          secondaryPlaceholder: '+Tag',
      });
  }

  function formatDateTimeLocal(date) {
      const options = {
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric',
          timeZoneName: 'short'
      };
      return new Intl.DateTimeFormat('default', options).format(new Date(date));
  }

  function convertToLocalISO(date) {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().slice(0, 16);
  }
  // Add event listeners to synchronize start and end dates
  document.getElementById('start').addEventListener('change', function() {
    const startDate = new Date(this.value);
    const endDate = new Date(document.getElementById('end').value);
    if (startDate >= endDate) {
        const newEndDate = new Date(startDate);
        newEndDate.setHours(startDate.getHours() + 1);
        document.getElementById('end').value = convertToLocalISO(newEndDate);
    }
  });

  document.getElementById('end').addEventListener('change', function() {
      const endDate = new Date(this.value);
      const startDate = new Date(document.getElementById('start').value);
      if (endDate <= startDate) {
          const newStartDate = new Date(endDate);
          newStartDate.setHours(endDate.getHours() - 1);
          document.getElementById('start').value = convertToLocalISO(newStartDate);
      }
  });
});
