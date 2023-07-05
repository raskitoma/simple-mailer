# RSKMailer

A simple API to receive request to send mail using a SMTP server or oAUTH2 (Gmail, Outlook, etc.)

## Features

- Simple API to send mail
- Have an option to allow send from specific domains only.
- Full log of events (access, errors, etc.)

## Prerequisites

- Docker and Docker Compose(as docker plugin) fully configured.
- Any SMTP server or oAUTH2 (Gmail, Outlook, etc.) account.
- A website that uses some kind of form to send mail that has the following fields:
  - `name`
  - `email`
  - `subject`
  - `message`

## Installation

- Git clone the repo and install the dependencies:
- Edit docker-compose.yml and change the environment variables to your needs. Check `docker-compose.sample.yml` for more details and guidance. This variables, following the details explained in the *Prerequisites* section will be as follows:

```yaml
    environment:
      TZ : America/New_York
      APP_PORT : 3001 #
      APP_DEBUG : 0 # This is the debug level for the app. 0 is no debug, 1 is debug.
      MAIL_ORIGIN : *
      MAIL_TRANSPORTER : |
                            {
                              "host" : "localhost",
                              "port" : 25,
                              "secure" : false
                            }
      MAIL_DEFAULT_RECEIVER : myfriend@mail.com
      MAIL_SENDER : mymail@mail.com
      MAIL_DEFAULT_SUBJECT : Hello from RSK Mailer
```

- Run `docker compose up -d` to start the container application
