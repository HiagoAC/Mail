document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => emails.forEach( email => {

    // Create html elements li>div.row
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    const row = document.createElement("div");

    row.className = "row";

    const column1 = document.createElement("div");
    column1.className = "col-2";

    // Sent => Shows recipients . Archived/Inbox => Shows sender
    if (mailbox === "sent") {
        column1.innerHTML = `${email.recipients}`;
    } else {
        column1.innerHTML = `${email.sender}`;
    }

    const column2 = document.createElement("div");
    column2.className = "col-7";
    column2.innerHTML = `${email.subject}`;

    const column3 = document.createElement("div");
    column3.className = "col-3 text-right";
    column3.innerHTML = `${email.timestamp}`;

    // Nest elements col>row>li
    row.append(column1, column2, column3);
    listItem.append(row);
    document.querySelector("#mailbox-content").append(listItem);
    
  }))

}

function send_email(event) { 
  console.log(event.target.elements.sender.value);

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: event.target.elements.recipients.value,
      subject: event.target.elements.subject.value,
      body: event.target.elements.body.value
    })
  })
  .then(response => response.json())
  .then(result => console.log(result));

  load_mailbox("sent")
}