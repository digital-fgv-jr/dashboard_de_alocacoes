import React from 'react';
import { initializeBlock } from '@airtable/blocks/ui';
import { run } from './src/main';


initializeBlock(async() => {
    await run();
    return null;

})
