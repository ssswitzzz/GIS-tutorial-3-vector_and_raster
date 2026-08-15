import React from 'react';
import { Composition } from 'remotion';
import { GISOpening } from './GISOpening';
import { EntityTypes } from './EntityTypes';
import { RasterConcept } from './RasterConcept';
import { VectorConcept } from './VectorConcept';
import { RasterCompression } from './RasterCompression';
import { VectorTopology } from './VectorTopology';
import { GISSummary } from './GISSummary';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="GISOpening"
        component={GISOpening}
        durationInFrames={1832}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="EntityTypes"
        component={EntityTypes}
        durationInFrames={4436}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="RasterConcept"
        component={RasterConcept}
        durationInFrames={7882}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="VectorConcept"
        component={VectorConcept}
        durationInFrames={7642}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="RasterCompression"
        component={RasterCompression}
        durationInFrames={10722}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="VectorTopology"
        component={VectorTopology}
        durationInFrames={7976}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="GISSummary"
        component={GISSummary}
        durationInFrames={3890}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};

