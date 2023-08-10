import React from 'react';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';

type IResizableComponentProps = {
  children: React.ReactNode;
  position: {
    top: string;
    left: string;
  };
};

export default function ResizableDraggableComponent({
  children,
  position,
}: IResizableComponentProps) {
  return (
    <Draggable handle='.DRAG_HANDLE'>
      <Resizable
        className='flex-col rounded-sm text-sm shadow-lg bg-white/[.07] backdrop-blur-md z-[10000]'
        style={{ position: 'absolute', ...position }}
        defaultSize={{ width: 300, height: 350 }}
        minWidth={300}
        minHeight={350}>
        {children}
      </Resizable>
    </Draggable>
  );
}
