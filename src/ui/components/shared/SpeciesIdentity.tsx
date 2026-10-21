import React from 'react';
import {speciesProjection} from '../../../logic/preparation/species-identity';

export default function SpeciesIdentity({derived}:{derived:unknown}) {
    const species=speciesProjection(derived);
    return <span aria-label="Species" data-status={species.status} data-species-uuid={species.uuid??undefined} title={species.reason??species.provenance}>{species.display}</span>;
}
