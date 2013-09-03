# Checkin Server

A simple service that allows users to check into a chat room and will also return a list of checked in users. Simply include the file and use the API as follows:

```js
Chatroom.getUsers('roomID', function(users){
    //do something with the list of users	
});

//kikUserData is the JSON object returned from cards.kik.getUser
Chatroom.checkIn('roomID', kikUserData, function(users){
    //do something with the list of users	
});
```

## Links

- [Link to JS API](http://cards-chatroom.herokuapp.com/chatroom.js)