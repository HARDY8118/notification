# Notification system 

Sample app to send notification via Server Sent Events using RabbitMQ

# Technologies used
- Node.js
- Docker
- RabbitMQ
- Nginx
- Svelte

# Commands
## Start containers
```bash
./up.sh build
``` 

## Stop containers
```bash
./down.sh
```

# Send notification
```bash
curl http://localhost:3000/post/$(channel)?msg=$(msg)
```

# Routes

| ROUTE | DESCRIPTION |
|---|---|
| **GET /** | Check server status |
| **GET /subscribe/_Channel_Name_** | Subscribe via event stream |
| **GET /post/_Channel_Name_?msg=_Message_** | Send Message to channel |