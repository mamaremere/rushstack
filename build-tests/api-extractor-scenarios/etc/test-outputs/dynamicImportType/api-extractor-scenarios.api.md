## API Report File for "api-extractor-scenarios"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { apiExtractorLib1Test } from 'api-extractor-lib1-test';
import { apiExtractorLib2Test } from 'api-extractor-lib2-test';
import { apiExtractorLib3Test } from 'api-extractor-lib3-test';
import * as Lib1 from 'api-extractor-lib1-test';
import { Lib2Class } from 'api-extractor-lib2-test';
import { Lib2Interface } from 'api-extractor-lib2-test';

// @public (undocumented)
export class Item {
    // (undocumented)
    lib1: apiExtractorLib1Test.Lib1Interface;
    // (undocumented)
    lib2: apiExtractorLib2Test.Lib2Interface;
    // (undocumented)
    lib3: apiExtractorLib3Test.Lib1Class;
    // Warning: (ae-forgotten-export) The symbol "Options" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    options: Options;
    // (undocumented)
    reExport: Lib2Class.Lib2Class;
}

export { Lib1 }

export { Lib2Interface }


// (No @packageDocumentation comment for this package)

```