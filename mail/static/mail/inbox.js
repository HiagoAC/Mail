document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function archive(email_id, trueOrFalse) {

  //archive or unarchive email
  fetch(`emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: trueOrFalse
    })
  })
  .then(() => {
    // Update archive button
    if (document.querySelector('#archive-button').innerHTML === "Archive")
      document.querySelector('#archive-button').innerHTML = "Unarchive";
    else
      document.querySelector('#archive-button').innerHTML = "Archive";
  })

}

function compose_email(email) {

  // Show compose view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // New email
  if (email === undefined) {

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  // Reply 
  else {

    // Change title to Reply
    document.querySelector('#compose-title').value = "Reply";

    // Pre-fill fields
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `\n\n\n On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
  }
}

function load_email(email_id) {

  // Show email view and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Load email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    // Clear fields
    document.querySelectorAll('#email-subject', '#email-info', '#email-body')
    .forEach(node => node.innerHTML = "");

    //subject
    const subject = document.createElement("h2");
    subject.innerHTML = `${email.subject}`;
    document.querySelector('#email-subject').append(subject);

    //info
    const info = 
    `<strong>From: </strong> ${email.sender}
    <br><strong>To: </strong> ${email.recipients}
    <br><strong>Timestamp: </strong> ${email.timestamp}`;
    document.querySelector('#email-info').innerHTML = info;

    //body
    document.querySelector('#email-body').innerHTML = `${email.body}`;

    //archive button
    if (email.archived) {
      document.querySelector('#archive-button').innerHTML = "Unarchive";
      document.querySelector('#archive-button').onclick = () => archive(email.id, false);
    } else {
      document.querySelector('#archive-button').innerHTML = "Archive";
      document.querySelector('#archive-button').onclick = () => archive(email.id, true);
    }

    //reply button
    document.querySelector('#reply-button').onclick = () => compose_email(email);
  
  });

  // Update read
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  });

}

function load_mailbox(mailbox) {

  // Clear mailbox divs
  document.querySelector("#mailbox-content").innerHTML = "";
  
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => emails.forEach( email => {

    // Create html elements li>a>div.col
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    
    const row = document.createElement("div");
    row.onclick = () => load_email(email.id);
    row.className = "row";

    const column1 = document.createElement("div");
    column1.className = "col-2 font-weight-bold";

    // Update color if email has been read
    if (email.read)
      listItem.style.backgroundColor = "whitesmoke";

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

  event.preventDefault();

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: event.target.elements.recipients.value,
      subject: event.target.elements.subject.value,
      body: event.target.elements.body.value
    })
  })
  .then(response => {
    if (response.ok)
      load_mailbox("sent");
    else
      return response.json();
    })
    .then(result => alert(result.error));
}