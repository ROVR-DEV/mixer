import React, { Ref } from 'react';

// eslint-disable-next-line import/no-named-as-default-member
export interface Timeline2ScrollProps extends React.ComponentProps<'div'> {
  timelineScrollWidth: number;
  scrollDivRef: Ref<HTMLDivElement>;
  scrollDivProps: React.ComponentProps<'div'>;
}
