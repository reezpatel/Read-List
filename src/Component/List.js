import React, { useState, useEffect } from "react";
import { ReactComponent as Trash } from "./../assets/trash.svg";
import "./list.scss";

const getImageUrl = url => {
  return `https://www.google.com/s2/favicons?domain=${url}`;
};

const ListItem = ({ item, swipeEvent, index }) => {
  const [translate, setTranslate] = useState(0);
  const [initialOffset, setInitialOffset] = useState(0);
  const [animate, setAnimate] = useState(false);

  const resetSwipe = e => {
    if (e.index !== index) {
      setAnimate(true);
      setTranslate(0);
    }
  };

  useEffect(() => {
    swipeEvent.addListener("swipe", resetSwipe);

    return () => {
      swipeEvent.removeListener("swipe", resetSwipe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, swipeEvent]);

  const handleTouchStart = e => {
    swipeEvent.emit("swipe", { index });

    const { targetTouches } = e;
    const { pageX } = targetTouches[0];
    setInitialOffset(pageX - translate);
  };

  const handleTouchMove = e => {
    const { targetTouches } = e;
    const { pageX } = targetTouches[0];

    const offset = pageX - initialOffset;

    if (offset > 0) {
      setTranslate(0);
    } else if (offset > -100) {
      setTranslate(offset);
    } else {
      setTranslate(-100);
    }
  };

  const handleTouchEnd = () => {
    setAnimate(true);
    if (translate < -50) {
      setTranslate(-100);
    } else {
      setTranslate(0);
    }
  };

  const handleTransitionEnd = () => {
    setAnimate(false);
  };

  const handleClick = () => {
    window.open(item.url);
  };

  const handleDelete = e => {
    navigator.serviceWorker.ready.then(registartion => {
      registartion.active.postMessage({
        action: "DELETE_ITEM",
        data: item.url
      });
    });
    e.preventDefault();
  };

  return (
    <div className="list-item">
      <div className="list-actions">
        <Trash onClick={handleDelete} />
      </div>
      <div
        onClick={handleClick}
        className="list-element"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translate(${translate}px)`,
          transition: animate ? `all 0.2s linear` : ""
        }}
      >
        <img src={getImageUrl(item.url)} alt={item.title} />
        <span>{item.title}</span>
      </div>
    </div>
  );
};

export default ListItem;
