import React, { useCallback, useRef } from 'react';
import { P2PServiceInstance } from '../services/P2PService';
import { MESSAGE_EVENTS } from '../types/types';

export function useTouchEvents<T>(
  state: T,
  setState: React.Dispatch<React.SetStateAction<T>> | ((state: T) => void),
  playerRef: React.RefObject<PIXI.Sprite>,
  movePlayer?: () => void,
): {
  touchstart: (event: PIXI.InteractionEvent) => void;
  touchmove: () => void;
  touchend: () => void;
  touchendoutside: () => void;
} {
  const dragData = useRef<PIXI.InteractionData>();
  const dragging = useRef(false);

  const touchstart = useCallback(
    (event: PIXI.InteractionEvent) => {
      console.log('On drag start called'); // TODO: fix: called twice!
      setState({ ...state, alpha: 0.5 });
      dragData.current = event.data;
      dragging.current = true;
      event.stopPropagation();
    },
    [state, setState, dragData, dragging],
  );

  const touchend = useCallback(() => {
    setState({ ...state, alpha: 1.0 });
    dragData.current = undefined;
    dragging.current = false;
  }, [state, setState, dragData, dragging]);

  const touchmove = useCallback(() => {
    if (dragging.current && dragData.current && playerRef.current) {
      // console.log('move', event);
      const newPosition = dragData.current.getLocalPosition(
        playerRef.current.parent,
      );

      // send to remote peer
      try {
        P2PServiceInstance.sendMessage({
          event: MESSAGE_EVENTS.move_player,
          data: { y: newPosition.y },
        });
      } catch (err) {
        console.error(err);
      }

      setState({ ...state, y: newPosition.y });
    }
  }, [state, setState, dragData, dragging, playerRef]);

  return { touchstart, touchmove, touchend, touchendoutside: touchend };
}
