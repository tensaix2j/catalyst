import React, { useState, useRef } from "react";
import { IPeer } from "../../peer/Peer";
import { Button } from "decentraland-ui";

type Message = {
  sender: string;
  content: string;
};

function MessageBubble(props: { message: Message; own?: boolean }) {
  const { sender, content } = props.message;

  const classes = ["message-bubble"];
  if (props.own) {
    classes.push("own");
  }

  return (
    <div className={classes.join(" ")}>
      <em className="sender">{sender}</em>
      <p className="content">{content}</p>
    </div>
  );
}

export function Chat(props: { peer: IPeer; room: string }) {
  //@ts-ignore
  const [messages, setMessages] = useState([
    // { sender: "migue", content: "hello" },
    // { sender: "pablo", content: "world!" }
  ] as Message[]);

  const [message, setMessage] = useState("");
  const messagesEndRef: any = useRef();

  props.peer.callback = (sender, room, payload) => {
    console.log(`received message from ${sender} on room ${room}`);
    if (room !== props.room) {
      return;
    }

    appendMessage(sender, payload);
  };

  function sendMessage() {
    appendMessage(props.peer.nickname, message);
    props.peer.sendMessage(props.room, message);
  }

  function appendMessage(sender, content) {
    setMessages([...messages, { sender, content }]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="chat">
      <h2>Welcome to the Chat {props.peer.nickname}</h2>
      <div className="room-title">
        <h3>{props.room}</h3>
      </div>
      <div className="messages-container">
        {messages.map((it, i) => (
          <MessageBubble
            message={it}
            key={i}
            own={it.sender === props.peer.nickname}
          />
        ))}
        <div
          style={{ float: "left", clear: "both" }}
          ref={messagesEndRef}
        ></div>
      </div>
      <div className="message-container">
        <textarea
          value={message}
          onChange={ev => setMessage(ev.currentTarget.value)}
          onKeyDown={ev => {
            if (message && ev.keyCode === 13 && ev.ctrlKey) sendMessage();
          }}
        />
        <Button
          className="send"
          primary
          disabled={!message}
          onClick={sendMessage}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
