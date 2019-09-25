import React, { useState, useEffect } from "react";

import { ReactComponent as Empty } from "./../assets/empty.svg";
import ListItem from "./List";
import { EventEmitter } from "events";

const Container = () => {
  const event = new EventEmitter();
  const [list, setList] = useState([]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", e => {
        const {
          data: { action, data }
        } = e;

        switch (action) {
          case "LIST": {
            setList(data);
            break;
          }
          default: {
            console.error("Invalid Action");
          }
        }
      });

      navigator.serviceWorker.ready.then(registartion => {
        registartion.active.postMessage({ action: "GET_LIST" });
      });
    }
  }, []);

  return (
    <div className="container">
      <header>
        <p className="heading">My Reads</p>
        <p className="hint">Save Link to View for Later</p>
      </header>
      <div className="content">
        {!list || list.length === 0 ? (
          <div className="empty">
            <Empty />
            <p>Shared links will come here...</p>
          </div>
        ) : (
          <div className="list-wrapper">
            {list.map((item, index) => (
              <ListItem
                key={`${item}-${index}`}
                item={item}
                index={index}
                swipeEvent={event}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Container;
